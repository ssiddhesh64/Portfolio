import React from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { experiences } from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

const highlightText = (text: string) => {
  const keywords = [
    'Java',
    'Spring Boot',
    'Python',
    'Kafka',
    'Azure',
    'SAP HANA',
    'React',
    'React Native',
    'C\\+\\+',
    'C/C\\+\\+',
    'SQLite',
    'RESTful',
    'Microservices',
    'distributed systems',
    '120K–180K requests/day',
    '120 Peak TPS',
    'p95 latency ~ 100 ms',
    'p95 latency ~ 120 ms',
    '15\\+ hours/week',
    '40%',
    '1M\\+ events/day',
    '100K articles',
    '10 weeks',
    '21 GB',
    'TF-IDF/BM25',
    'multi-threaded',
    'ThreadPool',
  ];

  const regex = new RegExp(
    `\\b(${keywords.join('|')}|\\d+\\+?\\s*(?:K|M|TPS|ms|hours/week|events/day|GB|%|weeks|Peak TPS)?)\\b`,
    'gi',
  );

  const tokens: React.ReactNode[] = [];
  let lastIndex = 0;

  text.replace(regex, (match, _, offset) => {
    if (offset > lastIndex) {
      tokens.push(text.substring(lastIndex, offset));
    }
    tokens.push(
      <strong key={offset} className="bold-highlight">
        {match}
      </strong>,
    );
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : text;
};

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
                    <li key={dIndex}>{highlightText(detail)}</li>
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
