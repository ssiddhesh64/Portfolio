import React, { useEffect, useId, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import properties from 'react-syntax-highlighter/dist/esm/languages/prism/properties';
import { Check, Copy } from 'lucide-react';
import { useAppliedTheme } from '../lib/theme';

// Only the grammars the articles use; full Prism ships hundreds.
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('properties', properties);

const PLAIN = new Set(['text', 'plaintext', 'txt']);

/** Token colours come from CSS custom properties, so code follows the theme. */
const codeTheme: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': { color: 'var(--code-fg)', background: 'none' },
  'pre[class*="language-"]': { color: 'var(--code-fg)', background: 'none' },
  comment: { color: 'var(--code-comment)', fontStyle: 'italic' },
  prolog: { color: 'var(--code-comment)' },
  punctuation: { color: 'var(--code-punct)' },
  operator: { color: 'var(--code-punct)' },
  keyword: { color: 'var(--code-keyword)', fontWeight: 600 },
  boolean: { color: 'var(--code-keyword)' },
  builtin: { color: 'var(--code-type)' },
  'class-name': { color: 'var(--code-type)' },
  annotation: { color: 'var(--code-annotation)' },
  string: { color: 'var(--code-string)' },
  char: { color: 'var(--code-string)' },
  'attr-value': { color: 'var(--code-string)' },
  number: { color: 'var(--code-number)' },
  function: { color: 'var(--code-fn)' },
  property: { color: 'var(--code-fn)' },
  'attr-name': { color: 'var(--code-fn)' },
  variable: { color: 'var(--code-fg)' },
};

const CopyButton: React.FC<{ code: string }> = ({ code }) => {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2000);
  };

  return (
    <button type="button" onClick={copy} className="code__copy">
      {state === 'copied' ? (
        <Check size={14} aria-hidden />
      ) : (
        <Copy size={14} aria-hidden />
      )}
      <span aria-live="polite">
        {state === 'copied'
          ? 'Copied'
          : state === 'failed'
            ? 'Copy blocked'
            : 'Copy'}
      </span>
    </button>
  );
};

const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const theme = useAppliedTheme();
  const rawId = useId();
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, '')}-${theme}`;
    // Mermaid is large; load it only when an article contains a diagram.
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
  }, [chart, theme, rawId]);

  if (failed) {
    return (
      <div className="diagram diagram--error" role="note">
        <p>This diagram could not be drawn. Its source is shown instead.</p>
        <pre>
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="diagram diagram--loading" role="status">
        <span className="visually-hidden">Drawing diagram</span>
      </div>
    );
  }

  return <div className="diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
};

const components: Components = {
  code(props) {
    const { children, className, node: _node, ...rest } = props;
    void _node;
    const match = /language-(\w+)/.exec(className || '');
    const raw = String(children);
    // Inline code has no language class and no line breaks.
    if (!match && !raw.includes('\n')) {
      return (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    }
    const language = match ? match[1] : 'text';
    const code = raw.replace(/\n$/, '');

    if (language === 'mermaid') return <Mermaid chart={code} />;

    return (
      <div className="code">
        <div className="code__bar">
          <span className="code__lang">
            {PLAIN.has(language) ? 'text' : language}
          </span>
          <CopyButton code={code} />
        </div>
        {PLAIN.has(language) ? (
          <pre className="code__pre">
            <code>{code}</code>
          </pre>
        ) : (
          <SyntaxHighlighter
            language={language}
            style={codeTheme}
            PreTag="pre"
            className="code__pre"
            customStyle={{ margin: 0, background: 'none' }}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>
    );
  },
  pre({ children }) {
    // Code blocks render their own wrapper; avoid a <pre> inside a <pre>.
    return <>{children}</>;
  },
  table({ children }) {
    return (
      <div className="table-scroll" tabIndex={0}>
        <table>{children}</table>
      </div>
    );
  },
  a({ href, children }) {
    const external = href?.startsWith('http');
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  },
};

export const Markdown: React.FC<{ source: string }> = ({ source }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
    {source}
  </ReactMarkdown>
);
