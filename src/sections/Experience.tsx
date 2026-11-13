import React from 'react';
import { roles, type RoleItem } from '../data/resumeData';
import { formatRange, formatTenure, monthsBetween } from '../lib/dates';
import { SectionHead } from '../components/SectionHead';

const KIND_LABEL: Record<RoleItem['kind'], string> = {
  'full-time': 'full-time',
  freelance: 'freelance',
  internship: 'internship',
};

const Points: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="entry__points">
    {items.map((d) => (
      <li key={d}>{d}</li>
    ))}
  </ul>
);

export const Experience: React.FC = () => (
  <section
    className="section wrap"
    id="experience"
    aria-labelledby="experience-title"
  >
    <SectionHead id="experience-title" title="Experience" />
    <ol className="section__body entries">
      {roles.map((role) => (
        <li key={role.id} id={role.id} className="entry">
          <h3 className="entry__title">{role.org}</h3>
          <p className={`entry__when num${role.end ? '' : ' is-current'}`}>
            {formatRange(role.start, role.end)}
          </p>
          <p className="entry__role">{role.team ?? role.title}</p>
          <p className="entry__facts">
            <span>{role.location}</span>
            <span>{KIND_LABEL[role.kind]}</span>
            {/* An ongoing role's tenure grows after the build that prerendered it. */}
            <span className="num" suppressHydrationWarning>
              {role.tenureNote ??
                formatTenure(monthsBetween(role.start, role.end))}
            </span>
          </p>
          {role.details.length > 0 && <Points items={role.details} />}
          {role.positions && (
            <ol className="entry__positions">
              {role.positions.map((p) => (
                <li key={p.title} className="position">
                  <h4 className="position__title">
                    {p.title}
                    <span className="position__when num">
                      {formatRange(p.start, p.end)}
                    </span>
                  </h4>
                  <Points items={p.details} />
                </li>
              ))}
            </ol>
          )}
          <p className="entry__stack">
            <span className="visually-hidden">Technologies: </span>
            {role.stack.join(', ')}
          </p>
        </li>
      ))}
    </ol>
  </section>
);
