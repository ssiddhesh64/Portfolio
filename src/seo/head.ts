import {
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  absoluteUrl,
} from '../lib/site';

/** Everything a page says about itself in <head>. */
export interface PageMeta {
  /** The full <title>, already including the site name where wanted. */
  title: string;
  /** Meta description. Aim for 120–160 characters. */
  description: string;
  /** Site path, e.g. "/blog/hashset_internals". Becomes the canonical URL. */
  path: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  /** Social preview image; defaults to the site's og-image.png. */
  image?: { url: string; width: number; height: number; alt: string };
  /** Articles only. YYYY-MM-DD. */
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  /** JSON-LD objects, emitted as one @graph. */
  jsonLd?: object[];
}

export interface HeadTag {
  tag: 'title' | 'meta' | 'link' | 'script';
  attrs: Record<string, string>;
  text?: string;
}

const INDEX = 'index, follow, max-image-preview:large, max-snippet:-1';

/** The tags for one page. Rendered by the prerenderer and by the client. */
export function headTags(meta: PageMeta): HeadTag[] {
  const url = absoluteUrl(meta.path);
  const image = meta.image ?? {
    ...DEFAULT_OG_IMAGE,
    url: absoluteUrl(DEFAULT_OG_IMAGE.path),
  };
  const type = meta.type ?? 'website';

  const name = (n: string, content: string): HeadTag => ({
    tag: 'meta',
    attrs: { name: n, content },
  });
  const prop = (p: string, content: string): HeadTag => ({
    tag: 'meta',
    attrs: { property: p, content },
  });

  const tags: HeadTag[] = [
    { tag: 'title', attrs: {}, text: meta.title },
    name('description', meta.description),
    name('robots', meta.noindex ? 'noindex, follow' : INDEX),
  ];

  // A page that asks not to be indexed shouldn't nominate a canonical.
  if (!meta.noindex) {
    tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url } });
  }

  tags.push(
    prop('og:site_name', SITE_NAME),
    prop('og:locale', SITE_LOCALE),
    prop('og:type', type),
    prop('og:title', meta.title),
    prop('og:description', meta.description),
    prop('og:url', url),
    prop('og:image', image.url),
    prop('og:image:width', String(image.width)),
    prop('og:image:height', String(image.height)),
    prop('og:image:alt', image.alt),
    name('twitter:card', 'summary_large_image'),
    name('twitter:title', meta.title),
    name('twitter:description', meta.description),
    name('twitter:image', image.url),
    name('twitter:image:alt', image.alt),
  );

  if (type === 'article') {
    if (meta.publishedTime) {
      tags.push(prop('article:published_time', meta.publishedTime));
    }
    if (meta.modifiedTime) {
      tags.push(prop('article:modified_time', meta.modifiedTime));
    }
    tags.push(prop('article:author', absoluteUrl('/')));
    if (meta.section) tags.push(prop('article:section', meta.section));
    for (const tag of meta.tags ?? []) tags.push(prop('article:tag', tag));
  }

  if (meta.jsonLd?.length) {
    tags.push({
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      text: serializeJsonLd(meta.jsonLd),
    });
  }

  return tags;
}

/** One @graph; "<" escaped so a string can never close the script element. */
const serializeJsonLd = (nodes: object[]) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(
    /</g,
    '\\u003c',
  );

/** Marks the elements this module owns, so the client can replace them. */
const OWNED = 'data-head';

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Static HTML for the prerenderer. */
export function renderHeadTags(tags: HeadTag[]): string {
  return tags
    .map(({ tag, attrs, text }) => {
      const a = Object.entries({ ...attrs, [OWNED]: '' })
        .map(([k, v]) => (v ? ` ${k}="${escapeHtml(v)}"` : ` ${k}`))
        .join('');
      if (tag === 'meta' || tag === 'link') return `<${tag}${a}>`;
      // JSON-LD is already escaped; a title needs HTML escaping.
      const body = tag === 'script' ? (text ?? '') : escapeHtml(text ?? '');
      return `<${tag}${a}>${body}</${tag}>`;
    })
    .join('\n    ');
}

/** Replaces the owned tags in document.head after client navigation. */
export function applyHeadTags(tags: HeadTag[]): void {
  const head = document.head;
  head.querySelectorAll(`[${OWNED}]`).forEach((el) => el.remove());
  for (const { tag, attrs, text } of tags) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.setAttribute(OWNED, '');
    if (text !== undefined) el.textContent = text;
    head.appendChild(el);
  }
}
