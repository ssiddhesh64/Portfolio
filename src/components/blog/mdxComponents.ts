import { Callout } from './Callout';
import { CodeBlock, MdxFigure } from './CodeBlock';
import { Figure } from './Figure';
import { H2, H3, H4 } from './Heading';
import { Mermaid } from './Mermaid';
import { Anchor, Img, Table } from './Prose';

/**
 * What an article's MDX renders with. Capitalised entries can be written
 * directly in an article without importing them:
 *
 *   <Figure>, <Callout>, and <Mermaid> (usually via a ```mermaid fence).
 */
export const mdxComponents = {
  h2: H2,
  h3: H3,
  h4: H4,
  a: Anchor,
  img: Img,
  table: Table,
  pre: CodeBlock,
  figure: MdxFigure,
  Callout,
  Figure,
  Mermaid,
};
