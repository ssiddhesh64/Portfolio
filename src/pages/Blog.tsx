import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogPosts } from '../data/blogData';
import { useMetadata } from '../hooks/useMetadata';
import { personalInfo } from '../data/resumeData';

const SyntaxHighlighter = React.lazy(() =>
  import('react-syntax-highlighter').then(({ Prism }) => ({ default: Prism })),
);

const codeTheme = (): Record<string, React.CSSProperties> => {
  const colors = {
    comment: 'var(--code-comment)',
    keyword: 'var(--code-keyword)',
    string: 'var(--code-string)',
    function: 'var(--code-function)',
    number: 'var(--code-number)',
    operator: 'var(--code-operator)',
    text: 'var(--code-text)',
  };

  return {
    'pre[class*="language-"]': {
      color: colors.text,
      background: 'var(--code-background)',
      fontFamily: 'var(--font-code)',
      fontSize: '0.84rem',
      lineHeight: 1.75,
      margin: 0,
      padding: '1.15rem 1.25rem',
      tabSize: 2,
      whiteSpace: 'pre',
    },
    'code[class*="language-"]': {
      color: colors.text,
      background: 'transparent',
      fontFamily: 'var(--font-code)',
      textShadow: 'none',
      whiteSpace: 'pre',
    },
    comment: { color: colors.comment, fontStyle: 'italic' },
    prolog: { color: colors.comment },
    doctype: { color: colors.comment },
    cdata: { color: colors.comment },
    punctuation: { color: '#c4ced8' },
    property: { color: colors.function },
    tag: { color: colors.function },
    boolean: { color: colors.number },
    constant: { color: colors.number },
    symbol: { color: colors.number },
    deleted: { color: '#ff9b9b' },
    selector: { color: colors.keyword },
    'attr-name': { color: colors.function },
    string: { color: colors.string },
    char: { color: colors.string },
    builtin: { color: colors.function },
    inserted: { color: colors.string },
    operator: { color: colors.operator },
    entity: { color: colors.operator, cursor: 'help' },
    url: { color: colors.string },
    variable: { color: colors.text },
    atrule: { color: colors.keyword },
    'attr-value': { color: colors.string },
    function: { color: colors.function },
    'class-name': { color: '#f2cc60' },
    regex: { color: colors.string },
    important: { color: colors.keyword, fontWeight: 'bold' },
    keyword: { color: colors.keyword },
  };
};

const getHeadingId = (heading: string) =>
  heading
    .replace(/[`*_~]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');

const getPostHeadings = (content: string) =>
  [...content.matchAll(/^##\s+(.+)$/gm)].map(([, title]) => ({
    title: title.replace(/[`*_~]/g, '').trim(),
    id: getHeadingId(title),
  }));

const getNodeText = (node: React.ReactNode): string =>
  React.Children.toArray(node)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }
      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        return getNodeText(child.props.children);
      }
      return '';
    })
    .join('');

const visibleTags = (tags: string[], limit = 3) => ({
  shown: tags.slice(0, limit),
  remaining: Math.max(0, tags.length - limit),
});

const TopicChips: React.FC<{ tags: string[] }> = ({ tags }) => {
  const { shown, remaining } = visibleTags(tags);
  return (
    <div className="badge-container">
      {shown.map((tag) => (
        <span key={tag} className="badge">
          {tag}
        </span>
      ))}
      {remaining > 0 && (
        <span
          className="badge badge-overflow"
          aria-label={`${remaining} more topics`}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
};

// Copy Button Component for Code Blocks
const CopyButton: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="code-block-copy-btn"
      title="Copy code"
      aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
      aria-live="polite"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

// Mermaid Diagram Component
const Mermaid: React.FC<{ chart: string; isDark: boolean }> = ({
  chart,
  isDark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    setError(null);
    setSvg('');

    const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    const renderChart = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        const styles = getComputedStyle(document.documentElement);
        const color = (token: string) => styles.getPropertyValue(token).trim();
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: color('--font-body'),
          themeVariables: {
            background: color('--bg-primary'),
            primaryColor: color('--accent'),
            primaryTextColor: color('--text-primary'),
            lineColor: color('--card-border'),
          },
        });

        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram');
      }
    };

    renderChart();
  }, [chart, isDark]);

  if (error) {
    return (
      <div className="mermaid-error-container">
        <p className="mermaid-error-text">{error}</p>
        <pre className="mermaid-error-raw">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram-container"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export const Blog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark-theme'),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const post = id ? blogPosts.find((p) => p.id === id) : undefined;
  const postHeadings = post ? getPostHeadings(post.content) : [];

  const metaTitle = post
    ? `${post.title} | Siddhesh Sawant`
    : 'Siddhesh Sawant | Engineering Blog - Backend & Distributed Systems';
  const metaDescription = post
    ? post.summary
    : 'Technical articles on Java Spring Boot optimization, system scalability, data streaming, and systems coding.';

  useMetadata({
    title: metaTitle,
    description: metaDescription,
    canonicalPath: id ? `/blog/${id}` : '/blog',
  });

  // Detail View of a specific blog post
  if (id) {
    if (!post) {
      return (
        <div className="container not-found-container">
          <h2>Post Not Found</h2>
          <p className="not-found-text">
            The article you are looking for does not exist.
          </p>
          <Link to="/blog" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      );
    }

    return (
      <div className="page-wrapper">
        <article className="blog-post-view container">
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: post.title,
              description: post.summary,
              datePublished: post.date,
              author: {
                '@type': 'Person',
                name: `${personalInfo.name} ${personalInfo.lastName}`,
                url: 'https://siddheshsawant.in',
              },
              mainEntityOfPage: `https://siddheshsawant.in/blog/${post.id}`,
              publisher: {
                '@type': 'Person',
                name: `${personalInfo.name} ${personalInfo.lastName}`,
              },
            })}
          </script>
          <button
            onClick={() => navigate('/blog')}
            className="btn btn-secondary btn-back"
          >
            <ArrowLeft size={16} /> Back to Articles
          </button>

          <div className="blog-meta">
            <span className="icon-flex-align">
              <Calendar size={14} />
              {post.date}
            </span>
            <span className="icon-flex-align">
              <Clock size={14} />
              {post.readTime}
            </span>
            <span>
              By {personalInfo.name} {personalInfo.lastName}
            </span>
          </div>

          <h1 className="blog-post-title">{post.title}</h1>

          <div className="blog-post-tags">
            <TopicChips tags={post.tags} />
          </div>

          {postHeadings.length >= 8 && (
            <nav className="blog-toc" aria-label="Table of contents">
              <h2>On this page</h2>
              <ol>
                {postHeadings.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`}>{heading.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="blog-post-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2({ children, ...props }) {
                  const headingText = getNodeText(children);
                  return (
                    <h2 id={getHeadingId(headingText)} {...props}>
                      {children}
                    </h2>
                  );
                },
                h1({ children, ...props }) {
                  const headingText = getNodeText(children);
                  return (
                    <h2
                      className="blog-content-title"
                      id={getHeadingId(headingText)}
                      {...props}
                    >
                      {children}
                    </h2>
                  );
                },
                code(props) {
                  const { children, className, ...rest } = props;
                  const match = /language-([a-zA-Z0-9_+#.-]+)/.exec(
                    className || '',
                  );
                  const language = match ? match[1] : '';

                  if (!match) {
                    return (
                      <code className={className} {...rest}>
                        {children}
                      </code>
                    );
                  }

                  const codeString = String(children).replace(/\n$/, '');

                  if (language === 'mermaid') {
                    return <Mermaid chart={codeString} isDark={isDark} />;
                  }

                  return (
                    <div className="code-block-wrapper">
                      <div className="code-block-header">
                        <span className="code-block-lang">{language}</span>
                        <CopyButton code={codeString} />
                      </div>
                      <React.Suspense
                        fallback={
                          <pre className="code-block-fallback">
                            <code>{codeString}</code>
                          </pre>
                        }
                      >
                        <SyntaxHighlighter
                          PreTag="pre"
                          language={language}
                          style={codeTheme()}
                          showLineNumbers
                          lineNumberStyle={{
                            color: 'var(--code-line-number)',
                            minWidth: '2.5em',
                            paddingRight: '1.25em',
                            userSelect: 'none',
                          }}
                          wrapLongLines={false}
                          customStyle={{
                            margin: 0,
                            background: 'var(--code-background)',
                            color: 'var(--code-text)',
                            fontFamily: 'var(--font-code)',
                            fontSize: '0.84rem',
                            lineHeight: 1.75,
                            padding: '1.15rem 1.25rem',
                          }}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </React.Suspense>
                    </div>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    );
  }

  // Index List View
  return (
    <div className="page-wrapper">
      <header className="page-header container">
        <h1>Engineering Blog</h1>
        <p>
          Articles on Java Spring Boot optimization, system scalability, data
          streaming, and systems coding.
        </p>
      </header>

      <div className="container blog-container">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            className="glass-card blog-card scroll-reveal"
          >
            <div className="blog-meta">
              <span className="icon-flex-align">
                <Calendar size={14} />
                {post.date}
              </span>
              <span className="icon-flex-align">
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>

            <h2 className="blog-title">{post.title}</h2>
            <p className="blog-summary">{post.summary}</p>

            <div className="blog-card-footer">
              <TopicChips tags={post.tags} />

              <span className="blog-read-more">
                Read Article <BookOpen size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
