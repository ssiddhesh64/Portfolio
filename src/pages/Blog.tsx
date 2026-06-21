import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Tag, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogPosts } from '../data/blogData';
import { useMetadata } from '../hooks/useMetadata';

export const Blog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
