import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { personalInfo } from '../data/resumeData';

export const Navbar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Experience', path: '/experience' },
    { label: 'Projects', path: '/projects' },
    { label: 'Education', path: '/education' },
    { label: 'Blog', path: '/blog' },
  ];

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <NavLink to="/" className="logo">
          {personalInfo.name} {personalInfo.lastName}
        </NavLink>

        {/* Desktop Links */}
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
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
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};
