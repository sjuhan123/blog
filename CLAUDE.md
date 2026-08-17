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

## Publishing a post from Obsidian

Posts are drafted in the Obsidian vault (`iCloud~md~obsidian/Documents/개발공부/02. 영역/01. 블로그/02. 기술기록/`) and migrated here to publish. When asked to publish/deploy a post from Obsidian, do the following:

1. **Pick an English slug** for the post (existing posts use English filenames even though titles are Korean, e.g. `cra-boilerplate-1`).
2. **Images**: copy referenced images from the Obsidian note's `attachments/` folder into `public/blog/<slug>/`, renamed to short descriptive English names (not the timestamp filenames Obsidian's img-clip.nvim generates). Rewrite image links in the copied content from `attachments/foo.png` to `/blog/<slug>/foo.png`.
3. **Frontmatter**: add `title`, `excerpt`, `publishDate` (`'Mon D YYYY'` format, matching existing posts), `tags` (English, Capitalized — see existing posts for the tag vocabulary already in use before inventing new ones), and `seo.description`. Draft these and show them for confirmation rather than guessing silently — they're editorial choices, not mechanical.
4. **Obsidian wikilinks** (`[[note name]]`): the vault has internal links between notes that aren't public. Strip them to plain text unless the linked note is *also* a published post in this repo's `blog/` collection, in which case link to it via its slug instead.
5. **Write** the result to `src/content/blog/<slug>.md`.
6. **Verify**: run `npm run build` and confirm the new post's page + its images appear under `dist/blog/<slug>/` before committing. `dist/` is gitignored, this is just a sanity check.
7. **Commit and push** to `main` — Vercel auto-deploys on push (no manual deploy step). Always show the diff/commit and get explicit confirmation before `git push`, even though the overall workflow is expected to repeat — publishing is a public, hard-to-quietly-undo action.

Note: `public/` currently also has a couple of stray flat images (`노인복지관...png`) from before this per-post-folder convention existed. New posts should use `public/blog/<slug>/`, not the flat root.
