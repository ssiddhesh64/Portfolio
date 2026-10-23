import React from 'react';
import type { SkillCategory } from '../data/resumeData';

interface SkillClusterProps {
  category: SkillCategory;
}

export const SkillCluster: React.FC<SkillClusterProps> = ({ category }) => (
  <article className="skill-cluster">
    <h3>{category.category}</h3>
    <div className="badge-container">
      {category.items.map((skill) => (
        <span key={skill} className="badge">
          {skill}
        </span>
      ))}
    </div>
  </article>
);
