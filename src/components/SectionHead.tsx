import React from 'react';

interface SectionHeadProps {
  id: string;
  title: string;
  /** One line under the heading that says what the section contains. */
  note?: React.ReactNode;
}

/**
 * Heading column of a home-page section. Sits beside the section body on
 * wide screens and above it on narrow ones.
 */
export const SectionHead: React.FC<SectionHeadProps> = ({
  id,
  title,
  note,
}) => (
  <div className="section__head">
    <h2 id={id} className="section__title">
      {title}
    </h2>
    {note && <p className="section__note">{note}</p>}
  </div>
);
