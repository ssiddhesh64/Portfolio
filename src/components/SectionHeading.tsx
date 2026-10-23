import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  description,
  align = 'left',
}) => (
  <div className={`section-heading section-heading-${align}`}>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>
);
