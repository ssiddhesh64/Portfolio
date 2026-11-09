# Portfolio redesign: progress log

Working notes for the redesign on the `grill-me-redesign` branch. Read this
first when picking the work back up.

Last updated: 2026-11-09

## Where things stand

The redesign is built and committed but not pushed. Nothing has reached `main`
or production.

| Commit    | What it did                                                                                   |
| --------- | --------------------------------------------------------------------------------------------- |
| `210db6b` | Replaced the template UI (gradients, glass, glows, icon cards) with a one-page section layout |
| `649613d` | Redirects for retired URLs, sitemap cleanup, removed narrating comments                       |
| `db189f2` | Rewrote site copy in plain language; unverified metrics marked `TODO: verify`                 |
| `2826ee5` | Type, colour and article styles (Archivo, JetBrains Mono, vermilion accent)                   |
| `1b1eb67` | Availability moved into the hero; sections reordered for scanning                             |
| `1b0994f` | Favicon, app icons and OG image generated from `scripts/brand.py`                             |
| `e9eeba6` | Second design pass: oversized name, hero facts list, shared date column, sticky section heads |

## Blocking before this ships

**Verify the metrics.** `src/data/resumeData.ts` has 9 `TODO: verify` comments.
Each marks a number or claim that was kept from the old copy but could not be
confirmed: the Walmart traffic and latency figures, 15+ hours/week, 1M+
events/day and the 40% throughput baseline, the ~100K articles/day job, the
search engine's ranking method, the friend-recommendation model and score, and
the B.Tech "honours". Confirm each, replace it with the real figure, or cut the
claim. "Improving team productivity by 40%" was removed; restore it only with a
source.

Also check these wording assumptions: the friend-recommendation dataset came
from Facebook, the mess portal was for a college mess, K.J. Somaiya is listed
as Mumbai, and "articles" is the right word for what the Azure job ingests.

## Decisions made

### Scope and structure

- AI-template visuals, code and copy were removed. Blog post content was left
  out of scope.
- The site is one page of sections plus `/blog`, `/blog/:id` and a 404 page.
- `/experience`, `/projects`, `/education` and the three pre-rename blog slugs
  301-redirect in `vercel.json`. Blog post IDs come from the markdown file
  names and must not change.
- The phone number is not shown on the site, only on the PDF resume.
- Portfolio content lives in `src/data/resumeData.ts`; sections render it.

### Audience

Designed for a hiring manager or recruiter scanning for about 30 seconds.
Writing is the second signal after experience.

### Visual direction

- **Typography:** Archivo for all text, with its width axis used for display
  (name at `font-stretch: 125%`, weight 800; section titles expanded). JetBrains
  Mono only for code, with ligatures off. Fonts are self-hosted in
  `public/fonts/`.
- **One bold element:** the name, set very large across two lines. Everything
  else stays quiet.
- **Colour:** neutral white (`#fbfbfa`) and near-black (`#1a1a19`), with one
  vermilion accent (`#b8321a` light, `#ff7a59` dark) for links, focus and the
  current role's date. Dark mode uses neutral `#161616`. Cream backgrounds were
  dropped because cream plus terracotta reads as an AI-generated default.
- **Layout:** every home section shares a grid: section heading column (sticky
  on wide screens), then a date column holding every date on the page, then
  content. The hero's right side holds an at-a-glance list (now, before, based
  in, open to, latest article).
- **Section order:** Hero, Experience, Writing, Projects, Skills, Education,
  Contact.
- **Motion:** none beyond hover and focus states.
- **Header:** not sticky.
- **Code highlighting:** near-monochrome: ink, grey comments, vermilion
  keywords, green strings.

### Rules from `CLAUDE.md` that apply throughout

No eyebrows above headings, no card grids, no gradient text, no decorative blur,
no emoji icons, monospace only for code. Run `npm run typecheck` and
`npm run lint` before committing.

## Next steps

Design feedback from the owner: the first neutral pass had "a lot of unutilized
space" and did not look professionally designed. The second pass addressed
that; the owner has not yet reviewed it. Candidates for the next pass:

1. **Contact and footer.** The page still ends weakly. Make the closing section
   feel deliberate.
2. **Skills.** Long category labels wrap in the narrow date column; shorten them
   or rethink the row layout.
3. **`/blog` index and article pages.** They have not had the second-pass
   treatment (date column, heading scale).
4. **Blog content** (separate from design): the frontmatter summaries are
   marketing-toned, and each post repeats its title as a heading at the top.
5. **Ship:** resolve the TODOs, push the branch and open a PR to get a Vercel
   preview, check it on a real phone, then merge.

## How to work on it

```bash
npm run dev          # local server
npm run typecheck && npm run lint && npm run build
```

Screenshots for review can be taken with headless Chrome against
`npx vite preview --port 4173`. Headless Chrome will not render narrower than
about 500px, and it captures a blank page when navigating to a `#hash`, so take
full-page shots and crop them with `sips`.

### Regenerating brand assets

`scripts/brand.py` builds `favicon.svg`, `favicon.ico`, the app icons and
`og-image.png`, outlining Archivo text into SVG paths. Colours in the script
must match the light theme tokens in `src/index.css`.

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools brotli
.venv/bin/python scripts/brand.py   # needs rsvg-convert (brew install librsvg)
```
