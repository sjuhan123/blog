# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:4321)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Format with Prettier and fix ESLint issues
```

## Architecture

This is an **Astro 4** personal blog (den-eight.vercel.app) with React islands, Tailwind CSS, and MDX content.

### Content Collections (`src/content/`)

Two collections defined in `src/content/config.ts`:

- **`blog/`** — Technical blog posts (`.md`/`.mdx`). Frontmatter: `title`, `publishDate`, `excerpt`, `tags`, `isFeatured`, `seo`.
- **`memory/`** — Daily diary entries named `YYYY-MM-DD.md`. Frontmatter: `title`, `publishDate`, `tags`.

### Pages & Routing

- `/` — Hero page (profile/about)
- `/blog` — Paginated post list; `/blog/[slug]` — individual post with Giscus comments
- `/memory` — Calendar-based diary; `/memory/[slug]` — individual day view with `Calender.tsx` React component

### Key Files

- `src/data/site-config.ts` — Site title, nav links, hero content, social links. Edit here to change global site metadata.
- `src/layouts/BaseLayout.astro` — Root layout (dark mode toggle, view transitions, nav).
- `src/utils/data-utils.ts` — Helpers for sorting posts and tag filtering.
- `src/utils/common-utils.ts` — `slugify` and other utilities.
- `src/constants/giscus.ts` — Giscus comment configuration.

### Styling

- Tailwind with `darkMode: 'class'` — dark mode toggled via `localStorage.theme`.
- Custom `prose-dante` typography variant defined in `tailwind.config.cjs`.
- CSS variables for theme colors (`--color-text-main`, `--color-bg-main`, etc.) in `src/styles/global.css`.
- MDX content styled via `src/styles/mdx.css` with the `.mdx` class.

### Code Style

- Single quotes, 2-space indent, trailing commas (see `.prettierrc.cjs`).
- Imports must be sorted (`simple-import-sort`) and unused imports are errors.
- Use `type` imports consistently (`@typescript-eslint/consistent-type-imports`).
