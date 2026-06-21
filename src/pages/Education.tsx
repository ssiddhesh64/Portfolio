import React from 'react';
import { GraduationCap, Calendar, Award } from 'lucide-react';
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
      <header className="page-header container">
        <h1>Education & Skills</h1>
        <p>
          My academic foundation in computer science, honors degrees, and
          specialized technical skill sets.
        </p>
      </header>

      <div className="container education-layout-grid">
        {/* Education Section */}
        <section className="edu-section">
          <h2 className="edu-section-title">
            <GraduationCap className="icon-accent" /> Education
          </h2>

          <div className="edu-cards-list">
            {education.map((edu, index) => (
              <div
                key={index}
                className="glass-card scroll-reveal timeline-card-content"
              >
                <div className="edu-card-header">
                  <h3 className="edu-school">{edu.school}</h3>
                  <span className="edu-duration">
                    <Calendar size={14} />
                    {edu.duration}
                  </span>
                </div>
                <h4 className="edu-degree">{edu.degree}</h4>
                <p className="edu-details">
                  <Award size={14} className="icon-inline" />
                  {edu.details}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Strengths Section */}
        <section className="skills-section">
          <h2 className="skills-title">Technical Skills Summary</h2>

          <div className="skills-grid">
            {skills.map((category, index) => (
              <div
                key={index}
                className="glass-card scroll-reveal skills-card-content"
              >
                <h3 className="skills-category-header">{category.category}</h3>
                <div className="badge-container">
                  {category.items.map((skill, sIndex) => (
                    <span key={sIndex} className="badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
