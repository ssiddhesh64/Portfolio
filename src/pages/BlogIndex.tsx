import React from 'react';
import { Link } from 'react-router-dom';
import { categoriesWithPosts, categoryPath } from '../data/blogData';
import { useMetadata } from '../hooks/useMetadata';
import { ArticleList } from '../components/blog/ArticleList';
import { CategoryNav } from '../components/blog/CategoryNav';

export const BlogIndex: React.FC = () => {
  useMetadata({
    title: 'Writing, Siddhesh Sawant',
    description:
      'Long-form articles by Siddhesh Sawant on distributed systems, Java and Spring internals, and machine learning from first principles.',
    canonicalPath: '/blog',
  });

  return (
    <div className="listing">
      <header className="listing__head wrap">
        <h1 className="reading__title">Writing</h1>
        <p className="reading__lede">
          Long-form notes on the internals behind everyday backend work: how the
          frameworks and tools I rely on behave underneath.
        </p>
        {categoriesWithPosts.length > 0 && <CategoryNav />}
      </header>

      <div className="listing__body wrap">
        {categoriesWithPosts.length === 0 ? (
          <p>No articles published yet.</p>
        ) : (
          categoriesWithPosts.map((category) => (
            <section
              key={category.id}
              className="category"
              aria-labelledby={`category-${category.id}`}
            >
              <header className="category__head">
                <h2 id={`category-${category.id}`} className="category__title">
                  <Link to={categoryPath(category)}>{category.title}</Link>
                </h2>
                <p className="category__description">{category.description}</p>
              </header>
              <ArticleList posts={category.posts} headingLevel={3} />
            </section>
          ))
        )}
      </div>
    </div>
  );
};
