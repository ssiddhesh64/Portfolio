import React from 'react';

type HeadingProps = React.ComponentPropsWithoutRef<'h2'>;

/**
 * Section headings link to themselves, so the whole heading can be clicked
 * (or right-clicked to copy) to get a URL that lands on this section.
 */
const anchored = (Tag: 'h2' | 'h3' | 'h4') => {
  const Heading: React.FC<HeadingProps> = ({ id, children, ...rest }) => (
    <Tag id={id} {...rest}>
      {id ? (
        <a className="heading-link" href={`#${id}`}>
          {children}
        </a>
      ) : (
        children
      )}
    </Tag>
  );
  Heading.displayName = `Anchored(${Tag})`;
  return Heading;
};

export const H2 = anchored('h2');
export const H3 = anchored('h3');
export const H4 = anchored('h4');
