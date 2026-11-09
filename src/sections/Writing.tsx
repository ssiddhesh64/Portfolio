import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogData';
import { formatPostDate } from '../lib/dates';
import { SectionHead } from '../components/SectionHead';

export const Writing: React.FC = () => (
  <section
    className="section wrap"
    id="writing"
    aria-labelledby="writing-title"
  >
    <SectionHead
      id="writing-title"
      title="Writing"
      note="Notes on the internals behind everyday backend work."
    />
    <div className="section__body">
      <ul className="posts">
        {blogPosts.map((post) => (
          <li key={post.id} className="posts__item">
            <Link to={`/blog/${post.id}`} className="posts__title">
              {post.title}
            </Link>
            <p className="posts__meta num">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>,{' '}
              {post.readTime}
            </p>
          </li>
        ))}
      </ul>
      <p className="section__more">
        <Link to="/blog">All articles, with summaries</Link>
      </p>
    </div>
  </section>
);
