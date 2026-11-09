import React from 'react';

/** Wide tables scroll inside the column instead of the page. */
export const Table: React.FC<React.ComponentPropsWithoutRef<'table'>> = (
  props,
) => (
  <div className="table-scroll" tabIndex={0}>
    <table {...props} />
  </div>
);

/** External links open in a new tab. */
export const Anchor: React.FC<React.ComponentPropsWithoutRef<'a'>> = ({
  href,
  ...rest
}) => {
  const external = href?.startsWith('http');
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    />
  );
};

/** Plain markdown images (![alt](url)) load lazily. Use <Figure> for captions. */
export const Img: React.FC<React.ComponentPropsWithoutRef<'img'>> = (props) => (
  <img loading="lazy" decoding="async" {...props} />
);
