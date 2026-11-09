import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { BlogPost } from '../../data/blogData';

interface PostNavProps {
  previous?: BlogPost;
  next?: BlogPost;
}

/** Previous and next article, at the end of an article. */
export const PostNav: React.FC<PostNavProps> = ({ previous, next }) => {
  if (!previous && !next) return null;
  return (
    <nav className="post-nav" aria-label="More articles">
      {previous && (
        <Link
          to={`/blog/${previous.id}`}
          className="post-nav__link post-nav__link--prev"
          rel="prev"
        >
          <span className="post-nav__dir">
            <ArrowLeft size={16} aria-hidden /> Previous
          </span>
          <span className="post-nav__title">{previous.title}</span>
        </Link>
      )}
      {next && (
        <Link
          to={`/blog/${next.id}`}
          className="post-nav__link post-nav__link--next"
          rel="next"
        >
          <span className="post-nav__dir">
            Next <ArrowRight size={16} aria-hidden />
          </span>
          <span className="post-nav__title">{next.title}</span>
        </Link>
      )}
    </nav>
  );
};
