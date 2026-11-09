# Design System Progress

Branch: `design-system` (cut from `blog-refactor`). Not pushed yet.
Reference analysis: [`design-system-reference-aihero.md`](design-system-reference-aihero.md).
Last updated: 2026-11-09.

The site adopts the visual system of the aihero.dev article page (hairline
bands, an ink-opacity colour ladder, one sans family, small radii, near-zero
shadows) while keeping its own identity: neutral paper and ink, and the
vermilion accent.

## Where things live

| What                                                   | Where                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| Every design value (commented)                         | `src/styles/tokens.css`, imported into the `theme` layer                  |
| Component styles                                       | `src/index.css` (`reset`, `base`, `components`, `utilities` layers)       |
| Fonts                                                  | `public/fonts/dm-sans-latin-var*.woff2`, `jetbrains-mono-latin-var.woff2` |
| Archivo (used only by `scripts/brand.py` for icons/OG) | `public/fonts/archivo-latin-var.woff2`                                    |

Constraints, also noted at the top of `tokens.css`:

- Mermaid reads `--font-sans`, `--bg-primary`, `--bg-secondary`, `--text-primary`,
  `--text-secondary`, `--border`, `--accent-primary`, `--accent-wash`; these must
  stay plain hex.
- `scripts/brand.py` hard-codes the light `--bg-primary` (`#fbfbfa`),
  `--text-primary` (`#1a1a19`) and `--accent-primary` (`#b8321a`).
- `index.html` `theme-color` metas must equal `--bg-primary` per theme
  (`#fbfbfa` / `#121211`).
- Media queries can't read `var()`: `80rem` (frame), `68rem` (article rail),
  `64rem`, `40rem` are written literally in CSS.

## Decisions

### Direction

- Take the reference's **system**, keep the site's identity. The site was
  reworked against the reference (the earlier redesign notes no longer apply
  and were removed).
- Applies to the **whole site**: home, `/blog`, article pages, 404.
- **No single bold element**: the stretched two-line hero name is gone; the
  name uses the same title style as article titles.

### Colour

- **Accent: vermilion** (`#b8321a` light, `#ff7a59` dark), used for meaning
  only: current role date, active nav item, active contents entry,
  highlighted code lines, primary button hover, contact email underline.
- **Light mode** holds the accent back: links are ink with a 35% underline
  that darkens on hover; bullets and focus rings are ink.
- **Dark mode** promotes the accent to links, bullets and focus rings, on
  warm near-black surfaces with bone-coloured ink.
- Text ladder: primary (100%), body (80%), secondary (64%, AA), faint (38%,
  decorative only). Lines: soft / default / strong, all 1px.
- Surfaces step canvas → frame → surface instead of using shadows.

### Typography

- **DM Sans** (variable, optical-size axis) for everything; JetBrains Mono
  for code only.
- Body / article text **17px at 1.68**, 20px between paragraphs, 11px
  between list items.
- Titles 32 → 44px bold; article h2 30px / h3 24px (24 / 20px on phones),
  semibold.
- **Nothing cramped**: the reference's −0.034em title tracking made letters
  touch in DM Sans, so tracking is −0.018em (−0.022em ≥64rem) on titles,
  −0.012em on h2/h3, +0.005em on body, +0.01em on small text. Raise
  `--tracking-body` if text still feels dense.
- `text-wrap: balance` on headings, `pretty` on paragraphs.

### Layout

- **Framed column** of 80rem on a darker canvas, with a hairline on each
  side once the viewport is wider than the frame. Gutter 16 / 32 / 44px.
- **Sticky header** (62px, blurred, hairline below) from 40rem; on phones it
  wraps to two lines and scrolls away.
- **Full-width hairlines** between home sections and around bands.
- **Home**: section title and note run across the band; below it, the shared
  date column (9.5rem) sits beside the content (up to 76ch).
- **Blog index**: header band, then articles on the same date grid.
- **Article page**: a header band and a body band. From 68rem each has a
  16rem right rail: action buttons beside the header, "On this page" beside
  the body, joined by one vertical hairline. Text (68ch) is centred in the
  main column. Code, figures and tables extend 4rem past the text on each
  side.

### Components

- Radii: 4px chips/inline code, 6px code blocks/callouts, 9px controls,
  12px figures/dialogs.
- Shadows only on outline buttons (xs), the zoom hint (sm) and the lightbox
  (md).
- Colour transitions 150ms on hover; disabled under reduced motion.
- List bullets are 5px dots everywhere (home and articles).
- Article headings link to themselves (underline on hover); the hover-only
  link icon was removed.
- No eyebrows/kickers, gradient text, decorative blur or mono-as-costume
  (`CLAUDE.md` bans).

## Commits

| Commit    | Layer                                                                              |
| --------- | ---------------------------------------------------------------------------------- |
| `87e5163` | Tokens config file, hairline colour system, radii, shadows, motion; reference doc  |
| `0d1fab2` | Format the reference doc (also removed the old `redesign-progress.md`)             |
| `009f019` | DM Sans and the type scale                                                         |
| `268fc76` | Framed page, sticky header, full-width bands, article rail                         |
| `fe21440` | Home headings above content, blog date column, list dots, heading links, wide code |

Each layer passed `npm run typecheck`, `npm run lint` and `npm run build`, and
was reviewed in screenshots at desktop widths in both themes. Headless Chrome
can't render below 500px, so phone layouts were checked at 500px only.

## Open items

1. Check phone widths (≤400px) in a real browser or device emulation.
2. `src/content/blogs/spring_bean_lifecycle/index.mdx` has an uncommitted
   two-line deletion made outside this work; it is also the only file failing
   `npm run format:check`. Commit or revert it.
3. If the brand colours change, regenerate the favicon, app icons and OG
   image with `scripts/brand.py`.
4. Decide where to merge: push `design-system` and open a PR into
   `blog-refactor` or `main`.
