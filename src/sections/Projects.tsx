import React from 'react';
import { ExternalLink } from 'lucide-react';
import { projects } from '../data/resumeData';
import { SectionHead } from '../components/SectionHead';
import { GitHubIcon } from '../components/BrandIcons';

export const Projects: React.FC = () => (
  <section
    className="section wrap"
    id="projects"
    aria-labelledby="projects-title"
  >
    <SectionHead
      id="projects-title"
      title="Projects"
      note="Built between 2018 and 2020, mostly during my master’s."
    />
    <ul className="section__body entries entries--compact">
      {projects.map((p) => (
        <li key={p.id} id={p.id} className="entry">
          <h3 className="entry__title">{p.name}</h3>
          <p className="entry__when num">{p.date}</p>
          <p className="entry__role">{p.summary}</p>
          <p className="entry__stack">
            <span className="visually-hidden">Technologies: </span>
            {p.stack.join(', ')}
          </p>
          <details className="entry__more">
            <summary>Details</summary>
            <ul className="entry__points">
              {p.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </details>
          {(p.repoUrl || p.demoUrl) && (
            <ul className="link-row">
              {p.repoUrl && (
                <li>
                  <a href={p.repoUrl} target="_blank" rel="noopener noreferrer">
                    <GitHubIcon size={16} /> Source
                  </a>
                </li>
              )}
              {p.demoUrl && (
                <li>
                  <a href={p.demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} aria-hidden /> Live demo
                  </a>
                </li>
              )}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </section>
);
