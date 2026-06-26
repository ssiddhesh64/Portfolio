import React from 'react';
import { Calendar, Cpu, ExternalLink, FolderGit2 } from 'lucide-react';
import type { ProjectItem } from '../data/resumeData';

interface ProjectProofCardProps {
  project: ProjectItem;
}

const getProjectOutcome = (project: ProjectItem) => {
  const [firstDetail, secondDetail] = project.details;
  return secondDetail ? `${firstDetail} ${secondDetail}` : firstDetail;
};

export const ProjectProofCard: React.FC<ProjectProofCardProps> = ({
  project,
}) => (
  <article className="project-proof-card">
    <div className="project-proof-header">
      <div>
        <p className="snapshot-kicker">
          <FolderGit2 size={14} />
          Project proof
        </p>
        <h3>{project.name}</h3>
      </div>
      <span className="project-proof-date">
        <Calendar size={14} />
        {project.date}
      </span>
    </div>

    <p className="project-proof-outcome">{getProjectOutcome(project)}</p>

    <div className="project-proof-tech">
      <Cpu size={14} />
      {project.tech}
    </div>

    <div className="skill-pill-list">
      {project.tags.map((tag) => (
        <span key={tag} className="skill-pill compact">
          {tag}
        </span>
      ))}
    </div>

    {(project.githubUrl || project.demoUrl) && (
      <div className="project-proof-links">
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer">
            GitHub <ExternalLink size={14} />
          </a>
        )}
        {project.demoUrl && (
          <a href={project.demoUrl} target="_blank" rel="noreferrer">
            Demo <ExternalLink size={14} />
          </a>
        )}
      </div>
    )}
  </article>
);
