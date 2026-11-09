import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import { parse } from 'yaml';

const QUERY = '?frontmatter';
const WORDS_PER_MINUTE = 230;

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Prose words only: code, imports and JSX tags don't count toward reading time. */
const readingMinutes = (body: string): number => {
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^(import|export) .*$/gm, ' ')
    .replace(/<[^>]+>/g, ' ');
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

/**
 * `import meta from './post/index.mdx?frontmatter'` yields the post's
 * frontmatter as plain JSON without compiling or bundling the article, so
 * the blog index never pulls in article bodies. `readTime` is derived from
 * the word count when the frontmatter doesn't set one.
 */
export function mdxFrontmatter(): Plugin {
  return {
    name: 'mdx-frontmatter',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith(QUERY)) return null;
      const file = id.slice(0, -QUERY.length);
      this.addWatchFile(file);

      const source = await readFile(file, 'utf8');
      const match = FENCE.exec(source);
      const data = (match ? parse(match[1]) : {}) ?? {};
      const body = match ? source.slice(match[0].length) : source;
      if (!data.readTime) data.readTime = `${readingMinutes(body)} min read`;

      return `export default ${JSON.stringify(data)};`;
    },
  };
}
