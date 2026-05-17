# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Oscar Hickman's Personal Website

**Project**: oscarhickman.io
**Type**: Academic portfolio & personal website
**Owner**: Oscar Hickman (Cosmology researcher, Durham University)
**License**: MIT (code), CC BY-NC-SA 4.0 (content & images)

## Quick Overview

This is Oscar Hickman's personal website showcasing his work in **machine learning for cosmology**. He's a researcher at Durham University's Institute for Computational Cosmology, applying modern ML techniques (graph networks, simulation-based inference, generative models) to understand the large-scale structure of the Universe.

The site is built as a **static site** using modern web technologies, deployed on Netlify, and includes academic publication listings, talk summaries, project portfolios, photo galleries, and personal notes.

## Tech Stack

### Core Framework

- **Vue 3** (SFC with `<script setup>`)
- **TypeScript** (strict mode)
- **Vite** (build tool & dev server, port 3333)
- **Vite-SSG** (static site generation)
- **Vue Router** (auto-generated from file-based routing in `pages/`)
- **Pinia** (state management)

### Build & Tooling

- **pnpm** (package manager, v10.19.0)
- **UnoCSS** (atomic CSS, with web fonts preset)
- **Unplugin ecosystem**: auto-import, icons, Vue components, Vue router, Vue markdown
- **Markdown processing**: unplugin-vue-markdown with Shiki syntax highlighting
- **Shiki** (code highlighting, vitesse-dark/vitesse-light themes)
- **Shiki Magic Move** (animated code transitions)
- **Shiki Twoslash** (TypeScript inline playground)
- **ESLint** (@antfu/eslint-config with formatters)

### Content & Data Processing

- **Markdown It** with plugins: anchor links, GitHub alerts, link attributes, table of contents
- **Gray Matter** (YAML frontmatter parsing)
- **Sharp** (image optimization, blurhash support)
- **Exifreader** (photo EXIF extraction)
- **Feed** (RSS/Atom generation)

### UI Libraries

- **Floating Vue** (popovers/tooltips)
- **NProgress** (page loading indicator)
- **Vue Use** (@vueuse/core, composition utilities)
- **D3** (d3-hierarchy, d3-shape)
- **Matter.js** (physics simulation, with attractors plugin)
- **Pixi.js** (2D WebGL rendering)
- **Simplex Noise** (procedural generation)

### Deployment & CI

- **Netlify** (hosting with custom domain oscarhickman.io)
- **Node 22** (build environment)
- **Git hooks** (simple-git-hooks, lint-staged)

## Project Structure

```
oscarhickman.io/
├── src/                      # Vue source files
│   ├── App.vue               # Root component with image modal & keyboard navigation
│   ├── main.ts               # Entry point, initializes Vue SSG, Pinia, FloatingVue, NProgress
│   ├── types.ts              # TypeScript interfaces: Post, Talk, TalkPresentation, etc.
│   ├── components/           # Reusable Vue components
│   │   ├── NavBar.vue        # Navigation header
│   │   ├── Footer.vue        # Page footer
│   │   ├── ToggleTheme.vue   # Dark/light mode toggle with view transitions
│   │   ├── ListPosts.vue     # Renders paginated lists of posts
│   │   ├── ListTalks.vue     # Renders list of talks with dates
│   │   ├── ListProjects.vue  # Grid of project cards
│   │   ├── ListPublications.vue
│   │   ├── WrapperPost.vue   # Layout wrapper for markdown posts
│   │   ├── WrapperDemo.vue   # Layout wrapper for interactive demos
│   │   ├── MediaConsumption.vue # Anime/books/games tracking
│   │   ├── ArtPlum.vue       # Procedural art component (simplex noise)
│   │   ├── ArtDots.vue       # Procedural dot pattern
│   │   ├── AsyncSyncQuantum.vue # Interactive Matter.js physics demo
│   │   ├── YouTubeEmbed.vue  # Embeds YouTube videos
│   │   ├── Tweet.vue         # Tweet embeds
│   │   ├── TalkDate.vue      # Talk date formatting
│   │   ├── TextCopy.vue      # Copy-to-clipboard text
│   │   ├── CalCom.vue        # Cal.com booking embed
│   │   ├── icons/            # Custom icon components
│   │   ├── photos/           # Photo gallery components
│   │   ├── slides/           # Slide deck components
│   │   ├── shiki/            # Syntax highlighting components
│   │   └── qrcode/           # QR code components
│   ├── logics/               # Composition functions
│   │   └── index.ts          # isDark(), galleryView, toggleDark() with view transitions
│   ├── store/                # Pinia stores
│   │   └── shiki.ts          # Shiki highlighter initialization, theme management
│   ├── styles/
│   │   ├── main.css          # Global styles, CSS variables, animations
│   │   ├── prose.css         # Markdown prose styling
│   │   └── markdown.css      # Markdown-specific overrides
│   └── data/                 # Data files (TypeScript)
│       ├── projects.ts       # Export projectCategories with 18 GitHub projects
│       ├── publications.ts   # Export publications[] array
│       ├── talks.ts          # Export talks[] array
│       ├── media.ts          # Anime/book/game/song tracking with state
│       └── sponsors-circles.json # Sponsor data
├── pages/                    # File-based routing (Vue Router auto)
│   ├── index.md              # Home page (hero section)
│   ├── projects.md           # Portfolio of 18 GitHub projects (6 categories)
│   ├── publications.md       # Academic publications list
│   ├── talks.md              # Talks and presentations
│   ├── papers.md             # Papers & publications (alt page)
│   ├── giving-talks.md       # Talk info/booking
│   ├── notes.md              # Blog notes listing with SubNav
│   ├── photos.md             # Photo gallery
│   └── [...404].md           # 404 fallback
├── photos/                   # Photo gallery
│   ├── data.ts               # Dynamically loads .json metadata + images
│   ├── p-YYYY-MM-DD-*.json   # Photo metadata (blurhash, caption, lang)
│   └── p-YYYY-MM-DD-*.jpg    # Photo images
├── scripts/                  # Build & utility scripts
│   ├── copy-fonts.ts         # Copy font files to dist
│   ├── copy-sponsors.ts      # Copy sponsor data
│   ├── img-compress.ts       # Image optimization via Sharp
│   ├── img-compress-staged.ts # Compress staged images
│   ├── photos-manage.ts      # CLI for managing photos, EXIF, blurhash
│   ├── redirects.ts          # Generate redirect rules
│   ├── og-template.svg       # OpenGraph image template
│   └── slugify.ts            # URL slug generation
├── public/                   # Static assets
│   └── og/                   # Generated OpenGraph images
├── vite.config.ts            # Vite + plugins configuration
├── tsconfig.json             # TypeScript settings (ESNext, strict: true)
├── eslint.config.js          # ESLint config (@antfu base)
├── unocss.config.ts          # UnoCSS configuration
├── netlify.toml              # Netlify deployment config
├── pnpm-workspace.yaml       # Dependency versions (catalogs)
├── package.json              # Dependencies & build scripts
└── index.html                # Entry HTML

Components directory also contains:
- quansync/      - Quantum-themed component demos
- slides/        - Reveal.js-style slide components
```

## Key Scripts & Commands

```bash
# Development
pnpm dev                 # Start dev server (http://localhost:3333, hot reload enabled)

# Production
pnpm build               # Pre-render all routes to static HTML via Vite-SSG, output to dist/
pnpm preview             # Preview production build locally

# Content & Utilities
pnpm static              # Download sponsor data via degit
pnpm photos              # CLI: manage photos, extract EXIF, generate blurhash
pnpm compress            # Compress all images with Sharp
pnpm lint                # ESLint check

# Deployment
# Netlify auto-deploys on push (builds with pnpm run build, publishes dist/)
```

**Dev Server Notes:**

- Hot module reload (HMR) for instant feedback on component/style changes
- Sourcemaps enabled for debugging
- Runs on `http://localhost:3333` with live updates

## Data Model & Content Types

### Projects (src/data/projects.ts)

```typescript
interface ProjectItem {
  name: string
  link: string
  desc: string
  icon: string
  tags?: string[]
}

interface ProjectCategory {
  name: string
  projects: ProjectItem[]
}

export const projectCategories: ProjectCategory[] = [
  { name: 'ML for Cosmology & Physics', projects: [/* ... */] },
  { name: 'Software & Applications', projects: [/* ... */] },
  { name: 'Hardware & Assembly', projects: [/* ... */] },
  { name: 'Academic & Publications', projects: [/* ... */] },
  { name: 'Web & Personal', projects: [/* ... */] },
]
```

Populated with **18 GitHub projects** across 5 categories, each with name, GitHub link, description, Carbon icon, and optional tags (language, domain, type).

### Publications (src/data/publications.ts)

```typescript
interface Publication {
  title: string
  authors: string
  year: number
  venue?: string
  arxiv?: string // identifier only, e.g., "2501.01234"
  doi?: string // e.g., "10.xxxx/xxxxx"
  highlight?: boolean
}
```

Currently empty array (placeholder for future content).

### Talks (data/talks.ts)

```typescript
interface Talk {
  title: string
  description?: string
  series?: string
  lang?: string
  presentations: TalkPresentation[]
}

interface TalkPresentation {
  lang?: string
  date: string
  location?: string
  conference: string
  conferenceUrl: string
  recording?: string
  transcript?: string
  pdf?: string
  spa?: string // Single Page App demo URL
}
```

Currently empty array (placeholder).

### Media (data/media.ts)

Tracks personal media consumption:

```typescript
type MediaType = 'anime' | 'book' | 'movie' | 'drama' | 'game' | 'song'
type MediaState = 'done' | 'doing' | 'todo'

interface MediaRecord {
  name: string
  creator?: string
  state?: MediaState
  date?: string
  note?: string
  lang?: string
}
```

Populated with anime entries (FMA, Frieren, NGNL, Cyberpunk Edgerunners, Fate/Zero, etc.).

### Photos (photos/data.ts)

Dynamic photo gallery using Vite's glob imports:

```typescript
interface Photo extends PhotoMate {
  name: string
  url: string
}

interface PhotoMate {
  text?: string
  lang?: string
  blurhash?: string
}
```

Each photo has optional `.json` metadata file with caption & blurhash for lazy loading.

### Markdown Frontmatter (pages/\*.md)

```yaml
---
title: Page Title
description: Meta description
image: /og/page-slug.png # Auto-generated or custom
art: random|dots|plum # Background art component
display: Display Name
lang: en
date: YYYY-MM-DD
---
```

## Build Pipeline & Special Features

### Markdown to Vue

- **unplugin-vue-markdown**: converts `.md` files to Vue components with full Vue syntax support
  - Embed components directly: `<MyComponent />` (auto-imported, no manual import needed)
  - Can mix Markdown and Vue in the same file
- **Frontmatter metadata** → route meta + page head
- **Auto-generated OpenGraph images**: if no custom `.png` exists, generates from title using template SVG + Sharp
- **Syntax highlighting**: Shiki with vitesse theme + twoslash support
- **Table of contents**: auto-generated from headings with anchor links

### Static Site Generation

- **Vite-SSG**: pre-renders all routes to static HTML during `pnpm build`
  - Dev server runs internally to execute each page and generate static output
  - No client-side routing overhead in final output
- **File-based routing**: each `.md` in `pages/` becomes a route
  - `pages/index.md` → `/`
  - `pages/notes.md` → `/notes`
  - `pages/notes/my-post.md` → `/notes/my-post`
  - `pages/[...404].md` → fallback 404 handler
- **Markdown content**: automatically becomes page components

### Image Processing

**Photo Workflow:**

1. Drop new photos into `unprocessed_photos/` directory (supports JPG, PNG, HEIC).
2. Run `pnpm photos:import` — automatically:
   - Converts HEIC to JPG.
   - Extracts EXIF metadata (date, location, camera).
   - Performs **pixel-based deduplication** (removes visually identical files even with different names).
   - Resizes and squares images (1440px max) with metadata.
   - Generates blurhashes.
   - **Deletes files** from `unprocessed_photos/` after success.
3. Run `pnpm photos:captions` to interactively add captions (automatically opens the photo in your default viewer).
4. Commit both `.jpg` and generated `.json` metadata.

**Other image processing:**

- **OG image generation**: `scripts/og-template.svg` + Sharp render title as PNG (auto-generated at build time if missing)
- **Sharp optimization**: `pnpm compress` optimizes staged images (lossless compression, format conversion)
- **Blurhash**: low-resolution placeholder hash strings for fade-in effect on photo load

### UI Polish

- **Dark mode**: View transitions API for smooth theme toggle
- **Image modal**: click any prose image to open fullscreen with arrow key navigation
- **Gallery view modes**: toggle between 'cover' and 'contain' (persisted to localStorage)
- **NProgress**: page transition progress indicator
- **Smooth scrolling**: vue-router-better-scroller with sliding transitions

### Icons & Graphics

- **Unplugin Icons**: on-demand icon loading (Iconify sets)
- **SVG loader**: inline SVG rendering
- **Procedural art**: custom noise-based components (ArtPlum, ArtDots)
- **Physics demo**: Matter.js interactive simulator

## Deployment & Hosting

### Netlify Configuration

- **Build command**: `pnpm run build`
- **Publish directory**: `dist/`
- **Node version**: 22
- **Cache control**: 1 year immutable for `/assets/*` (hash-based)
- **SPA fallback**: all routes → index.html (200 status for routing)
- **Custom domain**: oscarhickman.io (HTTPS auto)

### GitHub Pages Fallback

- Alternative domain: `oscarhickman.github.io/OscarHickman.io` (with path prefix)
- Controlled via `USE_CUSTOM_DOMAIN` env variable

## Key Design Patterns

1. **File-based routing**: pages auto-discovered, no manual route definitions
2. **Markdown-first content**: blogs, pages, notes all `.md` files
3. **Typed frontmatter**: gray-matter + TypeScript interfaces
4. **Dynamic data**: glob imports for photos, lazy component loading
5. **SSG optimization**: pre-rendered HTML, no client-side routing overhead
6. **CSS-in-JS**: UnoCSS atomic classes, scoped Vue styles
7. **Composition API**: all Vue components use `<script setup>`
8. **Stores**: Pinia for shared state (theme, highlighter)

## Content Organization

- **Home**: intro + contact info
- **Projects**: comprehensive portfolio of 18 GitHub projects across 5 categories:
  - ML for Cosmology & Physics (6 projects)
  - Software & Applications (5 projects)
  - Hardware & Assembly (2 projects)
  - Academic & Publications (3 projects)
  - Web & Personal (2 projects)
- **Publications**: will list arxiv/DOI papers (currently empty placeholder)
- **Talks**: presentations with dates, locations, recordings (currently empty placeholder)
- **Papers**: alt view for publications
- **Giving Talks**: booking info (Cal.com embed)
- **Notes**: blog-style personal thoughts with SubNav for categories
- **Photos**: image gallery with metadata and blurhash lazy loading
- **Media**: personal entertainment tracking (not public-facing)

## Context for AI Agents

### Development Workflow

1. **Add page**: create `.md` file in `pages/` (file structure maps to URLs automatically)
2. **Add content**: write Markdown with Vue `<script setup>` blocks and embedded components
3. **Add frontmatter**: `title`, `description`, `image`, `art` keys for metadata
4. **Use components**: components from `src/components/` are auto-imported, just use `<ComponentName />`
5. **Style**:
   - **UnoCSS classes** for layout, spacing, utilities (default choice)
   - **Scoped `<style>`** for component-specific styling or complex selectors
   - **CSS variables** in `src/styles/main.css` for theme colors

### Common Tasks

- **Adding/updating projects**: edit `src/data/projects.ts`:
  - Add project to appropriate `ProjectCategory`
  - Include: name, GitHub link, description, icon (Iconify class), tags
  - Projects auto-render via `ListProjects` component on `/projects` page
  - Use Carbon icons (e.g., `i-carbon-chart-scatter`) for consistency
- **Adding publications**: edit `src/data/publications.ts`, add to array (will populate automatically)
- **Adding talks**: edit `src/data/talks.ts`, structure with date + conference (will populate automatically)
- **Managing photos**: place `.jpg` in `photos/`, run `pnpm photos`, commit both `.jpg` and generated `.json`
- **Creating interactive demo**: follow AsyncSyncQuantum pattern:
  - Create component in `src/components/` with `<script setup>` + reactive state
  - Import graphics library (Matter.js, Pixi, etc.) as needed
  - Handle canvas/DOM rendering and cleanup on unmount
  - Embed in `.md` page as `<AsyncSyncQuantum />`
- **Dark mode**: handled by `logics/index.ts` with View Transitions API for smooth toggle

### Build Artifacts & Version Control

**Commit to git:**

- Source code: `src/`, `pages/`, `data/`, scripts
- Photos: both `.jpg` image AND generated `.json` metadata
- Config files: `vite.config.ts`, `tsconfig.json`, `package.json`, etc.

**Generated (ignored):**

- `dist/` — final static site output from `pnpm build`
- `.output/` — Vite-SSG cache
- `public/og/*.png` — auto-generated OpenGraph images (regenerated at build time)
- `node_modules/` — dependencies
- `.env.local` — local environment variables

The build process regenerates OG images and all static output, so only source needs version control.

### Performance Optimizations

- Static site (zero runtime overhead)
- Code splitting via Vite
- Image optimization via Sharp
- Blurhash lazy loading
- CSS scoped to components
- Auto-import only what's used

### Testing & Validation

- **ESLint**: `pnpm lint` (rules in eslint.config.js)
- **Types**: strict TypeScript in tsconfig.json
- **Build**: `pnpm build` generates static dist/

### Common Pitfalls & Notes

1. **Pages routing**: `.md` files must be in `pages/` directory to create routes (auto-discovered by Vite-SSG)
2. **Markdown + Vue**: can embed components directly (`<MyComponent />`) — they auto-import, no manual import needed
3. **Frontmatter**: required for route metadata (title, description for head tags, OG images)
4. **Photos**: must run `pnpm photos` after adding `.jpg` to generate `.json` metadata (blurhash, captions)
5. **Icons**: use Iconify class names (`i-ri-menu-2-fill`), not img tags
6. **Build output**: `dist/` is generated static site, not for version control — gitignore it
7. **OG images**: `public/og/` directory is auto-generated at build time, don't commit — only commit custom `.png` overrides to `public/`
8. **Styling**: use UnoCSS for layout/utilities, scoped `<style>` for component-specific CSS

### Future Expansion

- [x] **Projects section** — fully populated with 18 GitHub projects across 5 categories
- [ ] Populate publications array with arxiv/DOI entries (add to `src/data/publications.ts`)
- [ ] Add talks with presentation metadata (add to `src/data/talks.ts`)
- [ ] Expand notes section with cosmology/ML insights (add blog posts to `pages/notes/`)
- [ ] Add interactive demos beyond existing components (see AsyncSyncQuantum pattern for reference)
- [ ] Enhance individual project READMEs on GitHub with more detail

---

_Last updated: May 2026_
_This summary is designed to help AI agents quickly understand the project structure, tooling, and conventions._
