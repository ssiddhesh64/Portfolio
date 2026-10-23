import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { personalInfo } from '../data/resumeData';

const themeChangeEvent = 'portfolio-theme-change';

const subscribeToTheme = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  window.addEventListener(themeChangeEvent, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(themeChangeEvent, onChange);
  };
};

const getThemeSnapshot = () =>
  localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';

const getServerThemeSnapshot = () => 'light';

export const Navbar: React.FC = () => {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    localStorage.setItem('theme', theme === 'dark' ? 'light' : 'dark');
    window.dispatchEvent(new Event(themeChangeEvent));
  };

  const pageLinks = [
    { label: 'Experience', path: '/experience' },
    { label: 'Writing', path: '/blog' },
    { label: 'Education', path: '/education' },
  ];

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="container nav-container">
        <Link to="/" className="logo">
          {personalInfo.name} {personalInfo.lastName}
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label={
            isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <ul
          id="primary-navigation"
          className={`nav-links ${isMenuOpen ? 'is-open' : ''}`}
        >
          <li>
            <NavLink
              to="/"
              end
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Home
            </NavLink>
          </li>
          {pageLinks.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};
