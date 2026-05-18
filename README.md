**[oscarhickman.github.io](https://oscarhickman.github.io)**

my personal website

<br>

<samp>code is licensed under <a href='./LICENSE'>MIT</a>,<br> words and images are licensed under <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/'>CC BY-NC-SA 4.0</a></samp>.

---

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

## Building and Running

### Development

```bash
pnpm dev
```

### Production Build

GitHub build: [Build and Deploy](https://github.com/OscarHickman/OscarHickman.io/actions/workflows/build.yml)

```bash
pnpm build
```

### Maintenance Scripts

- **`pnpm lint`**: Lint and fix code style.
- **`pnpm photos:import`**: Automated photo import from `unprocessed_photos/`. Handles HEIC conversion, metadata extraction, pixel-based deduplication, and automatic folder cleanup.
- **`pnpm photos:captions`**: Interactive visual tool for adding captions. Automatically opens the photo as you are prompted.
- **`pnpm compress`**: Compress large static images.
- **`pnpm redirects`**: Generate site redirects.

## Development Conventions

- **Code Style:** Follows [@antfu/eslint-config](https://github.com/antfu/eslint-config).
- **Icons:** Use `<i-collection-name />` pattern.
- **Static Assets:** New photos should be processed via `pnpm photos:import`.
