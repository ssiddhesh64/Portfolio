import React, { useEffect, useState } from 'react';
import { useAppliedTheme } from '../../lib/theme';
import { Zoomable } from './Lightbox';

interface MermaidProps {
  chart: string;
  caption?: string;
}

/**
 * Draws a ```mermaid fence (see plugins/mdx/remark-mermaid.ts). Mermaid is
 * large, so it loads only when an article contains a diagram, and redraws
 * when the theme changes.
 */
/**
 * Every mermaid.render() call needs an id no other call has used. When a
 * render finishes, Mermaid removes the element with its id from the document
 * as cleanup. If an abandoned render (StrictMode's double effect, a theme
 * switch mid-render) shared an id with the live one, that cleanup deleted
 * the diagram already on the page, leaving an empty frame.
 */
let renders = 0;

export const Mermaid: React.FC<MermaidProps> = ({ chart, caption }) => {
  const theme = useAppliedTheme();
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    renders += 1;
    const id = `mermaid-${renders}`;
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        // Mermaid's colour parser only accepts hex/rgb, so tokens must stay hex.
        const css = getComputedStyle(document.documentElement);
        const v = (name: string) => css.getPropertyValue(name).trim();
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          fontFamily: v('--font-sans'),
          flowchart: { nodeSpacing: 30, rankSpacing: 40, padding: 12 },
          sequence: { mirrorActors: false, actorMargin: 32, noteMargin: 8 },
          themeVariables: {
            background: v('--bg-primary'),
            primaryColor: v('--bg-secondary'),
            primaryBorderColor: v('--text-primary'),
            primaryTextColor: v('--text-primary'),
            secondaryColor: v('--bg-primary'),
            tertiaryColor: v('--bg-primary'),
            lineColor: v('--text-secondary'),
            textColor: v('--text-primary'),
            noteBkgColor: v('--accent-wash'),
            noteTextColor: v('--text-primary'),
            noteBorderColor: v('--accent-primary'),
            clusterBkg: v('--bg-primary'),
            clusterBorder: v('--border'),
          },
        });
        const { svg: out } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(out);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chart, theme]);

  let body: React.ReactNode;
  if (failed) {
    body = (
      <div className="diagram diagram--error" role="note">
        <p>This diagram could not be drawn. Its source is shown instead.</p>
        <pre>
          <code>{chart}</code>
        </pre>
      </div>
    );
  } else if (!svg) {
    body = (
      <div className="diagram diagram--loading" role="status">
        <span className="visually-hidden">Drawing diagram</span>
      </div>
    );
  } else {
    const label = caption ?? 'Diagram';
    body = (
      <Zoomable
        label={label}
        caption={caption}
        full={
          <div
            className="diagram diagram--full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        }
      >
        <div
          className="diagram"
          role="img"
          aria-label={label}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </Zoomable>
    );
  }

  return (
    <figure className="figure">
      {body}
      {caption && (
        <figcaption className="figure__caption">{caption}</figcaption>
      )}
    </figure>
  );
};
