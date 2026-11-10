import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  blogPosts,
  categoriesWithPosts,
  categoryPath,
} from '../../data/blogData';

/** Links to every category with its article count; the current one is marked. */
export const CategoryNav: React.FC = () => (
  <nav className="categories" aria-label="Article categories">
    <ul className="categories__list">
      <li>
        <NavLink to="/blog" end className="categories__link">
          All <span className="categories__count num">{blogPosts.length}</span>
        </NavLink>
      </li>
      {categoriesWithPosts.map((category) => (
        <li key={category.id}>
          <NavLink to={categoryPath(category)} className="categories__link">
            {category.title}{' '}
            <span className="categories__count num">
              {category.posts.length}
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
