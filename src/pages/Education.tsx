import React from 'react';
import { education, skills } from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

export const Education: React.FC = () => {
  useMetadata({
    title: 'Siddhesh Sawant | Education & Technical Skills',
    description:
      'Academic qualifications, honors, and technical skill sets of Siddhesh Sawant in core computer science, systems design, backend languages, databases, and DevOps.',
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        <header className="page-header">
          <h1>Skills and education</h1>
        </header>

        <section className="page-section" aria-labelledby="skills-title">
          <h2 id="skills-title" className="section-title">
            Skills
          </h2>
          <dl className="skills">
            {skills.map((group) => (
              <React.Fragment key={group.category}>
                <dt>{group.category}</dt>
                <dd>{group.items.join(', ')}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>

        <section className="page-section" aria-labelledby="edu-title">
          <h2 id="edu-title" className="section-title">
            Education
          </h2>
          <ol>
            {education.map((edu) => (
              <li key={edu.school} className="entry">
                <p className="entry-meta">{edu.duration}</p>
                <div>
                  <h3 className="entry-title">{edu.degree}</h3>
                  <p className="entry-sub">{edu.school}</p>
                  <p className="meta">{edu.details}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};
