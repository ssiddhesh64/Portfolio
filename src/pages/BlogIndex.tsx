import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts, categoriesWithPosts, categoryPath } from '../data/blogData';
import { useMetadata } from '../hooks/useMetadata';
import {
  blogNode,
  breadcrumbNode,
  personNode,
  websiteNode,
} from '../seo/schema';
import { ArticleList } from '../components/blog/ArticleList';
import { CategoryNav } from '../components/blog/CategoryNav';

const DESCRIPTION =
  'Long-form articles by Siddhesh Sawant on machine learning from first principles, distributed systems, and Java and Spring internals.';

export const BlogIndex: React.FC = () => {
  useMetadata({
    title: 'Backend & Machine Learning Articles | Siddhesh Sawant',
    description: DESCRIPTION,
    path: '/blog',
    jsonLd: [
      websiteNode(),
      personNode(),
      blogNode(DESCRIPTION, blogPosts),
      breadcrumbNode([
        { name: 'Home', path: '/' },
        { name: 'Writing', path: '/blog' },
      ]),
    ],
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
