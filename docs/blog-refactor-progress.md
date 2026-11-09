# Blog refactor: progress log

Working notes for the article-page refactor on the `blog-refactor` branch.
Read this first when picking the work back up.

Last updated: 2026-11-09

## Where things stand

Built and verified, **not committed**. `npm run typecheck`, `npm run lint` and
`npm run build` pass. Checked visually in headless Chrome: desktop light and
dark, and 500px width (headless Chrome's minimum viewport; not checked at a
true 390px phone width).

How to write articles with the new features: `docs/writing-articles.md`.

## Goal

Article pages structured like https://www.aihero.dev/the-ai-engineer-mindset,
with professional support for images, architecture diagrams, flow diagrams and
code samples, and the existing posts converted.

## Decisions made

| #   | Decision                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Two columns: article plus a sticky right-hand "On this page" with active-section highlight. No left sidebar (AI Hero's is a course outline; there is no series yet). On mobile the contents list collapses under the header. |
| 2   | Optional `series` / `seriesOrder` frontmatter: "Part 2 of 5" badge, previous/next follow series order. Other posts link by date, oldest to newest.                                                                           |
| 3   | MDX instead of react-markdown, compiled at build time.                                                                                                                                                                       |
| 4   | Shiki via rehype-pretty-code: file-name titles, line highlighting, `// [!code ++/--]` diffs, optional line numbers, copy button. No multi-language tabs.                                                                     |
| 5   | Mermaid for flow/sequence/state diagrams (runtime, lazy-loaded). Architecture diagrams drawn in Excalidraw/draw.io, exported as light and dark SVGs, shown with `<Figure>`.                                                  |
| 6   | One folder per post: `src/content/blogs/<slug>/index.mdx` with images beside it. Folder name = URL slug, unchanged from the old file names.                                                                                  |
| 7   | `<Figure>`: caption, required alt, light/dark variants, click-to-zoom (native `<dialog>`). Mermaid diagrams also open full size.                                                                                             |
| 8   | Callouts in GitHub alert syntax: `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` (`[!CAUTION]` maps to warning). Also `<Callout type title>`.                                                                            |
| 9   | Hero action row: Copy link, Copy as Markdown, Share on LinkedIn, Post on X, Next article. No avatar, no subscribe.                                                                                                           |
| 10  | Article end: previous/next links plus the existing "Email me about this article". No comments, newsletter or related posts.                                                                                                  |
| 11  | `/blog` index kept as is, plus tags and series info.                                                                                                                                                                         |
| 12  | Existing posts: mechanical conversion, ASCII flow diagrams redrawn as Mermaid, prose untouched.                                                                                                                              |

## What changed

### Build pipeline

- `vite.config.ts`: `@mdx-js/rollup` with remark-frontmatter, remark-gfm, and
  our plugins; rehype-slug and rehype-pretty-code. The MDX transform is wrapped
  to skip ids with a `?query`, because @mdx-js/rollup strips the query before
  matching and would otherwise compile `?raw` and `?frontmatter` imports as
  articles (this blanked the page during development).
- `plugins/mdx/frontmatter.ts`: `index.mdx?frontmatter` returns the
  frontmatter as JSON without bundling the article body, so the blog index and
  home page stay small. Computes `readTime` from the word count when absent.
- `plugins/mdx/remark-callouts.ts`: GitHub alerts to `<Callout>`.
- `plugins/mdx/remark-mermaid.ts`: ` ```mermaid caption="…" ` fences to
  `<Mermaid>`.
- `plugins/mdx/rehype-code-title.ts`: moves pretty-code's title figcaption onto
  the `<pre>` as `data-title`. pretty-code sets raw `data-*` property keys, not
  hast camelCase; the plugin checks both.
- `plugins/mdx/code-theme.ts`: Shiki theme whose colours are `var(--code-*)`.
  Shiki's generic CSS-variables theme was dropped because Java's grammar files
  class names under `storage.type`, which it paints as keywords.
- `tsconfig.node.json` includes `plugins/`.

### Fixed after first review

- **Mermaid diagrams rendering as empty frames** (seen on the two LFS
  diagrams; they appeared only in the full-size view). Each render reused the
  same element id. In dev, StrictMode runs every effect twice, and when the
  abandoned first render finished, Mermaid's cleanup removed the element with
  that id: the live diagram. `Mermaid.tsx` now gives every `mermaid.render()`
  call a fresh id. Checked in Chrome on dev and production builds: every
  diagram in all three posts renders on load and after a theme toggle.

### Data

- `src/data/blogData.ts` rewritten: eager frontmatter glob, lazy body glob
  (`React.lazy` per post), lazy `?raw` glob for "Copy as Markdown". Validates
  required frontmatter (`title`, `date` as YYYY-MM-DD, `summary`) and throws
  with the article name. Exports `blogPosts`, `findPost`, `neighbours`.
- `src/mdx.d.ts`: module types for `*.mdx` and `*.mdx?frontmatter`.

### Components (`src/components/blog/`)

`CodeBlock` (+ `MdxFigure`), `Mermaid`, `Figure`, `Lightbox` (`Zoomable`),
`Callout`, `Heading` (anchored h2–h4), `Prose` (table, link, img),
`TableOfContents` (`variant="wide" | "narrow"`) with helpers in `toc.ts`,
`PostActions`, `PostNav`, `useCopy`, and `mdxComponents.ts` (the map passed to
every article). `XIcon` added to `BrandIcons.tsx`.
`src/components/Markdown.tsx` deleted.

### Pages

- `src/pages/BlogPost.tsx`: new layout; heading list read from the DOM after
  the lazy body loads (`OnLoaded` inside Suspense); `#section` links scroll
  once the body exists; TOC state is tagged with the post id so a stale list
  never shows when switching articles.
- `src/pages/BlogIndex.tsx`: tags and series line.

### Styles (`src/index.css`, components layer)

New: `.post*`, `.post-actions*`, `.toc*`, `.heading-anchor`, code
(pretty-code lines, highlight, diff gutter, line numbers), `.figure*`,
`.lightbox*`, `.diagram--full`, `.callout*`, `.post-nav*`, `.articles__tags`.
New theme tokens in light and dark: `--code-highlight` (neutral),
`--code-add`, `--code-remove`, `--caution`.

### Dependencies

Added: `@mdx-js/rollup`, `remark-frontmatter`, `rehype-slug`,
`rehype-pretty-code`, `shiki`, `@shikijs/transformers`, `unist-util-visit`;
dev: `yaml`, `@types/mdast`, `@types/hast`, `mdast-util-mdx-jsx`.
Removed: `react-markdown`, `react-syntax-highlighter`,
`@types/react-syntax-highlighter`.

### Content

- Moved to `<slug>/index.mdx` with `git mv`.
- Removed the duplicate body `# H1` from all three.
- `hashset_internals`: the HashSet→HashMap chain, the bucket layout (was
  Mermaid source inside a `text` block and never rendered) and the
  contains() lookup are now Mermaid. The two `>` rules are `[!WARNING]`
  callouts.
- `spring_bean_lifecycle`: ApplicationContext tree is Mermaid; the existing
  lifecycle chart got a caption.
- `github_under_the_hood`: commit/tree/blob graph, the two Smart HTTP
  exchanges, the receive pipeline (Spokes step outlined in accent), the quorum
  write, the fork network, and the LFS push and pull flows are Mermaid.
- `github_under_the_hood` spoke set ("Architecture: The Three-Replica Model")
  is an architecture figure: `spoke-set.light.svg` and `spoke-set.dark.svg`
  beside the article, shown with `<Figure light dark>`. Adds the write/read
  routing rules from the Quorum Write and Read Routing sections. File trees, byte layouts, the delta format, ref files, the LFS
  pointer and the 8-step push summary stay as code blocks.
- Every post was diffed against its original `.md`: only the diagram blocks,
  H1 removals and callout markers differ.

### Docs

- `docs/writing-articles.md`: authoring guide for every feature.
- `CLAUDE.md` tech-stack line updated (file is untracked).

## Open items

1. **Commit** the work on `blog-refactor` once reviewed.
2. **Review the redrawn diagrams**, especially:
   - All diagram captions are new text written during conversion.
   - Spoke set: the ASCII original drew Fileserver C hanging off B; the
     redraw has the proxy routing to all three, matching the prose. It also
     adds the client and the write/read rules ("2 of 3 must agree", "one
     healthy replica"), taken from the surrounding sections.
   - LFS: one ASCII drawing became two sequence diagrams (push, pull).
3. **`src/content/blogs/your_app_is_only_as_good_as_its_evals.md`** (untracked,
   added during this session, not by this work). It reads as a copy of Matt
   Pocock's AI Hero lesson 06 (links to aihero.dev as "our previous article")
   with the GitHub post's frontmatter pasted in. It no longer loads, since only
   `<slug>/index.mdx` folders are read. The uncommitted `vercel.json` change
   adds a `/blog/your_app` redirect to it. Recommendation: don't publish it
   under your name; delete the file and the redirect if it was a test.
4. **Typo in the GitHub post** (pre-existing): "A 100MB in 50 clones" in the
   Git LFS section looks like it is missing a word.
5. `public/sitemap.xml` is static; add new articles to it by hand.
6. **Spoke-set diagram is hand-written SVG, not Excalidraw.** It exercises
   the `<Figure>` light/dark path for real (see Content above), but it was
   coded by hand because Excalidraw can't be driven from the CLI. For a
   hand-drawn look, redraw it in Excalidraw, export light and dark SVGs, and
   overwrite `spoke-set.light.svg` / `spoke-set.dark.svg`; no code changes
   needed. Its text uses system fonts, since an SVG loaded through `<img>`
   cannot use the site's self-hosted Archivo.
