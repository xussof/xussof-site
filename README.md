# xussof.github.io site (xussof-site)

Personal site of **xussof** — builder & indie founder. Bilingual (ES/EN),
built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321/xussof-site/
```

## Scripts

| Command          | Action                                   |
| ---------------- | ---------------------------------------- |
| `npm run dev`    | Start the dev server                     |
| `npm run build`  | Build the static site to `dist/`         |
| `npm run preview`| Preview the production build             |
| `npm run check`  | Type-check (`astro check`)               |
| `npm test`       | Run unit tests (Vitest)                  |

## Content

- **Projects:** add a Markdown file in `src/content/projects/` (see the schema in `src/content.config.ts`).
- **Blog:** add a post as a language pair sharing the same filename/slug:
  `src/content/blog/es/<slug>.md` and `src/content/blog/en/<slug>.md`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`withastro/action` and publishes to GitHub Pages. Set **Settings → Pages →
Source = GitHub Actions** once.
