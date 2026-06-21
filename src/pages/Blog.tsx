import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Tag, BookOpen } from 'lucide-react';
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
          </div>

          <h1 className="blog-post-title">{post.title}</h1>

          <div className="blog-post-tags">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="badge icon-flex-align">
                <Tag size={12} /> {tag}
              </span>
            ))}
          </div>

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
      <header className="page-header container">
        <h1>Engineering Blog</h1>
        <p>
          Articles on Java Spring Boot optimization, system scalability, data
          streaming, and systems coding.
        </p>
      </header>

      <div className="container blog-container">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            className="glass-card blog-card scroll-reveal"
            onClick={() => navigate(`/blog/${post.id}`)}
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
              <div className="badge-container">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="badge">
                    {tag}
                  </span>
                ))}
              </div>

              <span className="blog-read-more">
                Read Article <BookOpen size={16} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
