import { useEffect } from 'react';

const SITE_URL = 'https://siddheshsawant.in';

interface MetadataProps {
  title: string;
  description: string;
  /** Defaults to the current path. */
  canonicalPath?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

const setMeta = (attr: 'name' | 'property', key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
};

export const useMetadata = ({
  title,
  description,
  canonicalPath,
  type = 'website',
  noindex = false,
}: MetadataProps) => {
  useEffect(() => {
    const path = canonicalPath ?? window.location.pathname;
    const url = SITE_URL + (path.length > 1 ? path.replace(/\/$/, '') : '');

    document.title = title;

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex' : 'index, follow');
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
  }, [title, description, canonicalPath, type, noindex]);
};
