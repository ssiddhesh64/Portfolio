import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Code2,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';
import { ExperienceSnapshot } from '../components/ExperienceSnapshot';
import { ImpactMetricCard } from '../components/ImpactMetricCard';
import { ProjectProofCard } from '../components/ProjectProofCard';
import { SectionHeading } from '../components/SectionHeading';
import { SkillCluster } from '../components/SkillCluster';
import {
  education,
  experiences,
  impactMetrics,
  personalInfo,
  positioningPoints,
  projects,
  proofStories,
  skills,
} from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

const projectFilters = [
  'All',
  'Systems',
  'Information Retrieval',
  'Networking',
  'Machine Learning',
];

export const Home: React.FC = () => {
  useMetadata({
    title:
      'Siddhesh Sawant | Backend Engineer | Microservices & Distributed Systems',
    description:
      'Fast-scan portfolio for Siddhesh Sawant, a backend engineer with 5+ years of experience scaling Spring Boot microservices, Kafka pipelines, and production systems.',
  });

  const [activeMetricIndex, setActiveMetricIndex] = useState(0);
  const [activeProjectFilter, setActiveProjectFilter] = useState('All');

  const filteredProjects = useMemo(() => {
    if (activeProjectFilter === 'All') {
      return projects.slice(0, 4);
    }

    return projects.filter((project) =>
      project.tags.some(
        (tag) => tag.toLowerCase() === activeProjectFilter.toLowerCase(),
      ),
    );
  }, [activeProjectFilter]);

  const activeMetric = impactMetrics[activeMetricIndex];

  return (
    <div className="page-wrapper scan-page">
      <section id="snapshot" className="scan-hero">
        <div className="container scan-hero-grid">
          <div className="scan-hero-copy">
            <span className="hero-welcome">
              Backend engineer for scale-heavy systems
            </span>
            <h1>
              {personalInfo.name} {personalInfo.lastName}
            </h1>
            <p className="scan-hero-lede">
              I build Spring Boot microservices, Kafka pipelines, and automation
              that keep high-traffic product systems fast, reliable, and easier
              to operate.
            </p>

            <div className="hero-proof-strip" aria-label="Career proof summary">
              <span>Ex-Walmart SDE2</span>
              <span>5+ years</span>
              <span>180K req/day</span>
              <span>1M+ events/day</span>
            </div>

            <div className="hero-buttons">
              <a
                href={`mailto:${personalInfo.email}`}
                className="btn btn-primary"
              >
                <Mail size={18} />
                Contact me
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLink size={18} />
                LinkedIn
              </a>
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <Code2 size={18} />
                GitHub
              </a>
            </div>
          </div>

          <aside className="quick-profile-panel" aria-label="Quick profile">
            <div className="profile-panel-topline">
              <span className="status-dot" />
              {personalInfo.availability}
            </div>
            <dl className="quick-facts">
              <div>
                <dt>Role</dt>
                <dd>{personalInfo.title}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  <MapPin size={14} />
                  {personalInfo.location}
                </dd>
              </div>
              <div>
                <dt>Best fit</dt>
                <dd>Backend, platform, distributed systems</dd>
              </div>
              <div>
                <dt>Strongest stack</dt>
                <dd>Java, Spring Boot, Kafka, Python, SQL</dd>
              </div>
            </dl>
            <div className="profile-contact-row">
              <a href={`tel:${personalInfo.mobile}`}>
                <Phone size={16} />
                Call
              </a>
              <a href={`mailto:${personalInfo.email}`}>
                <Mail size={16} />
                Email
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section id="impact" className="scan-section impact-section">
        <div className="container">
          <SectionHeading
            eyebrow="Impact"
            title="The important numbers, with proof attached."
            description="Click a metric to see the exact signal a hiring manager should remember."
            align="center"
          />

          <div className="impact-grid">
            {impactMetrics.map((metric, index) => (
              <ImpactMetricCard
                key={metric.label}
                metric={metric}
                isActive={activeMetricIndex === index}
                onSelect={() => setActiveMetricIndex(index)}
              />
            ))}
          </div>

          <div className="metric-proof-panel">
            <Sparkles size={20} />
            <div>
              <span>{activeMetric.label}</span>
              <p>{activeMetric.proof}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="fit" className="scan-section">
        <div className="container">
          <SectionHeading
            eyebrow="Positioning"
            title="What I am strongest at"
            description="A quick read of where I create the most engineering value."
          />

          <div className="positioning-grid">
            {positioningPoints.map((point) => (
              <article key={point.label} className="positioning-card">
                <h3>{point.label}</h3>
                <p>{point.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="scan-section muted-section">
        <div className="container scan-two-column">
          <div>
            <SectionHeading
              eyebrow="Experience"
              title="Career timeline, compressed for fast decisions."
              description="Each role starts with the outcome, then expands only when a viewer wants the detail."
            />
            <div className="experience-stack">
              {experiences.map((experience, index) => (
                <ExperienceSnapshot
                  key={`${experience.org}-${experience.role}`}
                  experience={experience}
                  index={index}
                />
              ))}
            </div>
          </div>

          <aside className="proof-story-rail">
            <h3>Proof cards</h3>
            {proofStories.map((story) => (
              <article key={story.title} className="proof-story-card">
                <span>{story.metric}</span>
                <h4>{story.title}</h4>
                <p className="proof-story-subtitle">{story.subtitle}</p>
                <p>{story.description}</p>
                <div className="skill-pill-list">
                  {story.tags.map((tag) => (
                    <span key={tag} className="skill-pill compact">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </aside>
        </div>
      </section>

      <section id="projects" className="scan-section">
        <div className="container">
          <div className="section-header-row">
            <SectionHeading
              eyebrow="Projects"
              title="Selected technical proof"
              description="Projects that show systems thinking, data structures, networking, and backend fundamentals."
            />
            <Link to="/projects" className="text-link">
              Full project archive <ArrowRight size={16} />
            </Link>
          </div>

          <div className="filter-bar left-aligned">
            {projectFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter-btn ${activeProjectFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveProjectFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="project-proof-grid">
            {filteredProjects.map((project) => (
              <ProjectProofCard key={project.name} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="scan-section muted-section">
        <div className="container">
          <SectionHeading
            eyebrow="Skills"
            title="Stack map"
            description="Grouped by how the skills are used in real systems, not shown as arbitrary percentages."
            align="center"
          />
          <div className="skill-cluster-grid">
            {skills.map((skillCategory) => (
              <SkillCluster
                key={skillCategory.category}
                category={skillCategory}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="education" className="scan-section">
        <div className="container education-scan-grid">
          <SectionHeading
            eyebrow="Education"
            title="Academic foundation"
            description="Computer science depth plus engineering fundamentals."
          />
          <div className="education-card-list">
            {education.map((item) => (
              <article key={item.school} className="education-scan-card">
                <span>{item.duration}</span>
                <h3>{item.school}</h3>
                <p>{item.degree}</p>
                <strong>{item.details}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scan-section contact-band">
        <div className="container contact-band-inner">
          <div>
            <span className="section-eyebrow">Contact</span>
            <h2>Need a backend engineer who can own production systems?</h2>
            <p>
              I am easiest to evaluate through impact: scale handled, latency
              maintained, workflows automated, and systems shipped.
            </p>
          </div>
          <div className="contact-actions">
            <a
              href={`mailto:${personalInfo.email}`}
              className="btn btn-primary"
            >
              <Mail size={18} />
              Email
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <ExternalLink size={18} />
              LinkedIn
            </a>
            <a
              href={`tel:${personalInfo.mobile}`}
              className="btn btn-secondary"
            >
              <Phone size={18} />
              Call
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
