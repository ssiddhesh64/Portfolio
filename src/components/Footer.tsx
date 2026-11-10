import React from 'react';
import { personalInfo } from '../data/resumeData';

export const Footer: React.FC = () => (
  <footer className="site-footer wrap">
    {/* Prerendered at build time; the year can roll over before a rebuild. */}
    <p suppressHydrationWarning>
      © {new Date().getFullYear()} {personalInfo.name} {personalInfo.lastName}
    </p>
    <ul className="link-row" aria-label="Profiles">
      <li>
        <a href={`mailto:${personalInfo.email}`}>Email</a>
      </li>
      <li>
        <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </li>
      <li>
        <a
          href={personalInfo.linkedin}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </li>
    </ul>
  </footer>
);
