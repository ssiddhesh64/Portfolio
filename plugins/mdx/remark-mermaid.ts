import type { Code, Root } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import { visit } from 'unist-util-visit';

/**
 * Replaces ```mermaid fences with a <Mermaid> element before the code
 * highlighter sees them. An optional caption comes from the fence meta:
 *
 *   ```mermaid caption="How a put() finds its bucket"
 */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (node.lang !== 'mermaid' || !parent || index === undefined) return;

      const attributes: MdxJsxAttribute[] = [
        { type: 'mdxJsxAttribute', name: 'chart', value: node.value },
      ];
      const caption = /caption="([^"]*)"/.exec(node.meta ?? '')?.[1];
      if (caption) {
        attributes.push({
          type: 'mdxJsxAttribute',
          name: 'caption',
          value: caption,
        });
      }

      const element: MdxJsxFlowElement = {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes,
        children: [],
      };
      parent.children[index] = element;
    });
  };
}
