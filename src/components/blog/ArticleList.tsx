import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../../data/blogData';
import { formatPostDate } from '../../lib/dates';

interface ArticleListProps {
  posts: BlogPost[];
  /** Level of each article title, one below the heading the list sits under. */
  headingLevel?: 2 | 3;
}

/** Articles on the shared date grid: date in the left column, details on the right. */
export const ArticleList: React.FC<ArticleListProps> = ({
  posts,
  headingLevel = 2,
}) => {
  const Title = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <ol className="articles">
      {posts.map((post) => (
        <li key={post.id} className="articles__item">
          <time dateTime={post.date} className="articles__date num">
            {formatPostDate(post.date)}
          </time>
          <div className="articles__main">
            <Title className="articles__title">
              <Link to={`/blog/${post.id}`}>{post.title}</Link>
            </Title>
            <p className="articles__meta num">
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
          </div>
        </li>
      ))}
    </ol>
  );
};
