import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Database, Server, Cpu } from 'lucide-react';
import { personalInfo } from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

export const Home: React.FC = () => {
  useMetadata({
    title:
      'Siddhesh Sawant | Software Engineer | Backend & Distributed Systems',
    description:
      'Software Engineer with 5+ years of experience building scalable microservices, distributed systems, event-driven architectures, and cloud-native applications.',
  });
  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section className="section-padding flex-center hero-section">
        {/* Soft decorative background glows */}
        <div className="decor-glow-primary" />
        <div className="decor-glow-secondary" />

        <div className="container scroll-reveal hero-container">
          <span className="hero-welcome">Welcome to my portfolio</span>

          <h1 className="hero-title">
            Building Scalable & High-Performance Systems
          </h1>

          <h2 className="hero-subtitle">
            I'm{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {personalInfo.name} {personalInfo.lastName}
            </strong>
            , {personalInfo.title}.
          </h2>

          <p className="hero-summary">{personalInfo.summary}</p>

          <div className="hero-buttons">
            <Link to="/projects" className="btn btn-primary">
              View My Work <ArrowRight size={18} />
            </Link>
            <Link to="/experience" className="btn btn-secondary">
              My Experience
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Highlight / Key Pillars */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="glass-card scroll-reveal pillar-card">
              <div className="pillar-icon-wrapper">
                <Server size={28} />
              </div>
              <h3 className="pillar-title">Distributed Architecture</h3>
              <p className="pillar-desc">
                Designing Kafka event streams processing 1M+ daily events.
              </p>
            </div>

            <div className="glass-card scroll-reveal pillar-card">
              <div className="pillar-icon-wrapper">
                <Cpu size={28} />
              </div>
              <h3 className="pillar-title">Scale & Latency</h3>
              <p className="pillar-desc">
                Managing API loads of 180K requests/day with sub-120ms p95
                latency.
              </p>
            </div>

            <div className="glass-card scroll-reveal pillar-card">
              <div className="pillar-icon-wrapper">
                <Database size={28} />
              </div>
              <h3 className="pillar-title">Data Ingestion</h3>
              <p className="pillar-desc">
                Ingesting 100K+ articles daily on automated cloud pipelines.
              </p>
            </div>

            <div className="glass-card scroll-reveal pillar-card">
              <div className="pillar-icon-wrapper">
                <Code size={28} />
              </div>
              <h3 className="pillar-title">Automation & Tooling</h3>
              <p className="pillar-desc">
                Writing Python automation scripts that eliminate 15+ hours/week
                of manual tasks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
