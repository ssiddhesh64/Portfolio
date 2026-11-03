import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { personalInfo } from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

// System data for spec table - the evidence that leads
const systems = [
  {
    name: 'E-Commerce Order Pipeline',
    description: 'Core ordering microservice',
    throughput: '180K req/day',
    latency: '<100ms p95',
    stack: ['Java', 'Spring Boot', 'Kafka'],
    role: 'End-to-End Owner',
    roleClass: 'role-badge-primary',
  },
  {
    name: 'Event Streaming Platform',
    description: 'Kafka-based event pipelines',
    throughput: '1M+ events/day',
    latency: '<120ms p95',
    stack: ['Kafka', 'Spring Boot', 'Azure'],
    role: 'Architect & Lead',
    roleClass: 'role-badge-primary',
  },
  {
    name: 'Data Ingestion Pipeline',
    description: 'Automated article processing',
    throughput: '100K articles/day',
    latency: '—',
    stack: ['Python', 'Azure Cloud', 'Cron'],
    role: 'Designed & Delivered',
    roleClass: 'role-badge-secondary',
  },
  {
    name: 'Operational Automation Suite',
    description: 'Python tooling & workflows',
    throughput: '15+ hrs/wk saved',
    latency: '40% faster',
    stack: ['Python', 'Shell', 'CI/CD'],
    role: 'Sole Author',
    roleClass: 'role-badge-secondary',
  },
] as const;

export const Home: React.FC = () => {
  useMetadata({
    title:
      'Siddhesh Sawant | Software Engineer | Backend & Distributed Systems',
    description:
      'Software Engineer with 5+ years of experience building scalable microservices, distributed systems, event-driven architectures, and cloud-native applications.',
  });

  return (
    <div className="page-wrapper">
      {/* Hero Section — Evidence First */}
      <section className="section-padding hero-section">
        <div className="container scroll-reveal hero-container">
          <h1 className="hero-title">
            {/* Walmart E-Commerce: 180K req/day · 1M Kafka events/day · sub-100ms p95 */}
            {personalInfo.title}
          </h1>

          <p className="hero-summary prose-max mt-2">
            {personalInfo.summary}
          </p>

          <div className="hero-buttons">
            <Link to="/experience" className="btn btn-primary">
              View Systems & Experience <ArrowRight size={18} />
            </Link>
            <Link to="/projects" className="btn btn-secondary">
              View Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Technical Spec Table — The Proof */}
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">
            Systems Delivered at Walmart Global Tech
          </h2>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>System</th>
                  <th>Throughput</th>
                  <th>Latency</th>
                  <th>Stack</th>
                  <th>My Role</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((system, index) => (
                  <tr key={index} tabIndex={0}>
                    <td className="system-cell">
                      <strong>{system.name}</strong>
                      <span className="system-desc">{system.description}</span>
                    </td>
                    <td><code>{system.throughput}</code></td>
                    <td><code>{system.latency}</code></td>
                    <td className="stack-cell">
                      {system.stack.map((tech: string, tIndex: number) => (
                        <span key={tIndex} className="stack-badge">{tech}</span>
                      ))}
                    </td>
                    <td className="role-cell">
                      <span className={`role-badge ${system.roleClass}`}>{system.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
