import React from 'react';
import { useAppliedTheme } from '../../lib/theme';
import { Zoomable } from './Lightbox';

interface FigureProps {
  /** One image for both themes. Import it: `import arch from './arch.svg'`. */
  src?: string;
  /** Theme-specific versions, e.g. Excalidraw exports for light and dark. */
  light?: string;
  dark?: string;
  /** Describes what the image shows, for screen readers. Required. */
  alt: string;
  caption?: React.ReactNode;
  width?: number;
  height?: number;
  /** Click to view full screen. On by default. */
  zoom?: boolean;
}

/**
 * An image or exported diagram with an optional caption, light and dark
 * variants, and a full-screen view for diagrams too detailed for the column.
 *
 *   import archLight from './architecture.light.svg';
 *   import archDark from './architecture.dark.svg';
 *
 *   <Figure light={archLight} dark={archDark}
 *     alt="Clients reach the proxy tier, which routes to three file servers"
 *     caption="Every push lands on three replicas before it is acknowledged." />
 */
export const Figure: React.FC<FigureProps> = ({
  src,
  light,
  dark,
  alt,
  caption,
  width,
  height,
  zoom = true,
}) => {
  const theme = useAppliedTheme();
  const image = (theme === 'dark' ? dark : light) ?? src ?? light ?? dark;
  if (!image) return null;

  const img = (
    <img
      src={image}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    />
  );

  return (
    <figure className="figure">
      {zoom ? (
        <Zoomable
          label={alt}
          caption={caption}
          full={<img src={image} alt="" className="lightbox__image" />}
        >
          {img}
        </Zoomable>
      ) : (
        <div className="figure__frame">{img}</div>
      )}
      {caption && (
        <figcaption className="figure__caption">{caption}</figcaption>
      )}
    </figure>
  );
};
