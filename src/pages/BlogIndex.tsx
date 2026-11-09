import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogData';
import { formatPostDate } from '../lib/dates';
import { useMetadata } from '../hooks/useMetadata';

export const BlogIndex: React.FC = () => {
  useMetadata({
    title: 'Writing, Siddhesh Sawant',
    description:
      'Long-form articles by Siddhesh Sawant on Java and Spring internals, Git storage and backend engineering.',
    canonicalPath: '/blog',
  });

  return (
    <div className="reading wrap">
      <header className="reading__head">
        <h1 className="reading__title">Writing</h1>
        <p className="reading__lede">
          Long-form notes on the internals behind everyday backend work: how the
          frameworks and tools I rely on behave underneath.
        </p>
      </header>

      {blogPosts.length === 0 ? (
        <p>No articles published yet.</p>
      ) : (
        <ol className="articles">
          {blogPosts.map((post) => (
            <li key={post.id} className="articles__item">
              <h2 className="articles__title">
                <Link to={`/blog/${post.id}`}>{post.title}</Link>
              </h2>
              <p className="articles__meta num">
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>,{' '}
                {post.readTime}
                {post.series &&
                  `, part ${post.series.order} of ${post.series.total} in ${post.series.name}`}
              </p>
              <p className="articles__summary">{post.summary}</p>
              {post.tags.length > 0 && (
                <ul className="articles__tags" aria-label="Topics">
                  {post.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
