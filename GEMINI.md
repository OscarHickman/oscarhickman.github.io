# Oscar Hickman Portfolio

This is the source code for [oscarhickman.io](https://oscarhickman.io), a personal website and research portfolio for Oscar Hickman, a Machine Learning Cosmology researcher.

## Project Overview

The project is a high-performance, Markdown-driven static site built with **Vue 3** and **Vite**. It uses a Static Site Generation (SSG) approach for optimal performance and SEO.

### Key Technologies

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API)
- **SSG:** [vite-ssg](https://github.com/antfu/vite-ssg)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [UnoCSS](https://unocss.dev/) (Utility-first CSS engine)
- **Routing:** [unplugin-vue-router](https://github.com/posva/unplugin-vue-router) (File-based routing)
- **Content:** [unplugin-vue-markdown](https://github.com/antfu/unplugin-vue-markdown) (Markdown as Vue components)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Icons:** [unplugin-icons](https://github.com/antfu/unplugin-icons) (Iconify)
- **Image Processing:** [Sharp](https://sharp.pixelplumbing.com/) (via custom scripts)

## Directory Structure

- `pages/`: Contains the main content of the site as `.md` or `.vue` files. Routing is automatically generated from this directory.
- `src/`:
  - `components/`: Reusable Vue components.
  - `data/`: Data files for publications, talks, and media.
  - `styles/`: Global styles and UnoCSS overrides.
  - `logics/`: Shared composition utilities.
- `scripts/`: Utility scripts for build-time tasks (OG image generation, image compression, etc.).
- `photos/`: Source images and metadata for the photography section.
- `public/`: Static assets served at the root.

## Building and Running

### Development

Start the development server with hot-module replacement:

```bash
pnpm dev
```

The site will be available at `http://localhost:3333`.

### Production Build

Generate the static site:

```bash
pnpm build
```

This triggers `vite-ssg build`, runs custom scripts (OG image generation, font copying), and outputs the site to `dist/`.

### Maintenance Scripts

- **Linting:** `pnpm lint`
- **Image Compression:** `pnpm compress`
- **Photo Management:** `pnpm photos`
- **Redirects Generation:** `pnpm redirects`

## Development Conventions

- **Code Style:** Follows [@antfu/eslint-config](https://github.com/antfu/eslint-config). Use `pnpm lint` to fix issues.
- **Components:** Prefer functional and composable components. Use `unplugin-vue-components` for auto-importing.
- **Icons:** Use the pattern `<i-collection-name />` to include icons from Iconify.
- **Markdown:** Markdown files in `pages/` support frontmatter, which is used for metadata (title, description, image).
- **Static Assets:** Large images should be processed via `scripts/img-compress.ts` before being committed or used.
