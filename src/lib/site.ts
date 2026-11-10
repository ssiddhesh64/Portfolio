/**
 * Site-wide SEO settings. Every absolute URL the site emits (canonical,
 * og:url, sitemap, JSON-LD, share links) is built from SITE_URL, so it must
 * be the host the deployment actually serves without redirecting. Vercel
 * redirects siddheshsawant.in to www.siddheshsawant.in; if that is ever
 * flipped in the Vercel domain settings, change this one line to match.
 */
export const SITE_URL = 'https://www.siddheshsawant.in';

export const SITE_NAME = 'Siddhesh Sawant';

export const SITE_LOCALE = 'en_US';
export const SITE_LANGUAGE = 'en';

/** The default social preview image: public/og-image.png. */
export const DEFAULT_OG_IMAGE = {
  path: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Siddhesh Sawant, backend and machine learning engineer',
};

/**
 * "/blog/post/" -> "https://www.siddheshsawant.in/blog/post". The home page
 * keeps its slash; every other URL has none, matching vercel.json's
 * trailingSlash: false.
 */
export const absoluteUrl = (path: string): string => {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, '');
  return `${SITE_URL}${clean || '/'}`;
};
