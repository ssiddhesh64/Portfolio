import React from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { experiences } from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

const highlightTerms = [
  'p95 latency ~ 100 ms',
  '15+ hours/week',
  '1M+ events/day',
  '100K articles',
  'Spring Boot',
  'React Native',
  '120 Peak TPS',
  'SAP HANA',
  'Azure Cloud',
  'Java',
  'Python',
  'Kafka',
].sort((a, b) => b.length - a.length);

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightText = (text: string) => {
  const alternatives = highlightTerms.map(escapeRegExp).join('|');
  const regex = new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:${alternatives})(?![\\p{L}\\p{N}_])`,
    'giu',
  );
  const tokens: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(regex)) {
    const value = match[0];
    const start = match.index ?? cursor;
    if (start > cursor) tokens.push(text.slice(cursor, start));
    tokens.push(
      <strong key={`${start}-${value}`} className="bold-highlight">
        {value}
      </strong>,
    );
    cursor = start + value.length;
  }

  if (cursor < text.length) tokens.push(text.slice(cursor));
  return tokens.length > 0 ? tokens : text;
};

export const Experience: React.FC = () => {
  useMetadata({
    title: "Siddhesh Sawant | Work I've Done",
    description:
      'Backend engineering at Walmart and freelance software development, including production services and client work.',
  });

  return (
    <div className="page-wrapper">
      <header className="page-header container">
        <h1>Work I've done</h1>
        <p>
          My experience includes backend engineering at Walmart and freelance
          software development. I've worked on production services as well as
          smaller client engagements, handling the implementation and working
          directly with clients.
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
