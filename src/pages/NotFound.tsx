import React from 'react';
import { Link } from 'react-router-dom';
import { useMetadata } from '../hooks/useMetadata';

interface NotFoundProps {
  kind?: 'page' | 'article' | 'category';
}

export const NotFound: React.FC<NotFoundProps> = ({ kind = 'page' }) => {
  useMetadata({
    title: 'Not found, Siddhesh Sawant',
    description: 'This page does not exist.',
    noindex: true,
  });

  // Articles and categories both point back to the writing page.
  const article = kind !== 'page';

  return (
    <div className="reading wrap">
      <h1 className="reading__title">
        {kind === 'page'
          ? 'Nothing at this address'
          : `No ${kind} at this address`}
      </h1>
      <p className="reading__lede">
        The link may be mistyped, or the {kind} may have moved.{' '}
        {article
          ? 'Every published article is listed on the writing page.'
          : 'Everything on this site is reachable from the home page.'}
      </p>
      <p className="actions">
        <Link to={article ? '/blog' : '/'} className="button">
          {article ? 'See all articles' : 'Go to the home page'}
        </Link>
      </p>
    </div>
  );
};
