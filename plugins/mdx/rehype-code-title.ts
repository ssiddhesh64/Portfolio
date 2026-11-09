import type { Element, ElementContent, Root } from 'hast';
import { visit } from 'unist-util-visit';

/** rehype-pretty-code sets raw `data-*` keys; hast normally camel-cases them. */
const has = (node: Element, attr: string, camel: string) =>
  attr in node.properties || camel in node.properties;

const textOf = (nodes: ElementContent[]): string =>
  nodes
    .map((n) =>
      n.type === 'text'
        ? n.value
        : n.type === 'element'
          ? textOf(n.children)
          : '',
    )
    .join('');

/**
 * rehype-pretty-code renders a fence's title="..." as a <figcaption> beside
 * the <pre>. Move it onto the <pre> as data-title so the CodeBlock component
 * can show it in the same bar as the language and copy button.
 */
export function rehypeCodeTitle() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'figure') return;
      if (
        !has(
          node,
          'data-rehype-pretty-code-figure',
          'dataRehypePrettyCodeFigure',
        )
      ) {
        return;
      }

      const captionIndex = node.children.findIndex(
        (c) =>
          c.type === 'element' &&
          c.tagName === 'figcaption' &&
          has(c, 'data-rehype-pretty-code-title', 'dataRehypePrettyCodeTitle'),
      );
      const pre = node.children.find(
        (c): c is Element => c.type === 'element' && c.tagName === 'pre',
      );
      if (captionIndex === -1 || !pre) return;

      const caption = node.children[captionIndex] as Element;
      pre.properties.dataTitle = textOf(caption.children).trim();
      node.children.splice(captionIndex, 1);
    });
  };
}
