import React from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
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
      <header className="page-header container">
        <h1>Work Experience</h1>
        <p>
          A timeline of my professional journey, microservice development, and
          system optimization achievements.
        </p>
      </header>

      <div className="container">
        <div className="timeline">
          {experiences.map((exp, index) => (
            <div key={index} className="timeline-item scroll-reveal">
              <div className="timeline-marker" />
              <div className="glass-card timeline-card-content">
                <div className="timeline-header">
                  <h3 className="timeline-org">{exp.org}</h3>
                  <span className="timeline-duration">
                    <Calendar size={14} className="icon-inline" />
                    {exp.duration}
                  </span>
                </div>
                <div className="timeline-meta-row">
                  <h4 className="timeline-role">
                    <Briefcase size={14} className="icon-inline" />
                    {exp.role}
                  </h4>
                  <span className="timeline-location">
                    <MapPin size={14} className="icon-inline" />
                    {exp.location}
                  </span>
                </div>

                <ul className="timeline-details">
                  {exp.details.map((detail, dIndex) => (
                    <li key={dIndex}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
