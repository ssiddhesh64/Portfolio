import React from 'react';
import { skills } from '../data/resumeData';
import { SectionHead } from '../components/SectionHead';

export const Skills: React.FC = () => (
  <section className="section wrap" id="skills" aria-labelledby="skills-title">
    <SectionHead id="skills-title" title="Skills" />
    <dl className="section__body skills">
      {skills.map((group) => (
        <div key={group.category} className="skills__row">
          <dt>{group.category}</dt>
          <dd>{group.items.join(', ')}</dd>
        </div>
      ))}
    </dl>
  </section>
);
