import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Mail, MapPin } from 'lucide-react';
import { ExperienceSnapshot } from '../components/ExperienceSnapshot';
import { SectionHeading } from '../components/SectionHeading';
import { SkillCluster } from '../components/SkillCluster';
import {
  education,
  experiences,
  personalInfo,
  positioningPoints,
  skills,
} from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

export const Home: React.FC = () => {
  useMetadata({
    title: 'Siddhesh Sawant | Backend Engineer',
    description: personalInfo.summary,
  });

  return (
    <div className="page-wrapper scan-page">
      <section id="snapshot" className="scan-hero">
        <div className="container scan-hero-grid">
          <div className="scan-hero-copy">
            <span className="hero-welcome">{personalInfo.title}</span>
            <h1>
              {personalInfo.name} {personalInfo.lastName}
            </h1>
            <p className="scan-hero-lede">{personalInfo.summary}</p>

            <div className="hero-buttons">
              <a href="#experience" className="btn btn-primary">
                Explore my experience <ArrowRight size={18} />
              </a>
              <Link to="/blog" className="btn btn-secondary">
                Read my blog
              </Link>
              <div
                className="hero-social-links"
                aria-label="Professional profiles"
              >
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn <ExternalLink size={14} />
                </a>
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          <aside className="quick-profile-panel" aria-label="Quick profile">
            <div className="profile-panel-topline">
              <span className="status-dot" />
              {personalInfo.availability}
            </div>
            <dl className="quick-facts">
              <div>
                <dt>Experience</dt>
                <dd>5+ years in software engineering</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>
                  <MapPin size={14} />
                  {personalInfo.location}
                </dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>Backend development, distributed systems, and APIs</dd>
              </div>
              <div>
                <dt>Currently exploring</dt>
                <dd>Machine learning and LLM applications</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section id="fit" className="scan-section">
        <div className="container">
          <SectionHeading title="What I enjoy working on" />

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
        <div className="container">
          <div>
            <SectionHeading
              eyebrow="Experience"
              title="Work I've done"
              description="My experience includes backend engineering at Walmart and freelance software development. I've worked on production services and smaller client engagements, handling the implementation and working directly with clients."
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
        </div>
      </section>

      <section id="skills" className="scan-section muted-section">
        <div className="container">
          <SectionHeading
            eyebrow="Skills"
            title="Technologies I work with"
            description="These are technologies and engineering practices I've used in my work, grouped by what I use them for."
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
            title="Education"
            description="My academic background gave me a foundation in computer science and software development. Since then, I've continued learning through professional work, independent study, and technical writing."
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
            <h2>Let's talk</h2>
            <p>
              I'm interested in backend engineering opportunities where I can
              contribute to real products, solve technical problems, and keep
              growing as an engineer. I'm also open to freelance work that is
              a good fit for my experience. If you're
              working on something interesting or think my background could be a
              fit for your team, feel free to reach out.
            </p>
          </div>
          <div className="contact-actions">
            <a
              href={`mailto:${personalInfo.email}`}
              className="btn btn-primary"
            >
              <Mail size={18} />
              Email me
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <ExternalLink size={18} />
              Connect on LinkedIn
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
