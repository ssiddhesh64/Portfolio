import { useEffect } from 'react';

interface MetadataProps {
  title: string;
  description: string;
  canonicalPath?: string;
}

export const useMetadata = ({
  title,
  description,
  canonicalPath,
}: MetadataProps) => {
  useEffect(() => {
    // 1. Update title
    document.title = title;

    // Helper function to update meta tags
    const updateMetaTag = (
      selector: string,
      attribute: string,
      value: string,
    ) => {
      let element = document.querySelector(selector);
      if (!element) {
        // If it doesn't exist, dynamically create it
        if (selector.startsWith('meta[')) {
          element = document.createElement('meta');
          const match = selector.match(/\[(name|property)="([^"]+)"\]/);
          if (match) {
            element.setAttribute(match[1], match[2]);
          }
          document.head.appendChild(element);
        }
      }
      if (element) {
        element.setAttribute(attribute, value);
      }
    };

    // 2. Update description
    updateMetaTag('meta[name="description"]', 'content', description);

    // 3. Update canonical link
    const path =
      canonicalPath !== undefined ? canonicalPath : window.location.pathname;
    // Normalize path to avoid double trailing slashes
    const cleanPath =
      path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const fullCanonicalUrl = `https://siddheshsawant.in${cleanPath}`;

    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', fullCanonicalUrl);

    // 4. Update Open Graph details
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="og:url"]', 'content', fullCanonicalUrl);

    // 5. Update Twitter Card details
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);
  }, [title, description, canonicalPath]);
};
