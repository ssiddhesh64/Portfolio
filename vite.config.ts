import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from 'rehype-pretty-code';
import {
  transformerNotationDiff,
  transformerNotationHighlight,
} from '@shikijs/transformers';
import { remarkCallouts } from './plugins/mdx/remark-callouts';
import { remarkMermaid } from './plugins/mdx/remark-mermaid';
import { rehypeCodeTitle } from './plugins/mdx/rehype-code-title';
import { mdxFrontmatter } from './plugins/mdx/frontmatter';
import { codeTheme } from './plugins/mdx/code-theme';
import { prerender } from './plugins/prerender';

const prettyCode: PrettyCodeOptions = {
  // rehype-pretty-code's types trail Shiki 4's; the theme object is the same.
  // Colours are var(--code-*), so code follows the site theme.
  theme: codeTheme as PrettyCodeOptions['theme'],
  keepBackground: false,
  defaultLang: { block: 'plaintext' },
  transformers: [
    // `// [!code ++]`, `// [!code --]` and `// [!code highlight]` comments.
    transformerNotationDiff({ matchAlgorithm: 'v3' }),
    transformerNotationHighlight({ matchAlgorithm: 'v3' }),
  ],
};

const mdxPlugin = mdx({
  remarkPlugins: [
    remarkFrontmatter,
    remarkGfm,
    remarkMath,
    remarkCallouts,
    remarkMermaid,
  ],
  // KaTeX runs before Shiki so `$$` blocks are typeset, not highlighted as
  // code. Math renders at build time; an article that uses it imports
  // 'katex/dist/katex.min.css' so only that article loads the stylesheet.
  // Keep the `katex` dependency on the same version rehype-katex renders with:
  // KaTeX renames CSS classes between minor versions (0.19 renamed .sizing).
  rehypePlugins: [
    rehypeSlug,
    [rehypeKatex, { strict: 'ignore' }],
    [rehypePrettyCode, prettyCode],
    rehypeCodeTitle,
  ],
});

// @mdx-js/rollup strips the query before matching, so it would also compile
// `index.mdx?raw` and `index.mdx?frontmatter`. Only plain imports are articles.
// (The cast bridges @mdx-js/rollup's Rollup types and Vite 8's Rolldown ones.)
const articles = {
  ...mdxPlugin,
  enforce: 'pre',
  transform(code: string, id: string) {
    if (id.includes('?')) return null;
    return mdxPlugin.transform(code, id);
  },
} as Plugin;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdxFrontmatter(),
    articles,
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    prerender(),
  ],
});
