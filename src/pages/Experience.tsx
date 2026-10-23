import React from 'react';
import { experiences } from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

export const Experience: React.FC = () => {
  useMetadata({
    title: 'Siddhesh Sawant | Work Experience - Backend Engineering',
    description:
      'Professional experience of Siddhesh Sawant, specializing in backend optimization, microservices, Kafka pipelines, and cloud systems.',
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        <header className="page-header">
          <h1>Experience</h1>
          <p>Where I have worked and what I built there, newest first.</p>
        </header>

        <ol>
          {experiences.map((exp) => (
            <li key={`${exp.org}-${exp.duration}`} className="entry">
              <div className="entry-meta">
                <p>{exp.duration}</p>
                <p>{exp.location}</p>
              </div>
              <div>
                <h2 className="entry-title">{exp.org}</h2>
                <p className="entry-sub">{exp.role}</p>
                <ul className="bullets">
                  {exp.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
