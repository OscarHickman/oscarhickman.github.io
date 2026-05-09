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
│   └── data/                 # Shared composables (actually in root data/)
├── pages/                    # File-based routing (Vue Router auto)
│   ├── index.md              # Home page (hero section)
│   ├── projects.md           # Portfolio of academic projects
│   ├── publications.md       # Academic publications list
│   ├── talks.md              # Talks and presentations
│   ├── papers.md             # Papers & publications (alt page)
│   ├── giving-talks.md       # Talk info/booking
│   ├── notes.md              # Blog notes listing
│   ├── photos.md             # Photo gallery
│   └── [...404].md           # 404 fallback
├── data/                     # Content data files
│   ├── publications.ts       # Export publications[] array
│   ├── talks.ts              # Export talks[] array
│   └── media.ts              # Anime/book/game/song tracking with state
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
pnpm dev                 # Start dev server (http://localhost:3333)

# Production
pnpm build               # Build static site (runs vite-ssg)
pnpm preview             # Preview production build locally

# Content & Utilities
pnpm static              # Download sponsor data via degit
pnpm photos              # CLI: manage photos, extract EXIF, generate blurhash
pnpm compress            # Compress all images with Sharp
pnpm lint                # ESLint check

# Deployment
# Netlify auto-deploys on push (builds with pnpm run build, publishes dist/)
```

## Data Model & Content Types

### Publications (data/publications.ts)

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

- **unplugin-vue-markdown**: converts `.md` files to Vue components
- **Frontmatter metadata** → route meta + page head
- **Auto-generated OpenGraph images**: if no custom `.png` exists, generates from title using template SVG + Sharp
- **Syntax highlighting**: Shiki with vitesse theme + twoslash support
- **Table of contents**: auto-generated from headings with anchor links

### Static Site Generation

- **Vite-SSG**: pre-renders all routes to static HTML
- **URL-based routing**: pages auto-discovered from `pages/` directory
- **Markdown content**: becomes route files automatically

### Image Processing

1. **Photo compression**: `pnpm photos` CLI extracts EXIF, generates blurhash
2. **OG image generation**: `scripts/og-template.svg` + Sharp render title as PNG
3. **Sharp optimization**: `pnpm compress` optimizes staged images
4. **Blurhash**: low-resolution placeholder hashes for photos

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
- **Projects**: links to GitHub repos (academic + assembly)
- **Publications**: will list arxiv/DOI papers (currently empty)
- **Talks**: presentations with dates, locations, recordings (currently empty)
- **Papers**: alt view for publications
- **Giving Talks**: booking info (Cal.com embed)
- **Notes**: blog-style personal thoughts
- **Photos**: image gallery with metadata
- **Media**: personal entertainment tracking (not public-facing)

## Context for AI Agents

### Development Workflow

1. **Add page**: create `.md` file in `pages/`
2. **Add content**: write Markdown with Vue `<script setup>` blocks
3. **Add frontmatter**: `title`, `description`, `image`, `art` keys
4. **Component reuse**: auto-imported from `src/components/`
5. **Style**: use UnoCSS classes or scoped `<style>`

### Common Tasks

- **Adding publications**: edit `data/publications.ts`, add to array
- **Adding talks**: edit `data/talks.ts`, structure with date + conference
- **Managing photos**: use `pnpm photos` CLI to process images, EXIF → blurhash
- **Updating projects**: edit `pages/projects.md` (data is inline)
- **Dark mode**: handled by `logics/index.ts`, View Transitions API

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

1. **Pages routing**: must be in `pages/` directory (auto-discovered)
2. **Components**: auto-imported from `src/components/`, no manual imports needed
3. **Frontmatter**: required for metadata (head tags, OG images)
4. **Images**: photos need matching `.json` metadata for blurhash/captions
5. **Icons**: use Iconify class names (e.g., `i-ri-menu-2-fill`)
6. **Build output**: `dist/` is final static site, not for version control

### Future Expansion

- [ ] Populate publications array with arxiv/DOI entries
- [ ] Add talks with presentation metadata
- [ ] Expand notes section with cosmology/ML insights
- [ ] Enhance project descriptions
- [ ] Add interactive demos (see AsyncSyncQuantum component pattern)

---

_Last updated: May 2026_
_This summary is designed to help AI agents quickly understand the project structure, tooling, and conventions._
