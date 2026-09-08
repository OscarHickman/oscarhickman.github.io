# Design Roadmap — oscarhickman.io

**Goal:** take the site from "themed Vue template" to a production-grade, self-consistent design system with the craft level of a first-party product site (Apple, Stripe, Linear), expressed through an astrophysics identity rather than a generic dark-mode aesthetic.

**Owner:** Oscar Hickman · **Status:** draft · **Created:** 2026-09-07

---

## 0. What "Apple-grade" actually means here

It is not gradients and glass. Companies whose sites read as premium share five concrete properties, and every phase below maps to one of them:

| Property                                  | Concretely                                                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **One source of truth**                   | Every colour, size, radius, shadow and duration comes from a named token. Zero raw hex in components.                         |
| **A typographic scale, not font choices** | A fixed ramp (e.g. 7 steps), optical sizing, tight tracking on display sizes, generous measure on body. Fonts actually load.  |
| **Rhythm**                                | A single spacing unit. Vertical rhythm holds across pages. Nothing is nudged by eye.                                          |
| **Restraint in motion**                   | Few animations, all on one easing curve and two durations, all respecting `prefers-reduced-motion`.                           |
| **Finish**                                | Focus rings, selection colour, hover/active/disabled states, empty states, print, 404, favicon, OG image — nothing unhandled. |

The astrophysics angle is the _content_ of the system (a spectral colour ramp, scientific-paper typography, data-forward layouts), not a decoration layer on top of it.

---

## 1. Current-state audit

Findings from the existing `src/styles/`, `unocss.config.ts` and component styles. Ordered by severity.

### Blocking

1. **The two primary typefaces are never loaded.** `main.css:253` sets body to `'STIX Two Text'` and `main.css:266` sets all headings to `'Space Grotesk'`, but `unocss.config.ts` only registers `Inter`, `DM Mono`, `Roboto Condensed`, `Bad Script`, and `public/assets/fonts/` contains only those four families. In production every heading silently falls back to the system sans and all body copy renders in **Times New Roman**. The entire typographic intent of the current design is not shipping.

2. **Light mode is broken.** `main.css:1` defines the dark palette on `:root` and `main.css:27` re-defines the _identical_ palette on `html.dark`. There is no `html:not(.dark)` token set, yet `ToggleTheme.vue` ships, `logics/index.ts` runs a full view-transition toggle, and `markdown.css` still carries `html:not(.dark) .shiki` light rules. Toggling to light produces dark tokens on a light `color-scheme`.

3. **`index.html:17` force-adds `.dark` on every load**, overriding both the persisted `useDark` value (visible flash) and the visitor's OS preference.

### High

4. **Token layer covers colour only.** There are no tokens for spacing, radius, shadow, duration, easing, z-index or type scale. Components invent their own: `1.35rem` padding and `8px` radius in `ListProjects.vue`, `0.25s`/`0.2s`/`0.3s`/`0.4s` durations scattered across four files.

5. **Font stacks are copy-pasted into components.** The `'Space Grotesk', -apple-system, …` block is duplicated verbatim in `NavBar.vue:93`, `ListProjects.vue:74` and `:87`, and `ListTalksByCategory.vue:159`. Changing the heading face means a four-file edit.

6. **`prose.css` still carries Tailwind-typography light-mode greys** — `#4b5563` (`:14`), `#6b7280` (`:64`, `:136`), `#d1d5db` (`:74`) — hardcoded against a dark background. List bullets, figcaptions and `.lead` are effectively unreadable or wrongly weighted.

7. **No `:focus-visible` styling anywhere**, and `NavBar.vue:16`/`:114` explicitly remove outlines. The site is keyboard-unusable for anyone not using a mouse. This is a WCAG 2.4.7 failure, not a polish item.

8. **`ArtDots.vue` runs an unconditional `requestAnimationFrame` starfield** with no `prefers-reduced-motion` guard (`Logo.vue` and `LogoStroke.vue` have one; the largest animation on the site does not) and no visibility/pause handling.

### Medium

9. `markdown.css:59` scales prose images by `1.05` to fake a bleed — a hack that breaks at narrow viewports and fights the `--prose-width` variables already defined at `prose.css:1-5`.
10. Three overlapping stylesheets (`main.css`, `prose.css`, `markdown.css`, 1090 lines) with no stated boundary; `prose.css` is largely an un-pruned vendored Tailwind typography dump.
11. `main.css:126-190` hand-writes 20 `nth-child` stagger rules that a single `--enter-stage` counter or `:nth-child(n)` calc can express.
12. `index.html:24` loads `platform.twitter.com/widgets.js` on **every** page for zero embeds — a third-party request and a privacy leak on a personal academic site.
13. No preload, no `font-display`, no subsetting strategy for the display face; first paint will FOUT.
14. UnoCSS `shortcuts` are barely used (`bg-base`, `color-base`, `border-base`) — the natural place for a component-primitive layer is empty.

---

## 2. Target design language

**Concept: "instrument panel."** A scientific paper's typography, a telescope console's restraint, a night-sky palette that is _measured_ rather than decorative.

- **Ground:** near-black with a very slight blue cast (current `#060913` is correct), plus one raised surface and one sunken surface. No more than three elevations.
- **Colour = data.** The accent ramp is derived from **stellar spectral classes** (O/B blue-white → A white → F/G warm → K amber → M red). This is already latent in `ArtDots.vue`'s `STAR_COLORS`; promote it to the token layer so tags, categories, chart accents and link states all draw from one physically-motivated ramp.
- **Type:** a display sans for headings and UI, a text serif for prose (the current STIX/Space Grotesk intent — but actually loaded), DM Mono for code, data and metadata.
- **Motion:** two durations (120 ms UI, 400 ms page), one easing (`cubic-bezier(0.16, 1, 0.3, 1)`), no exceptions.
- **Density:** academic pages are dense by nature. Prefer tight, information-rich layouts over hero whitespace; earn the whitespace at section boundaries instead.

---

## 3. Phased plan

Each phase is independently shippable and ends in a verifiable state. Phases 1–3 are prerequisites for everything else.

---

### Phase 1 — Foundations (fix what is broken)

_Nothing else is worth doing until the site renders as designed._

- [x] **Load the real fonts.** Add the display sans and text serif to `unocss.config.ts` `presetWebFonts` (keeping `createLocalFontProcessor` so they self-host into `public/assets/fonts/`), or self-host variable `.woff2` files directly if the exact cuts matter. Decide the pairing deliberately — candidates: _Space Grotesk_ / _Newsreader_, _Inter Tight_ / _Source Serif 4_, _Geist_ / _Literata_.
- [x] **Remove all inline font stacks** from `NavBar.vue`, `ListProjects.vue`, `ListTalksByCategory.vue` and `main.css`; replace with `--font-display` / `--font-text` / `--font-mono` tokens.
- [x] **Fix theming.** Move the dark palette off `:root` onto `html.dark`; author a real light palette; keep `:root` as the shared structural tokens. Decide explicitly: dark-default with a working light mode, or dark-only — and if dark-only, delete `ToggleTheme.vue`, the `html:not(.dark)` rules and the view-transition code rather than shipping a dead toggle.
- [x] **Fix the FOUC/preference bug** in `index.html:17`: read `localStorage` and `prefers-color-scheme` in the inline script instead of unconditionally adding `.dark`.
- [x] **Delete the Twitter widget script** (`index.html:24`).
- [x] Add `<link rel="preload">` for the two critical font files and `font-display: swap`.

**Done when:** headings and body render in the intended faces on a cold load; theme toggle produces two correct palettes (or is gone); Lighthouse shows no third-party requests.

---

### Phase 2 — The token layer

Create `src/styles/tokens.css`, imported first. Everything downstream references it; **no raw hex, px or ms lands in a component again.**

- [x] **Colour** — semantic, not literal: `--bg`, `--bg-raised`, `--bg-sunken`, `--fg`, `--fg-muted`, `--fg-subtle`, `--border`, `--border-strong`, `--accent`, `--accent-hover`, `--accent-muted`, `--focus`.
- [x] **Spectral ramp** — `--spec-o` … `--spec-m`, promoted from `ArtDots.vue`'s `STAR_COLORS`, used for category accents, tags and data viz.
- [x] **Space** — a 4 px base: `--s-1`(4) … `--s-12`(96). No arbitrary values in components.
- [x] **Type scale** — `--t-xs` … `--t-4xl` on a ~1.2 ratio, with paired `line-height` and `letter-spacing` tokens (tracking tightens as size grows).
- [x] **Radius** — `--r-sm`(4) `--r-md`(8) `--r-lg`(12) `--r-full`.
- [x] **Elevation** — `--e-1`, `--e-2`, `--e-glow` (the accent glow currently inline in `ListProjects.vue`).
- [x] **Motion** — `--dur-fast`(120ms) `--dur-slow`(400ms) `--ease`(`cubic-bezier(0.16,1,0.3,1)`).
- [x] **Z-index** — a named scale replacing the current `z-40`/`z-100`/`z-200`/`1031` free-for-all.
- [x] Mirror the tokens into `unocss.config.ts` `theme` so `bg-raised`, `text-muted`, `p-4` etc. resolve to the same values from utility classes.

**Done when:** `grep -rE '#[0-9a-f]{6}' src/components` returns nothing, and every `transition` in the codebase references `--dur-*`/`--ease`.

---

### Phase 3 — Stylesheet architecture

- [x] Restructure into a clear cascade: `tokens.css` → `reset.css` → `base.css` (element defaults, typography) → `prose.css` (markdown only) → `utilities.css`.
- [x] **Prune `prose.css`** hard. Delete the vendored Tailwind-typography rules that are never exercised (`ol[type='A s']` and friends), and rewrite every remaining colour against tokens — killing the four hardcoded greys.
- [x] Fold `markdown.css` Shiki rules into `prose.css`; keep only genuine third-party overrides (Floating Vue, NProgress) separate, in `vendor.css`.
- [x] Replace the 20 hand-written `nth-child` stagger rules with a single generated rule.
- [x] Replace the `scale(1.05)` image hack with a proper `--prose-bleed` full-bleed utility driven by the existing `--prose-*` variables.
- [x] Target: **under 600 total CSS lines**, down from 1090, with no dead rules.

---

### Phase 4 — Component system

Build the small set of primitives every page currently re-implements, as `src/components/ui/`.

- [x] `Card.vue` — one hover/focus/active treatment, replacing the bespoke `.project-card` styles.
- [x] `Tag.vue` — spectral-ramp variants, replacing `.tag` in `ListProjects.vue`.
- [x] `Section.vue` — heading + rule + consistent top margin, replacing the ad-hoc `mt-16` / `border-b` pattern.
- [x] `Link.vue` — external/internal/anchor variants with the arrow affordance and correct `rel`.
- [x] `Meta.vue` — the mono metadata line (dates, venues, arXiv ids) used by talks, papers and notes.
- [x] Audit `ListProjects`, `ListTalks`, `ListTalksByCategory`, `ListPublications`, `ListPosts` and refactor onto the primitives; they currently diverge in padding, radius and hover behaviour.
- [x] Extend `unocss.config.ts` `shortcuts` with the resulting patterns so markdown pages can use them inline.

---

### Phase 5 — Page-level design

- [x] **Home** — the strongest opportunity. Currently plain markdown paragraphs. Design a real above-the-fold: name, one-line positioning, affiliation, current research focus, and a restrained call to contact. Keep it text-first; resist a hero image.
- [x] **Publications** — this is the page an academic visitor came for. Design it properly: highlight state for first-author work, arXiv/DOI/PDF/BibTeX affordances, year grouping, copy-citation action. Currently an empty array behind an unstyled list.
- [x] **Projects** — group headings need hierarchy beyond an underline; consider a spectral accent per category and a denser two-column layout at `lg`.
- [x] **Talks** — a timeline treatment; recording/slides/transcript as consistent icon affordances.
- [x] **Notes** — a proper reading layout: measure, drop-cap or lede treatment, sticky TOC (the current fixed TOC at `markdown.css` is fragile), reading time, prev/next.
- [x] **Photos** — respect the existing blurhash pipeline; add a real lightbox chrome (caption, EXIF, counter) around `App.vue`'s existing keyboard navigation.
- [x] **404 and empty states** — currently unstyled; every list component needs an intentional empty state.

---

### Phase 6 — Motion & the starfield

- [x] Gate `ArtDots.vue` behind `prefers-reduced-motion` and pause it on `document.hidden` / `IntersectionObserver`.
- [x] Cap the frame rate and star count on low-DPI and small viewports; profile against a mid-range laptop, not a workstation.
- [x] Unify every remaining transition on the two duration tokens.
- [x] Consider replacing the generic starfield with something _specific to the work_: a slowly rotating projection of large-scale structure, or a cosmic-web filament field driven by the existing `simplex-noise` dependency. This is the single highest-leverage identity move on the site — it turns decoration into a statement of what the site is about.
- [x] Page transitions: one consistent enter, no exit animation (exit animations always read as lag).

---

### Phase 7 — Accessibility

Treat as a gate, not a phase to skip.

- [ ] `:focus-visible` ring on every interactive element, using `--focus`; remove the `outline: none` in `NavBar.vue`.
- [ ] Verify contrast: all body text ≥ 4.5:1, large text and UI ≥ 3:1 against the actual dark ground. The current `--c-fg-muted: #94a3b8` on `#060913` needs measuring, and the imported greys in `prose.css` certainly fail.
- [ ] Skip-to-content link.
- [ ] Semantic landmarks (`<main>` exists; add `<nav aria-label>`, `<footer>`), heading-order audit per page.
- [ ] `alt` text on every photo (the `.json` sidecars already carry `text` — wire it through).
- [ ] Keyboard trap check in the image modal; `aria-modal`, focus return on close.
- [ ] Run axe-core against every route in CI.

---

### Phase 8 — Performance & production polish

- [ ] Font subsetting (Latin + the maths/Greek glyphs a cosmology site actually needs) and preloading; target **zero layout shift** from font swap.
- [ ] Lighthouse budget in CI: Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100, CLS < 0.05.
- [ ] Audit the `pixi.js` / `d3` / `matter` dependencies — if the demos that needed them are gone, the bundle shouldn't carry them.
- [ ] Print stylesheet (academics print pages; publications and talks should print cleanly).
- [ ] OG images: verify the generated template matches the new type system.
- [ ] Meta completeness: canonical URLs, `article` structured data on notes, `ScholarlyArticle` JSON-LD on publications.

---

### Phase 9 — Governance (so it stays production-grade)

- [ ] `docs/DESIGN.md` — the token reference, type scale, spacing rhythm and component inventory, with rationale. One page, not a wiki.
- [ ] A `/styleguide` route (dev-only) rendering every token, type step and component state on one page. This is what makes drift visible.
- [ ] Stylelint rule (or an ESLint custom rule) banning raw hex, raw px and raw ms in `src/components/**`.
- [ ] Extend the existing Vitest suite with snapshot tests for the UI primitives; add Playwright visual-regression on the key routes.
- [ ] A pre-merge checklist in `CLAUDE.md`: tokens only, focus state present, reduced-motion honoured, contrast checked.

---

## 4. Sequencing

```
Phase 1  Foundations        ← blocking; nothing renders as designed until done
Phase 2  Tokens             ← blocking for 3–6
Phase 3  Architecture
Phase 4  Components         ┐
Phase 5  Pages              ├ can interleave
Phase 6  Motion             ┘
Phase 7  Accessibility      ← gate before any further page work ships
Phase 8  Performance
Phase 9  Governance         ← start the styleguide route during Phase 2
```

**Suggested first commit:** Phase 1 in full. It is small, it is entirely bug-fixing, and it changes how every page looks — which makes every subsequent design decision one you're making against what's actually on screen rather than what you assumed was.

---

## 5. Definition of done

The site is production-grade when all of the following hold:

- No raw hex, px or ms values in any component file.
- Every interactive element has hover, focus-visible, and active states drawn from tokens.
- The type ramp is closed — no font size appears that isn't a scale step.
- Lighthouse: 95+/100/100/100, CLS < 0.05, zero third-party requests.
- Every animation respects `prefers-reduced-motion`.
- A new page can be authored in markdown and look correct with zero bespoke CSS.
- `docs/DESIGN.md` and `/styleguide` exist and match the code.
