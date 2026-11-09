import React from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { personalInfo } from '../data/resumeData';
import { GitHubIcon, LinkedInIcon } from '../components/BrandIcons';

export const Hero: React.FC = () => (
  <section className="hero wrap" aria-labelledby="hero-name">
    <h1 id="hero-name" className="hero__name">
      {personalInfo.name} {personalInfo.lastName}
    </h1>
    <p className="hero__focus">{personalInfo.focus}</p>
    <p className="hero__intro">{personalInfo.intro}</p>

    <div className="hero__actions">
      <a
        href={personalInfo.resumeUrl}
        download={personalInfo.resumeFileName}
        className="button button--primary"
      >
        <ArrowDownToLine size={18} aria-hidden />
        Download resume
        <span className="button__meta">{personalInfo.resumeMeta}</span>
      </a>
      <ul className="link-row" aria-label="Contact and profiles">
        <li>
          <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
        </li>
        <li>
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon size={16} />
            GitHub
          </a>
        </li>
        <li>
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInIcon size={16} />
            LinkedIn
          </a>
        </li>
      </ul>
    </div>
  </section>
);
