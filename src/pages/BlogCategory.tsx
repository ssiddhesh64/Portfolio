import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { categoryPath, findCategory } from '../data/blogData';
import { useMetadata } from '../hooks/useMetadata';
import {
  breadcrumbNode,
  categoryPageNode,
  personNode,
  websiteNode,
} from '../seo/schema';
import { ArticleList } from '../components/blog/ArticleList';
import { CategoryNav } from '../components/blog/CategoryNav';
import { NotFound } from './NotFound';

export const BlogCategory: React.FC = () => {
  const { category: id = '' } = useParams<{ category: string }>();
  const category = findCategory(id);

  const path = category ? categoryPath(category) : '';
  useMetadata(
    category
      ? {
          title: `${category.seoTitle ?? category.title} | Siddhesh Sawant`,
          description: category.description,
          path,
          jsonLd: [
            websiteNode(),
            personNode(),
            categoryPageNode(category, path, category.posts),
            breadcrumbNode([
              { name: 'Home', path: '/' },
              { name: 'Writing', path: '/blog' },
              { name: category.title, path },
            ]),
          ],
        }
      : null,
  );

  if (!category) return <NotFound kind="category" />;

  return (
    <div className="listing">
      <header className="listing__head wrap">
        <p className="reading__back">
          <Link to="/blog">
            <ArrowLeft size={16} aria-hidden /> All articles
          </Link>
        </p>
        <h1 className="reading__title">{category.title}</h1>
        <p className="reading__lede">{category.description}</p>
        <CategoryNav />
      </header>

      <div className="listing__body wrap">
        <ArticleList posts={category.posts} />
      </div>
    </div>
  );
};
