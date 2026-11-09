import type { Blockquote, Root } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import { visit } from 'unist-util-visit';

const TYPES: Record<string, string> = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'important',
  WARNING: 'warning',
  CAUTION: 'warning',
};

/**
 * Turns GitHub alert syntax into a <Callout> element:
 *
 *   > [!WARNING]
 *   > Never mutate a key while it is in a HashSet.
 *
 * The same source still renders as an alert when viewed on GitHub.
 */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (!parent || index === undefined) return;
      const first = node.children[0];
      if (first?.type !== 'paragraph') return;
      const lead = first.children[0];
      if (lead?.type !== 'text') return;

      const match = /^\[!(\w+)\][ \t]*(?:\r?\n|$)/.exec(lead.value);
      const type = match && TYPES[match[1].toUpperCase()];
      if (!match || !type) return;

      lead.value = lead.value.slice(match[0].length);
      if (!lead.value) first.children.shift();
      // A hard break right after the marker would leave an empty first line.
      if (first.children[0]?.type === 'break') first.children.shift();
      if (first.children.length === 0) node.children.shift();

      const callout: MdxJsxFlowElement = {
        type: 'mdxJsxFlowElement',
        name: 'Callout',
        attributes: [{ type: 'mdxJsxAttribute', name: 'type', value: type }],
        children: node.children,
      };
      parent.children[index] = callout;
    });
  };
}
