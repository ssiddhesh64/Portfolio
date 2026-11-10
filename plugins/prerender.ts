import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build, type Manifest, type Plugin, type ResolvedConfig } from 'vite';

/**
 * Writes every route as static HTML after the client build.
 *
 * The site is a React SPA, so without this every URL would serve the same
 * empty index.html with the home page's title and canonical, and crawlers
 * and link previews would see neither the content nor the right metadata.
 * After `vite build`, this plugin:
 *
 *   1. builds src/entry-server.tsx for Node,
 *   2. renders each route from its routes() list to HTML, with that page's
 *      <head> (title, description, canonical, Open Graph, JSON-LD) and the
 *      stylesheets its own chunks need (KaTeX, for example), so the
 *      prerendered markup is styled before any JavaScript runs,
 *   3. writes dist/<path>.html (served at /<path> by vercel.json's
 *      cleanUrls), dist/404.html, and dist/sitemap.xml.
 *
 * The client then hydrates the prerendered markup (src/main.tsx).
 */

const SSR_ENTRY = 'src/entry-server.tsx';
const SSR_OUT = 'node_modules/.prerender';

interface RouteInfo {
  path: string;
  lastmod: string;
  modules: string[];
}

interface ServerEntry {
  render: (url: string) => Promise<{ html: string; head: string }>;
  routes: () => RouteInfo[];
  absoluteUrl: (path: string) => string;
}

/** "/" -> index.html, "/blog/x" -> blog/x.html */
const fileFor = (path: string) =>
  path === '/' ? 'index.html' : `${path.replace(/^\/|\/$/g, '')}.html`;

const escapeAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/**
 * The stylesheets a set of source modules pull in statically.
 *
 * Route JavaScript is deliberately not preloaded: the HTML already holds the
 * content, so hydration can wait. Measured on an article, modulepreloading
 * the route chunks competed with the CSS on a slow connection and cost
 * ~0.5 s of FCP and ~250 ms of blocking time.
 */
function stylesheetsFor(manifest: Manifest, modules: string[]) {
  const seen = new Set<string>();
  const css = new Set<string>();
  const visit = (key: string) => {
    const chunk = manifest[key];
    if (!chunk || seen.has(key)) return;
    seen.add(key);
    chunk.css?.forEach((f) => css.add(f));
    chunk.imports?.forEach(visit);
  };
  modules.forEach(visit);
  return css;
}

/**
 * The site's Content-Security-Policy, as a <meta> so the hashes of the
 * page's inline scripts (the theme script in index.html) are computed from
 * the HTML they ship in. frame-ancestors can't
 * be set from a <meta>; vercel.json sends it as a header.
 * style-src allows inline styles: KaTeX and Mermaid output use them.
 */
function contentSecurityPolicy(page: string) {
  const hashes = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, code]) =>
      `'sha256-${createHash('sha256').update(code).digest('base64')}'`,
  );
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function sitemap(entry: ServerEntry, routes: RouteInfo[]) {
  const urls = routes
    .map(
      (r) =>
        `  <url>\n    <loc>${entry.absoluteUrl(r.path)}</loc>${
          r.lastmod ? `\n    <lastmod>${r.lastmod}</lastmod>` : ''
        }\n  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function prerender(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'prerender',
    // Client build only: the SSR build below loads this config again.
    apply: (cfg, env) =>
      env.command === 'build' && !env.isSsrBuild && !cfg.build?.ssr,
    config: () => ({ build: { manifest: true } }),
    configResolved(resolved) {
      config = resolved;
    },
    async closeBundle() {
      const root = config.root;
      const outDir = resolve(root, config.build.outDir);
      const ssrOut = resolve(root, SSR_OUT);

      await build({
        root,
        configFile: config.configFile,
        mode: config.mode,
        logLevel: 'warn',
        build: {
          ssr: SSR_ENTRY,
          outDir: ssrOut,
          emptyOutDir: true,
          copyPublicDir: false,
          manifest: false,
        },
      });

      const entry = (await import(
        pathToFileURL(join(ssrOut, 'entry-server.js')).href
      )) as ServerEntry;
      const manifestPath = join(outDir, '.vite', 'manifest.json');
      const manifest = JSON.parse(
        await readFile(manifestPath, 'utf8'),
      ) as Manifest;
      const template = await readFile(join(outDir, 'index.html'), 'utf8');
      if (!template.includes('<!--app-head-->')) {
        throw new Error('Prerender: index.html is missing <!--app-head-->.');
      }

      // Already loaded by every page through index.html.
      const shared = stylesheetsFor(
        manifest,
        Object.keys(manifest).filter((k) => manifest[k].isEntry),
      );

      const page = async (path: string, modules: string[]) => {
        const { html, head } = await entry.render(path);
        const links = [...stylesheetsFor(manifest, modules)]
          .filter((f) => !shared.has(f))
          .map((f) => `<link rel="stylesheet" href="/${f}">`);
        // Function replacers: page HTML is full of "$", which a replacement
        // string would read as $&, $' and similar patterns.
        const out = template
          .replace('<!--app-head-->', () => [head, ...links].join('\n    '))
          .replace(
            '<div id="root"></div>',
            () =>
              `<div id="root" data-route="${escapeAttr(path)}">${html}</div>`,
          );
        const csp = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(out)}">`;
        return out.replace(
          '<meta charset="UTF-8" />',
          () => `<meta charset="UTF-8" />\n    ${csp}`,
        );
      };

      const write = async (file: string, content: string) => {
        const target = join(outDir, file);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, content);
      };

      const routes = entry.routes();
      for (const r of routes)
        await write(fileFor(r.path), await page(r.path, r.modules));
      // Vercel serves this, with a 404 status, for any URL with no file.
      await write('404.html', await page('/404', ['src/pages/NotFound.tsx']));
      await write('sitemap.xml', sitemap(entry, routes));

      // The manifest would otherwise be deployed as a public file.
      await rm(join(outDir, '.vite'), { recursive: true, force: true });
      await rm(ssrOut, { recursive: true, force: true });

      config.logger.info(
        `prerendered ${routes.length} routes, 404.html and sitemap.xml`,
      );
    },
  };
}
