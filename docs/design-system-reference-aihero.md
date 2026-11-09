# Design System Reference — aihero.dev article page

Source analysed: <https://www.aihero.dev/what-are-evals> (captured 2026-11-09).
All values below come from the page's compiled HTML and its two production stylesheets
(Tailwind CSS v4 + shadcn/ui-style semantic tokens + a custom `ah-*` prose layer),
not from eyeballing screenshots. Where something is inferred rather than read directly, it is marked _(inferred)_.

---

## 1. Design System — the overall visual language

**One sentence:** a calm, editorial, near-monochrome reading surface — ink on off-white
(or bone on near-black) — framed by hairline borders, with a single warm gold accent
that is used sparingly and becomes the primary colour in dark mode.

Structural ideas that define it:

| Idea | How it shows up |
| --- | --- |
| **Framed page** | A grey page background (`--page-background`) with a centred column (max `1456px`) that has its own lighter background and `border-x`. The site looks like a sheet laid on a desk. |
| **Hairline bands, not cards** | The article is a vertical stack of full-width bands separated by 1px `border-t` (with `-mt-px` so borders never double). Hero band → content band → footer band. |
| **Alpha-derived neutrals** | Almost every grey is the foreground colour at an opacity (`#14161a` at 80%, 70%, 64%, 60%, 35%…). Text, lines and hovers all stay in the same hue family automatically. |
| **One accent** | Gold `#f5c451`. Light mode: accent is reserved (bullets/links use ink). Dark mode: gold becomes `--primary` — links, bullets, focus rings, hover states. |
| **Text-first** | No hero images, no gradients on text, minimal shadows. Hierarchy comes from size, weight, tracking and opacity. |
| **App-shell chrome** | Sticky 62px header, 264px sticky left sidebar (course nav), 232px right "On this page" rail at ≥1280px. |

---

## 2. Design Tokens

### 2.1 Colour tokens — light (`:root`)

| Token | Value | Role |
| --- | --- | --- |
| `--page-background` | `#f1f2f5` | Outermost canvas behind the framed column |
| `--background` | `#fbfbfc` | Framed column / header |
| `--card` | `#ffffff` | Article surface (`main`), code-block background |
| `--foreground` | `#14161a` | Ink — headings, strong text |
| `--primary` | `#14161a` | Same as ink in light mode |
| `--primary-foreground` | `#fbfbfc` | Text on primary |
| `--muted` | `#f5f6f8` | Sidebar, inline-code background |
| `--muted-foreground` | `#14161a9e` (≈62%) | Meta text |
| `--secondary` / `--accent` | `#14161a0f` (≈6%) | Hover fills, secondary buttons |
| `--border` | `#14161a1a` (10%) | Every hairline |
| `--input` | `#14161a24` (14%) | Input/button borders |
| `--ring` | `#14161a59` (35%) | Focus ring |
| `--accent-fill` | `#f5c451` | Gold accent |
| `--accent-fill-hover` | `#eab534` | Gold hover |
| `--accent-fill-foreground` | `#191510` | Text on gold |
| `--destructive` | `#d2483a` | Errors |

**Foreground opacity ladder** (`--ah-*` — the heart of the system):

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ah-fg-body` | ink @ 80% (`#14161acc`) | bone @ 72% (`#f4f3f1b8`) | Paragraphs, list items |
| `--ah-fg-muted` | ink @ 70% | bone @ 60% | Lede/subtitle, header links |
| `--ah-fg-subtle` | ink @ 64% | bone @ 52% | TOC links |
| `--ah-fg-label` | ink @ 60% | bone @ 48% | Small labels |
| `--ah-fg-faint` | ink @ 35% | bone @ 30% | Sidebar lesson numbers |
| `--ah-line` | ink @ 10% | white @ 8% | Default line |
| `--ah-line-strong` | ink @ 14% | white @ 12% | Emphasised line |
| `--ah-line-soft` | ink @ 7% | white @ 6% | Quiet line |
| `--ah-hover` | ink @ 6% | white @ 7% | Hover fill |
| `--ah-accent-wash` | ink @ 4% | gold @ 7% | Tinted panel bg |
| `--ah-accent-panel` | `#ecedef` | `#1d1a11` | Solid tinted panel |
| `--ah-accent-line` | ink @ 22% | gold @ 35% | Accent rule |
| `--ah-band` | `#f1f2f5` | `#0e0e0d` | Alternate band background |
| `--ah-mark-yes` / `-gold` / `-no` | `#007e46` / `#a57700` / `#c9302d` | `#58da98` / gold / `#fd736d` | Status marks |

### 2.2 Colour tokens — dark (`.dark`)

| Token | Value |
| --- | --- |
| `--page-background` | `#080808` |
| `--background` | `#0b0b0b` |
| `--card` | `#100f0e` (main is transparent in dark) |
| `--foreground` | `#f4f3f1` (warm bone, not pure white) |
| `--primary` | `#f5c451` (gold) |
| `--primary-foreground` | `#191510` |
| `--muted` | `#0d0d0c` |
| `--muted-foreground` | `#f4f3f199` (60%) |
| `--secondary` / `--accent` | `#ffffff12` (7%) |
| `--border` | `#ffffff14` (8%) |
| `--input` | `#ffffff1f` (12%) |
| `--ring` | `#f5c45159` (gold 35%) |
| `--accent-fill-hover` | `#ffd873` |
| `--destructive` | `#960000` |

Note the dark neutrals are **warm** (`#100f0e`, `#0d0d0c`, `#f4f3f1`) — slightly brown-shifted, which is what keeps the gold from looking garish.

### 2.3 Radius tokens

| Token / usage | Value |
| --- | --- |
| `--radius` (base) | **`9px`** — buttons, inputs |
| Nav items, icon buttons | `7px` |
| Header text links focus | `6px` |
| `rounded-sm` (compiled) | `6px` |
| `rounded-md` (compiled) | `11px` |
| `rounded-lg` (compiled) | `12px` — figure/diagram frames |
| `rounded-xl` (compiled) | `14px` |
| Mono tag / inline code | `4px` |
| Code block `pre` | `0.375rem` (6px) |
| Avatar | `9999px` |

Radii are small and slightly "off-grid" (7, 9, 11) — soft but not bubbly.

### 2.4 Shadow / elevation tokens

Shadows are nearly absent. The page uses `shadow-xs` 9× and `shadow-md` once; elevation is expressed with **borders and background steps** instead.

| Token | Value |
| --- | --- |
| `shadow-xs` | `0 1px 2px 0 #0000000d` |
| `shadow-sm` | `0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a` |
| `shadow-md` | `0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a` |
| `shadow-lg` | `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` |
| Focus ring | `0 0 0 3px` of `--ring` at 50% |

Elevation ladder in practice: `--page-background` → `--background` → `--card`, each separated by a 1px `--border`.

### 2.5 Motion tokens

| Token | Value |
| --- | --- |
| Default transition | `150ms cubic-bezier(.4, 0, .2, 1)` |
| `--ease-out` | `cubic-bezier(0, 0, .2, 1)` |
| `--ease-out-quart` | `cubic-bezier(.22, 1, .36, 1)` |
| Nav item colour | `200ms` |
| Hover frame (resource cards) | `400ms cubic-bezier(.65, 0, .35, 1)` |
| Reduced motion | Animations disabled under `prefers-reduced-motion: reduce` |

---

## 3. Typography System

### 3.1 Font families

| Role | CSS variable | Actual font file | Fallback stack |
| --- | --- | --- | --- |
| Sans (UI + headings + body) | `--font-sans`, `--font-heading` (named `geist` in CSS) | **DM Sans** (`dm_sans_core_*.woff2`, variable 400–700, normal + italic) _(family identified from filename)_ | `ui-sans-serif, system-ui, sans-serif` with a metric-matched Arial fallback (`size-adjust: 105.13%`) |
| Mono | `--font-mono` (named `geistMono`) | **JetBrains Mono** (400–500) _(from filename)_ | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas` |
| Serif | `--font-serif` | Source Serif (400–600, italic) | `ui-serif, Georgia, Cambria, serif` — **loaded but not used on this page** |

A **single sans family carries everything** — headings, body, UI. Contrast comes from size/weight/tracking, not from pairing families.
Fonts are subset (`unicode-range` core + ext files), `font-display: swap`, with size-adjusted local fallbacks to prevent layout shift. Body has `antialiased`.

### 3.2 Article type scale (as rendered)

| Element | Size | Weight | Line height | Tracking | Colour | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| **H1 (title)** | `2rem` → `2.5rem` (sm) → `2.75rem` (lg) = 32 / 40 / 44px | 700 | `1.06` → `1.04` (lg) | `-0.03em` → `-0.034em` (lg) | `--foreground` | `text-wrap: balance` |
| **Lede / subtitle** | `17px` → `18.5px` (sm) | 400 | `1.55` | normal | `--ah-fg-muted` | `max-width: 48ch`, `text-wrap: pretty`, `mt-4` |
| **Meta line** (series · read time · date) | `12px` mono | 400 | `1.4` | normal | `--muted-foreground` | |
| **Lesson tag** ("06 / 07") | `10px` mono | 500 | `1` | `0.10em`, uppercase | `--foreground` | 1px border, `5px 7px` padding, 4px radius |
| **H2** | `1.5em` of 16px = 24px (mobile) → `1.667em` of 18px = **30px** (sm+) | 600 | `1.333` | `-0.025em` | `--foreground` | `scroll-margin-top: 72px`; whole heading is an anchor link |
| **H3** | 20px (mobile) → **24px** (sm+) | 600 | `1.5` | `-0.025em` | `--foreground` | same anchor pattern |
| **Body paragraph** | **`15.5px`** | 400 | **`1.68`** | normal | `--ah-fg-body` (80% ink) | `margin: 0 0 20px`, `text-wrap: pretty` — overrides prose-lg's 18px |
| **List item** | `15.5px` | 400 | `1.68` | normal | `--ah-fg-body` | 11px between items |
| **Strong** | inherit | 700 | — | — | `--foreground` (100% ink) | Bold = full-opacity ink, so emphasis is weight *and* contrast |
| **Link** | inherit | inherit | — | — | `--primary` | Light: 1px underline at ink-35%, `underline-offset: 2px`, underline turns full ink on hover. Dark: gold, no underline, hover `#ffd873` |
| **Inline code** | `0.889em` | 600 | — | — | `--foreground` | bg `--muted`, padding `2px 4px`, radius 4px, **no backticks** |
| **Code block** | `12px` → `14px` (sm) | 400 | `1.75` | — | Shiki tokens | bg `--card`, 1px `--border`, radius 6px, padding `1em 1.5em`, margin `2em 0` |
| Header nav link | `13.5px` | 400 | `1` | — | muted → fg on hover | |
| Header utility link | `13px` | 400 | `1` | — | `--ah-fg-muted` | |
| Logo wordmark | `15.5px` | 700 | `1` | `-0.01em` | `--foreground` | |
| TOC link | `13px` | 400 | `1.4` | — | `--ah-fg-subtle` | `border-left`, `padding 6px 0 6px 13px` |
| "On this page" label | `14px` | 500 | snug | — | `--foreground` | |
| Sidebar lesson number | `11px` mono, tabular-nums | 500 | `1` | — | `--ah-fg-faint` | 20px wide column |
| Button label | `14px` | 500 | — | — | — | |

### 3.3 Base Tailwind scale available (for reference)

`xs 12/16 · sm 14/20 · base 16/24 · lg 18/28 · xl 20/28 · 2xl 24/32 · 3xl 30/36 · 4xl 36/40 · 5xl 48/1 · 6xl 60/1 · 7xl 72/1`
Weights: 300 · 400 · 500 · 600 · 700 (800/900 defined but unused).
Tracking: tight `-0.025em` · normal `0` · wide `0.025em` · wider `0.05em` · widest `0.1em`.
Leading: tight 1.25 · snug 1.375 · normal 1.5 · relaxed 1.625.

### 3.4 Typographic principles observed

- **Negative tracking scales with size**: −0.01em (logo) → −0.025em (H2/H3) → −0.03/−0.034em (H1).
- **Tight display leading** (1.04–1.06) vs **generous body leading** (1.68).
- **Body is small and airy**: 15.5px at 1.68 in a 70ch column — reads like a well-set book, not a marketing page.
- **Opacity, not grey hex codes**, separates heading (100%) / body (80%) / lede (70%) / meta (62%) / faint (35%).
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- Mono only for data-ish things: lesson numbers, read time/date, code.

---

## 4. Spacing Scale

### 4.1 Base unit

`--spacing: 0.25rem` (**4px**). Utilities are multiples: `p-2` = 8px, `gap-5` = 20px, etc.
The site mixes the 4px grid with a handful of **deliberate off-grid values** (18, 13, 11, 7, 5px) for optical tuning.

### 4.2 Values actually used on the page

| Value | Where |
| --- | --- |
| `1px` (`gap-px`) | Between sidebar menu items |
| `2px` (`gap-0.5`) | Between header nav items |
| `5px / 7px` | Lesson tag padding (y / x) |
| `6px` (`py-1.5`) | TOC link vertical padding |
| `8px` (`p-2`, `gap-2`) | Sidebar item padding, avatar gap, button row gap |
| `10px` (`gap-x-2.5`) | Meta row gap, logo gap |
| `11px` | Between list items |
| `12px` (`gap-3`) | Author + subscribe group |
| `13px` | TOC left indent |
| `16px` (`mb-4`, `mt-4`) | Tag row → H1, H1 → lede |
| `18px` | Header gap between utility links; **mobile horizontal gutter** (`px-[18px]`) |
| `20px` (`gap-5`) | Header items; paragraph bottom margin; action row gap |
| `24px` (`pt-6`) | Sidebar top padding |
| `28px` (`mt-7`) | Lede → author/actions row |
| `32px` (`px-8`, `pb-8`) | TOC rail padding, sidebar bottom |
| `40px` (`pt-10`, `pb-10`) | Hero band padding (mobile); content band top (mobile) |
| `44px` (`px-11`) | **Desktop horizontal gutter** (sm+), header padding at lg |
| `48px` (`md:pt-12 md:pb-12`) | Hero band padding (md+) |
| `56px` (`md:pt-14`) | Content band top (md+) |
| `64px` / `80px` (`pb-16`, `md:pb-20`) | Content band bottom |
| `72px` | Heading `scroll-margin-top` (nav height + 10) |

### 4.3 Vertical rhythm inside the article

| Gap | Value |
| --- | --- |
| Paragraph → paragraph | 20px |
| Before H2 | `1.867em` (≈34px at 18px base) |
| H2 → next | `1.067em`, and element after H2/H3 gets `margin-top: 0` |
| Before H3 | `1.667em` (≈30px) |
| Code block / figure | `2em` / `1.78em` top and bottom |
| HR / divider | `3rem` block margin |
| List item → list item | 11px |

### 4.4 Layout constraints

| Constraint | Value |
| --- | --- |
| Outer frame | `max-width: 1456px`, `px-2` (8px) outside the border |
| Header height | `--nav-height: 62px`, sticky, `bg-background/90` + `backdrop-blur-md` (functional — content scrolls under it) |
| Left sidebar | `264px`, sticky below header, `border-r`, visible ≥1024px |
| Article body | `max-width: 70ch`, centred |
| Lede | `max-width: 48ch` |
| Right TOC rail | `232px` column via `grid-cols-[minmax(0,1fr)_232px]` at ≥1280px |
| Diagrams | `max-width: 56rem` (`max-w-4xl`), bordered, `rounded-lg`, `py-10`, white bg in light / transparent in dark |

### 4.5 Responsive breakpoints

| Name | Width | What changes |
| --- | --- | --- |
| `sm` | 640px (40rem) | Gutter 18 → 44px; H1 32 → 40px; lede 17 → 18.5px; prose → lg; code 12 → 14px |
| `md` | 768px (48rem) | Hero/content band padding increases |
| `desk` (custom) | 900px | Sticky action bar behaviour |
| `lg` | 1024px (64rem) | Sidebar + desktop nav appear; H1 → 44px, tighter tracking; mobile menu hides |
| `xl` | 1280px (80rem) | Right "On this page" rail appears |

---

## 5. Visual Design Language — aesthetic and consistency

**Character:** quiet, confident, editorial-technical. It feels like documentation written by a person with taste — closer to a well-designed book or Linear's docs than to a SaaS landing page.

### What makes it consistent

1. **One ink colour, many opacities.** Text, borders, hovers and fills are all `#14161a` (or `#f4f3f1`) at different alphas, so nothing ever clashes.
2. **Hairlines everywhere, at the same weight.** Every division is a 1px `--border` (10% ink). No thick rules, no double borders (`-mt-px` trick).
3. **Surfaces step, they don't float.** Page → frame → card is a 3-step background ladder; shadows are almost unused.
4. **Single accent, used for meaning.** Gold only appears where something is interactive or highlighted (dark-mode links/bullets/focus, CTAs). It is never decorative.
5. **Custom bullets.** 5px circles in `--primary` at 70% opacity, 17px indent — small details tuned rather than browser defaults.
6. **Interaction is subtle and uniform.** Hover = 6% ink fill or text going from muted to full ink; 150–200ms; 3px soft focus ring on everything.
7. **Small, consistent radii** (7–9px for controls, 4px for tiny chips, 12px for figures).
8. **Warm darkness.** Dark mode is not inverted grey — it is warm near-black with bone text and gold primary.

### Distinctive details worth borrowing

- `text-wrap: balance` / `pretty` on headings and paragraphs.
- Heading anchors: the whole H2/H3 is a link (`no-underline`, inherits colour), with `scroll-margin-top` matching the sticky header.
- Link underline at 35% ink that darkens on hover — readable but quiet.
- A hatched chevron divider (`.ah-divider`) drawn with `clip-path` + a 135° repeating stripe.
- Diagonal stripe texture (`.bg-stripes`: 135°, foreground at 4–7%) for empty/placeholder areas.
- A soft blurred brand-gradient glow in one corner (`.brand-corner`, blur 56px, opacity .14) — used once, not as wallpaper.

---

## 6. Ready-to-port CSS tokens

Drop-in custom properties expressing the system (light default, dark override). Names are generic so they can be mapped onto the portfolio's existing `--bg-primary` / `--text-primary` / `--accent-primary` tokens.

```css
:root {
  /* surfaces */
  --page-bg: #f1f2f5;
  --frame-bg: #fbfbfc;
  --surface: #ffffff;
  --muted-bg: #f5f6f8;

  /* ink + opacity ladder */
  --ink: #14161a;
  --ink-body: #14161acc;   /* 80% */
  --ink-muted: #14161ab3;  /* 70% */
  --ink-subtle: #14161aa3; /* 64% */
  --ink-label: #14161a99;  /* 60% */
  --ink-faint: #14161a59;  /* 35% */

  /* lines + states */
  --line: #14161a1a;
  --line-strong: #14161a24;
  --line-soft: #14161a12;
  --hover: #14161a0f;
  --ring: #14161a59;

  /* accent */
  --accent: #f5c451;
  --accent-hover: #eab534;
  --on-accent: #191510;
  --link: var(--ink);

  /* radius */
  --radius-chip: 4px;
  --radius-sm: 6px;
  --radius-control: 7px;
  --radius: 9px;
  --radius-figure: 12px;

  /* elevation */
  --shadow-xs: 0 1px 2px 0 #0000000d;
  --shadow-md: 0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a;

  /* type */
  --font-sans: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --text-body: 15.5px;
  --leading-body: 1.68;
  --tracking-h1: -0.034em;
  --tracking-h2: -0.025em;

  /* spacing */
  --space-unit: 4px;
  --gutter: 18px;
  --nav-height: 62px;
  --measure: 70ch;
  --measure-lede: 48ch;

  /* motion */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-quart: cubic-bezier(0.22, 1, 0.36, 1);
  --duration: 150ms;
}

@media (min-width: 640px) {
  :root { --gutter: 44px; }
}

.dark {
  --page-bg: #080808;
  --frame-bg: #0b0b0b;
  --surface: #100f0e;
  --muted-bg: #0d0d0c;

  --ink: #f4f3f1;
  --ink-body: #f4f3f1b8;   /* 72% */
  --ink-muted: #f4f3f199;  /* 60% */
  --ink-subtle: #f4f3f185; /* 52% */
  --ink-label: #f4f3f17a;  /* 48% */
  --ink-faint: #f4f3f14d;  /* 30% */

  --line: #ffffff14;
  --line-strong: #ffffff1f;
  --line-soft: #ffffff0f;
  --hover: #ffffff12;
  --ring: #f5c45159;

  --accent-hover: #ffd873;
  --link: var(--accent);
}
```

---

## 7. Notes for adapting this to the portfolio

Things that line up with `CLAUDE.md` and can be taken as-is:
- Hairline-band layout instead of card grids (matches the "no card soup" rule).
- Emphasis through weight/contrast/scale, no gradient text.
- Backdrop blur only on the sticky header (a real overlay — allowed).
- Near-zero shadows; no zero-blur block shadows.
- SVG icons only.

Things to **change** when porting, because they break the project's bans:
- **Lesson tag above the H1** ("06 / 07", 10px mono uppercase) is an eyebrow/kicker → **drop it**. Fold series/position into the meta line below the title instead.
- **Mono on the meta line** (read time, date) is defensible as "data", but keep mono strictly to numbers/dates/code — don't extend it to labels.
- Decide whether to keep the portfolio's current **vermilion** accent in place of gold (the token structure works the same either way: accent reserved in light mode, promoted to `--primary` in dark mode).
- The site loads a serif it doesn't use here; skip it unless the portfolio needs one.
