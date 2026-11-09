import React, { useRef } from 'react';
import { Check, Copy } from 'lucide-react';
import { useCopy } from './useCopy';

const PLAIN = new Set(['plaintext', 'text', 'txt', 'plain']);

type PreProps = React.ComponentPropsWithoutRef<'pre'> & {
  'data-language'?: string;
  'data-title'?: string;
};

/** The code as a reader would type it: lines marked as removed are left out. */
const copyableText = (pre: HTMLPreElement): string => {
  const clone = pre.cloneNode(true) as HTMLPreElement;
  clone.querySelectorAll('.diff.remove').forEach((line) => {
    // Each line is followed by a newline text node; drop both.
    line.nextSibling?.remove();
    line.remove();
  });
  return (clone.textContent ?? '').replace(/\n$/, '');
};

/**
 * The <pre> that rehype-pretty-code produces, with a bar above it carrying
 * the file name (```java title="UserService.java"), the language and a copy
 * button.
 */
export const CodeBlock: React.FC<PreProps> = ({
  children,
  'data-language': language = 'plaintext',
  'data-title': title,
  className,
  ...rest
}) => {
  const ref = useRef<HTMLPreElement>(null);
  const { state, copy } = useCopy();
  const lang = PLAIN.has(language) ? 'text' : language;

  return (
    <div className="code">
      <div className="code__bar">
        {title ? (
          <span className="code__title">{title}</span>
        ) : (
          <span className="code__lang">{lang}</span>
        )}
        {title && <span className="code__lang code__lang--aside">{lang}</span>}
        <button
          type="button"
          className="code__copy"
          onClick={() => ref.current && copy(copyableText(ref.current))}
        >
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
      </div>
      <pre
        ref={ref}
        className={['code__pre', className].filter(Boolean).join(' ')}
        tabIndex={0}
        {...rest}
      >
        {children}
      </pre>
    </div>
  );
};

/**
 * rehype-pretty-code wraps every block in a <figure>. Our CodeBlock draws its
 * own frame, so code figures render as a plain wrapper; any other <figure>
 * written in an article keeps its element.
 */
export const MdxFigure: React.FC<
  React.ComponentPropsWithoutRef<'figure'> & {
    'data-rehype-pretty-code-figure'?: string;
  }
> = ({ 'data-rehype-pretty-code-figure': isCode, children, ...rest }) =>
  isCode !== undefined ? (
    <div className="code-figure">{children}</div>
  ) : (
    <figure {...rest}>{children}</figure>
  );
