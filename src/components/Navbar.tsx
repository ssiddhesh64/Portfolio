import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { personalInfo } from '../data/resumeData';
import { useTheme } from '../lib/theme';

const SECTION_LINKS = [
  { label: 'Experience', to: '/#experience' },
  { label: 'Projects', to: '/#projects' },
];

export const Navbar: React.FC = () => {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className="site-header">
      <nav className="site-nav wrap" aria-label="Main">
        <Link to="/" className="site-nav__name">
          {personalInfo.name} {personalInfo.lastName}
        </Link>
        <ul className="site-nav__links">
          {SECTION_LINKS.map((item) => (
            <li key={item.to}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
          <li>
            <NavLink to="/blog">Writing</NavLink>
          </li>
          <li>
            <Link to="/#contact">Contact</Link>
          </li>
        </ul>
        <button
          type="button"
          className="icon-button site-nav__theme"
          onClick={toggle}
          aria-label={`Switch to ${next} theme`}
        >
          {theme === 'dark' ? (
            <Sun size={18} aria-hidden />
          ) : (
            <Moon size={18} aria-hidden />
          )}
        </button>
      </nav>
    </header>
  );
};
