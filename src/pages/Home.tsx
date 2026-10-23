import React from 'react';
import { Link } from 'react-router-dom';
import { personalInfo } from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

const figures = [
  { value: '1M+', text: 'events a day through Kafka pipelines I designed.' },
  {
    value: '120K–180K',
    text: 'API requests a day, with p95 latency of about 120 ms.',
  },
  {
    value: '~100K',
    text: 'articles ingested every day by a scheduled Azure pipeline.',
  },
  {
    value: '15+ hours',
    text: 'of manual work a week removed with Python automation.',
  },
];

export const Home: React.FC = () => {
  useMetadata({
    title:
      'Siddhesh Sawant | Software Engineer | Backend & Distributed Systems',
    description:
      'Software Engineer with 5+ years of experience building scalable microservices, distributed systems, event-driven architectures, and cloud-native applications.',
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <h1 id="hero-title">
              {personalInfo.name} {personalInfo.lastName}
            </h1>
            <p className="hero-role">
              I build the backend services behind large{' '}
              <span style={{ whiteSpace: 'nowrap' }}>e-commerce</span>{' '}
              platforms.
            </p>
            <p className="hero-summary">{personalInfo.summary}</p>
            <div className="hero-actions">
              <Link to="/experience" className="btn btn-primary">
                See my experience
              </Link>
              <a
                href={`mailto:${personalInfo.email}`}
                className="btn btn-secondary"
              >
                Email me
              </a>
            </div>
          </div>

          <dl className="profile">
            <div>
              <dt>Now</dt>
              <dd>Freelance backend developer at Royal Motors</dd>
            </div>
            <div>
              <dt>Before</dt>
              <dd>Software Developer 2, Walmart Global Tech, 2020–2025</dd>
            </div>
            <div>
              <dt>Works in</dt>
              <dd>Java, Spring Boot, Kafka, Python, Azure</dd>
            </div>
            <div>
              <dt>Studied</dt>
              <dd>M.Tech in Computer Science, IIIT Hyderabad</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="figures-title">
          <h2 id="figures-title" className="section-title">
            Numbers from my time at Walmart
          </h2>
          <div className="figures">
            {figures.map((f) => (
              <div key={f.value} className="figure">
                <p className="figure-value">{f.value}</p>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
