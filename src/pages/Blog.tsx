import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Tag, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogPosts } from "../data/blogData";

export const Blog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Detail View of a specific blog post
  if (id) {
    const post = blogPosts.find((p) => p.id === id);

    if (!post) {
      return (
        <div style={{ paddingTop: "100px", paddingBottom: "5rem", textAlign: "center" }} className="container">
          <h2>Post Not Found</h2>
          <p style={{ marginBlock: "1.5rem" }}>The article you are looking for does not exist.</p>
          <Link to="/blog" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      );
    }

    return (
      <div style={{ paddingTop: "70px", paddingBottom: "5rem" }}>
        <article className="blog-post-view container">
          <button onClick={() => navigate("/blog")} className="btn btn-secondary" style={{ marginBottom: "2rem", padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
            <ArrowLeft size={16} /> Back to Articles
          </button>
          
          <div className="blog-meta">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={14} />
              {post.date}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Clock size={14} />
              {post.readTime}
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontFamily: "var(--font-heading)", fontWeight: "800", marginBottom: "1.5rem" }}>
            {post.title}
          </h1>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            {post.tags.map((tag, idx) => (
              <span key={idx} className="badge" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
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
    <div style={{ paddingTop: "70px", paddingBottom: "5rem" }}>
      <header className="page-header container">
        <h1>Engineering Blog</h1>
        <p>Articles on Java Spring Boot optimization, system scalability, data streaming, and systems coding.</p>
      </header>

      <div className="container blog-container">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            className="glass-card blog-card scroll-reveal"
            onClick={() => navigate(`/blog/${post.id}`)}
          >
            <div className="blog-meta">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={14} />
                {post.date}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>

            <h2 className="blog-title">{post.title}</h2>
            <p className="blog-summary">{post.summary}</p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="badge">
                    {tag}
                  </span>
                ))}
              </div>

              <span style={{ color: "var(--accent)", fontWeight: "600", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                Read Article <BookOpen size={16} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
