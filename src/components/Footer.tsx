import React from 'react';
import { personalInfo } from '../data/resumeData';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-block">
      <div className="container footer-container">
        <div>
          <h2 className="footer-title">
            {personalInfo.name} {personalInfo.lastName}
          </h2>
          <p className="meta">{personalInfo.title}</p>
        </div>

        <nav className="footer-links" aria-label="Contact">
          <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
          <a href={`tel:${personalInfo.mobile.replace(/\s/g, '')}`}>
            {personalInfo.mobile}
          </a>
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </nav>

        <p className="meta footer-copyright">
          © {new Date().getFullYear()} {personalInfo.name}{' '}
          {personalInfo.lastName}
        </p>
      </div>
    </footer>
  );
};
