import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { blogPosts } from '../data/blogData';
import { personalInfo } from '../data/resumeData';
import { formatPostDate } from '../lib/dates';
import { useMetadata } from '../hooks/useMetadata';
import { Markdown } from '../components/Markdown';
import { NotFound } from './NotFound';

export const BlogPost: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  useMetadata({
    title: post
      ? `${post.title}, Siddhesh Sawant`
      : 'Article not found, Siddhesh Sawant',
    description: post?.summary ?? 'This article does not exist.',
    canonicalPath: post ? `/blog/${post.id}` : undefined,
    type: post ? 'article' : 'website',
    noindex: !post,
  });

  if (!post) return <NotFound kind="article" />;

  return (
    <article className="reading wrap">
      <p className="reading__back">
        <Link to="/blog">
          <ArrowLeft size={16} aria-hidden /> All articles
        </Link>
      </p>
      <header className="reading__head">
        <h1 className="reading__title reading__title--post">{post.title}</h1>
        <p className="reading__byline">
          {personalInfo.name} {personalInfo.lastName},{' '}
          <time dateTime={post.date} className="num">
            {formatPostDate(post.date)}
          </time>
          , <span className="num">{post.readTime}</span>
        </p>
      </header>
      <div className="prose">
        <Markdown source={post.content} />
      </div>
      <footer className="reading__foot">
        <p>
          Questions or corrections?{' '}
          <a
            href={`mailto:${personalInfo.email}?subject=${encodeURIComponent(post.title)}`}
          >
            Email me about this article
          </a>
          .
        </p>
        <p>
          <Link to="/blog">
            <ArrowLeft size={16} aria-hidden /> All articles
          </Link>
        </p>
      </footer>
    </article>
  );
};
