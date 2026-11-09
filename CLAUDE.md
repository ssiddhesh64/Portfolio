# CLAUDE.md

This repository is the personal developer portfolio and technical blog of **Siddhesh Sawant** (Software Engineer specializing in Backend, Distributed Systems, Microservices, and Event-Driven Architectures).

---

## 1. Project Overview & Tech Stack

- **Framework**: React 19 + TypeScript (Vite bundler)
- **Routing**: `react-router-dom` v7 with lazy route-level code-splitting
- **Icons & Visuals**: `lucide-react`, `mermaid`
- **Articles**: MDX compiled at build time (`@mdx-js/rollup`, `remark-gfm`), code highlighted at build time by Shiki via `rehype-pretty-code`; MDX plugins live in `plugins/mdx/`. See `docs/writing-articles.md`.
- **Analytics & Web Vitals**: `@vercel/analytics`, `@vercel/speed-insights`
- **Styling Architecture**: Modern CSS layers (`reset`, `base`, `theme`, `components`, `utilities`) defined in `src/index.css` using native CSS custom properties for theming

---

## 2. Development & Build Commands

Always use the project's configured npm scripts:

```bash
# Start local development server
npm run dev

# Run TypeScript type check
npm run typecheck

# Run ESLint validation
npm run lint

# Format code with Prettier
npm run format

# Verify formatting without modifying files
npm run format:check

# Production build (tsc -b && vite build)
npm run build

# Preview production build locally
npm run preview
```

> **Mandatory Verification**: Always verify changes by running `npm run typecheck` and `npm run lint` before completing tasks.

---

### Absolute Bans & Anti-Patterns

Refuse the lazy defaults of generic web templates:

| Anti-Pattern                 | Rule                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Eyebrows / Kickers**       | **ABSOLUTE BAN**: Never place a category kicker or eyebrow above a heading. The heading carries its own weight.  |
| **Card Soup**                | Do not structure pages out of repeated identical cards with icon + title + blurb. Never nest cards inside cards. |
| **Monospace Costume**        | Monospace is reserved exclusively for code, data points, or measurements—never as a costume for "technical".     |
| **Gradient Text**            | Avoid gradient fills on text. Create emphasis using weight, contrast, or scale.                                  |
| **Fake Glass / Blur**        | Backdrop blur is not generic wallpaper. Use only for functional overlay depth.                                   |
| **Zero-Blur Block Shadows**  | Avoid `box-shadow: 4px 4px 0` unless strictly executing a true neobrutalist aesthetic.                           |
| **Unicode / Emoji as Icons** | Use SVGs or Lucide icons with consistent stroke weights. Never use emojis as functional UI icons.                |
| **Hero-Metric Clichés**      | Avoid big-number + small-label stat templates without contextual meaning.                                        |

---

## 4. Code & Architecture Conventions

- **Component Structure**: Functional React components with TypeScript interfaces.
- **CSS Architecture**: Keep custom CSS organized within existing `@layer` structure in `src/index.css` using theme variables (`--bg-primary`, `--text-primary`, `--accent-primary`, etc.).
- **Data Centralization**: Dynamic portfolio content (experiences, projects, skills, education) is maintained in `src/data/resumeData.ts`. Keep data structures typed and decoupled from presentation.
- **Accessibility**: Use semantic HTML tags (`<main>`, `<nav>`, `<article>`, `<section>`, `<aside>`), explicit ARIA attributes where needed, and ensure complete keyboard navigability.
