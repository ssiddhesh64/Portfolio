import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import { blogPosts } from '../data/blogData';
import { useMetadata } from '../hooks/useMetadata';

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
      onClick={handleCopy}
      className="code-block-copy-btn"
      title="Copy code"
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
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, sans-serif',
          themeVariables: {
            background: isDark ? '#1a1f2c' : '#ffffff',
            primaryColor: isDark ? '#6366f1' : '#3b82f6',
            primaryTextColor: isDark ? '#f3f4f6' : '#1f2937',
            lineColor: isDark ? '#4b5563' : '#d1d5db',
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

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

export const Blog: React.FC = () => {
  const { id } = useParams<{ id: string }>();

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

  const metaTitle = post
    ? `${post.title} | Siddhesh Sawant`
    : 'Siddhesh Sawant | Engineering Blog - Backend & Distributed Systems';
  const metaDescription = post
    ? post.summary
    : 'Articles on Git internals, Java hashing and the Spring Boot bean lifecycle.';

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
            Back to articles
          </Link>
        </div>
      );
    }

    return (
      <div className="page-wrapper">
        <article className="article container">
          <Link to="/blog" className="back-link">
            Back to articles
          </Link>

          <p className="meta">
            {formatDate(post.date)}, {post.readTime}
          </p>
          <h1 className="article-title">{post.title}</h1>
          <p className="meta">{post.tags.slice(0, 4).join(', ')}</p>

          <div className="blog-post-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
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
                      <SyntaxHighlighter
                        PreTag="div"
                        language={language}
                        style={isDark ? oneDark : oneLight}
                        customStyle={{
                          margin: 0,
                          borderTopLeftRadius: 0,
                          borderTopRightRadius: 0,
                          borderBottomLeftRadius: 'var(--border-radius-sm)',
                          borderBottomRightRadius: 'var(--border-radius-sm)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
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
      <div className="container">
        <header className="page-header">
          <h1>Writing</h1>
          <p>Notes on how Git, Java and Spring work under the hood.</p>
        </header>

        <ol>
          {blogPosts.map((post) => (
            <li key={post.id} className="entry">
              <p className="entry-meta">
                {formatDate(post.date)}
                <br />
                {post.readTime}
              </p>
              <div>
                <h2 className="entry-title">
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h2>
                <p className="entry-summary">{post.summary}</p>
                <p className="stack">{post.tags.slice(0, 4).join(', ')}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
