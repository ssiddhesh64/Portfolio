/**
 * Build-time renderer. scripts/prerender.ts loads the SSR build of this file
 * and writes one static HTML file per route, so crawlers and link previews
 * get the full page and its <head> without running JavaScript.
 */
import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App from './App';
import { MetadataContext, type MetadataCollector } from './hooks/useMetadata';
import { blogPosts, categoriesWithPosts, categoryPath } from './data/blogData';
import { headTags, renderHeadTags, type PageMeta } from './seo/head';
import { absoluteUrl } from './lib/site';

export interface PrerenderedPage {
  html: string;
  head: string;
}

export async function render(url: string): Promise<PrerenderedPage> {
  let meta: PageMeta | undefined;
  const collector: MetadataCollector = { set: (m) => (meta = m) };

  // prerender() waits for every lazy route and article body to load.
  const { prelude } = await prerender(
    <StrictMode>
      <MetadataContext.Provider value={collector}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </MetadataContext.Provider>
    </StrictMode>,
    {
      // React outlines any Suspense boundary larger than this (~12 KB by
      // default) as a hidden segment plus an inline script that reveals it,
      // so a long page paints early when streamed. A static file gains
      // nothing from that, and the content would be invisible without
      // JavaScript and blocked by the CSP. Keep every boundary inline.
      progressiveChunkSize: Number.POSITIVE_INFINITY,
    },
  );
  const html = await new Response(prelude).text();

  if (html.includes('<script')) {
    throw new Error(`Prerender: ${url} streamed a Suspense boundary.`);
  }
  if (!meta) throw new Error(`Prerender: ${url} declared no metadata.`);
  return { html, head: renderHeadTags(headTags(meta)) };
}

export interface RouteInfo {
  path: string;
  /** YYYY-MM-DD the page's content last changed, for the sitemap. */
  lastmod: string;
  /** Source modules whose CSS the page needs on first paint. */
  modules: string[];
}

const latest = (dates: string[]) => dates.reduce((a, b) => (a > b ? a : b));
const lastChange = (p: (typeof blogPosts)[number]) => p.updated ?? p.date;
const articleModule = (p: (typeof blogPosts)[number]) =>
  `src/content/blogs/${p.category.id}/${p.id}/index.mdx`;

/** Every indexable page. New articles and categories appear automatically. */
export function routes(): RouteInfo[] {
  const newest = blogPosts.length
    ? latest(blogPosts.map(lastChange))
    : undefined;
  const list: RouteInfo[] = [];
  // Home lists the latest article, so it changes when one is published.
  list.push({ path: '/', lastmod: newest ?? '', modules: [] });
  if (blogPosts.length) {
    list.push({
      path: '/blog',
      lastmod: newest!,
      modules: ['src/pages/BlogIndex.tsx'],
    });
  }
  for (const c of categoriesWithPosts) {
    list.push({
      path: categoryPath(c),
      lastmod: latest(c.posts.map(lastChange)),
      modules: ['src/pages/BlogCategory.tsx'],
    });
  }
  for (const p of blogPosts) {
    list.push({
      path: `/blog/${p.id}`,
      lastmod: lastChange(p),
      modules: ['src/pages/BlogPost.tsx', articleModule(p)],
    });
  }
  return list;
}

export { absoluteUrl };
