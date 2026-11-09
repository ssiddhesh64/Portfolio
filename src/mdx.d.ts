declare module '*.mdx' {
  import type { ComponentType } from 'react';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type MDXComponents = Record<string, ComponentType<any>>;
  const MDXContent: ComponentType<{ components?: MDXComponents }>;
  export default MDXContent;
}

declare module '*.mdx?frontmatter' {
  const frontmatter: Record<string, unknown>;
  export default frontmatter;
}
