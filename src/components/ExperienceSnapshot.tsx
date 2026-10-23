import React, { useState } from 'react';
import { Briefcase, Calendar, ChevronDown, MapPin } from 'lucide-react';
import type { ExperienceItem } from '../data/resumeData';

interface ExperienceSnapshotProps {
  experience: ExperienceItem;
  index: number;
}

const getLeadResult = (experience: ExperienceItem, index: number) => {
  if (index === 0) {
    return 'Built backend services for an e-commerce platform, from API and data access work to customer-facing discount logic.';
  }

  if (experience.org === 'Royal Motors') {
    return 'Built a responsive website for a driving school, including a React frontend and WhatsApp contact integration.';
  }

  return 'Built a React Native telemetry app backed by SAP HANA for enterprise POS device visibility.';
};

export const ExperienceSnapshot: React.FC<ExperienceSnapshotProps> = ({
  experience,
  index,
}) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <article className={`experience-snapshot ${index === 0 ? 'featured' : ''}`}>
      <div className="snapshot-main">
        <div>
          <p className="snapshot-kicker">
            <Briefcase size={14} />
            {experience.role}
          </p>
          <h3>{experience.org}</h3>
        </div>
        <div className="snapshot-meta">
          <span>
            <Calendar size={14} />
            {experience.duration}
          </span>
          <span>
            <MapPin size={14} />
            {experience.location}
          </span>
        </div>
      </div>

      <p className="snapshot-result">{getLeadResult(experience, index)}</p>

      <button
        type="button"
        className="details-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        {isOpen ? 'Hide details' : 'View details'}
        <ChevronDown size={16} className={isOpen ? 'rotated' : ''} />
      </button>

      {isOpen && (
        <ul className="snapshot-details">
          {experience.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </article>
  );
};
