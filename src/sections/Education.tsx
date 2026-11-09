import React from 'react';
import { education } from '../data/resumeData';
import { formatRange } from '../lib/dates';
import { SectionHead } from '../components/SectionHead';

export const Education: React.FC = () => (
  <section
    className="section wrap"
    id="education"
    aria-labelledby="education-title"
  >
    <SectionHead id="education-title" title="Education" />
    <ol className="section__body entries">
      {education.map((e) => (
        <li key={e.school} className="entry">
          <h3 className="entry__title">
            {e.degree}, {e.field}
          </h3>
          <p className="entry__when num">{formatRange(e.start, e.end)}</p>
          <p className="entry__role">{e.school}</p>
          {e.details && <p className="entry__facts">{e.details}</p>}
        </li>
      ))}
    </ol>
  </section>
);
