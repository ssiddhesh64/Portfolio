import React, { useState } from 'react';
import { FolderGit2, Calendar, Cpu } from 'lucide-react';
import { projects } from '../data/resumeData';
import { useMetadata } from '../hooks/useMetadata';

export const Projects: React.FC = () => {
  useMetadata({
    title: 'Siddhesh Sawant | Projects - Systems & Software Engineering',
    description:
      'Explore the technical projects of Siddhesh Sawant, including systems engineering, distributed database applications, machine learning, and info retrieval.',
  });
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    'All',
    'Systems',
    'Web',
    'Machine Learning',
    'Information Retrieval',
  ];

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((project) =>
          project.tags.some(
            (tag) => tag.toLowerCase() === activeFilter.toLowerCase(),
          ),
        );

  return (
    <div className="page-wrapper">
      <header className="page-header container">
        <h1>Projects Portfolio</h1>
        <p>
          A showcase of research, academic designs, systems programming, and
          database portals I built.
        </p>
      </header>

      <div className="container">
        {/* Filter Buttons */}
        <div className="filter-bar">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="project-grid">
          {filteredProjects.map((project, index) => (
            <div key={index} className="glass-card project-card scroll-reveal">
              <div className="project-content">
                <div className="project-header-row">
                  <h3 className="project-title">{project.name}</h3>
                  <div className="icon-btn-badge">
                    <FolderGit2 size={20} />
                  </div>
                </div>

                <div className="project-meta-row">
                  <span className="icon-flex-align">
                    <Calendar size={14} />
                    {project.date}
                  </span>
                  <span className="icon-flex-align">
                    <Cpu size={14} />
                    {project.tech}
                  </span>
                </div>

                <ul className="project-details-list">
                  {project.details.map((detail, dIndex) => (
                    <li key={dIndex} className="project-detail-item">
                      <span className="project-detail-bullet">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>

                <div className="badge-container">
                  {project.tags.map((tag, tIndex) => (
                    <span key={tIndex} className="badge">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
