import React from 'react';
import { Link2 } from 'lucide-react';

type HeadingProps = React.ComponentPropsWithoutRef<'h2'>;

/** Section headings carry a copyable #anchor link, shown on hover and focus. */
const anchored = (Tag: 'h2' | 'h3' | 'h4') => {
  const Heading: React.FC<HeadingProps> = ({ id, children, ...rest }) => (
    <Tag id={id} {...rest}>
      {children}
      {id && (
        <a
          className="heading-anchor"
          href={`#${id}`}
          aria-label="Link to this section"
        >
          <Link2 size={16} aria-hidden />
        </a>
      )}
    </Tag>
  );
  Heading.displayName = `Anchored(${Tag})`;
  return Heading;
};

export const H2 = anchored('h2');
export const H3 = anchored('h3');
export const H4 = anchored('h4');
