import React from 'react';
import { projects } from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

export const Projects: React.FC = () => {
  useMetadata({
    title: 'Siddhesh Sawant | Projects - Systems & Software Engineering',
    description:
      'Explore the technical projects of Siddhesh Sawant, including systems engineering, distributed database applications, machine learning, and info retrieval.',
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        <header className="page-header">
          <h1>Projects</h1>
          <p>
            Systems and data projects from 2018 to 2020, during and just before
            my master&rsquo;s.
          </p>
        </header>

        <ol>
          {projects.map((project) => (
            <li key={project.name} className="entry">
              <p className="entry-meta">{project.date}</p>
              <div>
                <h2 className="entry-title">{project.name}</h2>
                <ul className="bullets">
                  {project.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <p className="stack">{project.tech.split(' | ').join(', ')}</p>
                {(project.githubUrl || project.demoUrl) && (
                  <p className="stack">
                    {project.githubUrl && (
                      <a href={project.githubUrl}>Source</a>
                    )}{' '}
                    {project.demoUrl && <a href={project.demoUrl}>Demo</a>}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
