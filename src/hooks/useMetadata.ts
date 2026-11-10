import { createContext, useContext, useEffect } from 'react';
import { applyHeadTags, headTags, type PageMeta } from '../seo/head';

/**
 * Set by the prerenderer (src/entry-server.tsx) to capture the page's
 * metadata while rendering, so it lands in the static HTML <head>.
 */
export interface MetadataCollector {
  set: (meta: PageMeta) => void;
}

export const MetadataContext = createContext<MetadataCollector | null>(null);

/**
 * Declares the page's <head>: title, description, canonical, Open Graph and
 * JSON-LD. Prerendered pages already ship these tags; in the browser this
 * replaces them after client-side navigation. Pass null to leave the head to
 * a child, as BlogPost does when it renders <NotFound>.
 */
export const useMetadata = (meta: PageMeta | null) => {
  const collector = useContext(MetadataContext);
  if (collector && meta) collector.set(meta);

  // Effects compare dependencies by identity; the serialised form changes
  // only when the metadata does.
  const key = meta ? JSON.stringify(meta) : '';
  useEffect(() => {
    if (key) applyHeadTags(headTags(JSON.parse(key) as PageMeta));
  }, [key]);
};
