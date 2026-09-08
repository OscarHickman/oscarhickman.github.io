# Design System & Token Architecture

This document specifies the design tokens, typographic scales, component conventions, and accessibility rules governing **oscarhickman.io**.

---

## 1. Type System

Typography uses deliberate families, self-hosted as modern WOFF2 files:

- **Display Sans:** `Space Grotesk` (weights: 400, 500, 600, 700) for all headings, labels, and titles.
- **Text Serif:** `STIX Two Text` (weights: 400, 500, 600, 700) for body copy, prose narratives, and long-form reading.
- **Monospace:** `DM Mono` for dates, code snippets, metadata, arXiv identifiers, and UI counters.

### Type Scale

The scale follows a ~1.2 ratio with tightening letter-spacing as scale increases:

- `--t-xs` (0.75rem / 12px)
- `--t-sm` (0.875rem / 14px)
- `--t-base` (1.0rem / 16px)
- `--t-lg` (1.125rem / 18px)
- `--t-xl` (1.25rem / 20px)
- `--t-2xl` (1.5rem / 24px)
- `--t-3xl` (1.875rem / 30px)
- `--t-4xl` (2.25rem / 36px)

---

## 2. Colour & The Spectral Ramp

Colours are semantic, eliminating all raw hex values in components:

- **Surface & Foreground:**
  - Light mode: `--bg: #f8fafc`, `--fg: #0f172a`, `--accent: #0369a1` (WCAG AA 5.67:1 contrast)
  - Dark mode: `--bg: #060913`, `--fg: #e2e8f0`, `--accent: #38bdf8` (WCAG AAA 9.28:1 contrast)
  - Muted foreground: `--fg-muted` (`#64748b` in light, `#94a3b8` in dark, both >= 4.5:1)
  - Subtle borders: `--border` and `--border-strong`

- **Astrophysics Stellar Spectral Ramp:**
  Promoted from stellar classifications, used for category accents, metadata badges, and tags:
  - `--spec-o`: Hot blue-white (`#93c5fd`)
  - `--spec-b`: Blue (`#bae6fd`)
  - `--spec-a`: Pure white (`#f8fafc`)
  - `--spec-f`: Yellow-white (`#fef08a`)
  - `--spec-g`: Solar yellow (`#fde047`)
  - `--spec-k`: Warm orange (`#fbbf24`)
  - `--spec-m`: Red giant (`#f87171`)

---

## 3. Spacing Rhythm & Elevation

- **4px Spacing Scale:** `--s-1` (4px) through `--s-12` (96px). Avoid arbitrary pixel values in components.
- **Radii:** `--r-sm` (4px), `--r-md` (8px), `--r-lg` (12px), `--r-full` (9999px).
- **Elevation:** `--e-1` (subtle border shadow), `--e-2` (card elevation), `--e-glow` (accent radial glow).
- **Z-Index:** Named scale from `--z-sunken` (-1) through `--z-modal` (200) and `--z-max` (9999).

---

## 4. Component Inventory (`src/components/ui/`)

- **`Card.vue`**: Standard interactive surface for projects and highlights. Handles hover elevations and focus rings.
- **`Tag.vue`**: Categorical badges supporting spectral tints (`spectral="b"`, etc.).
- **`Section.vue`**: Consistent semantic section wrapper with display title, optional spectral gradient rule, and spacing.
- **`Link.vue`**: Uniform link primitive handling external links (`target="_blank"`, `rel="noopener noreferrer"`) with arrow indicators.
- **`Meta.vue`**: Monospace metadata line for dates, venues, time, and locations.

---

## 5. Accessibility Mandates

1. **Focus Rings:** All interactive elements must maintain visible focus using `--focus` (`outline: 2px solid var(--focus); outline-offset: 2px;`).
2. **Reduced Motion:** All canvas and flow animations must respect `prefers-reduced-motion: reduce` by pausing continuous loops and rendering static frames.
3. **Contrast:** Every text element must meet WCAG AA contrast (>= 4.5:1 for normal text, >= 3.0:1 for large text / UI elements).
4. **Landmarks:** Every page must include skip-to-content (`#main-content`), `<nav aria-label>`, `<main>`, and `<footer>`.
