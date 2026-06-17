# xussof.com — personal site

Personal site of **xussof** — builder & indie founder. Bilingual (ES/EN),
built with [Astro](https://astro.build) and deployed to GitHub Pages on the
custom domain [xussof.com](https://xussof.com).

## Develop

```bash
npm install
npm run dev      # http://localhost:4321/
```

## Scripts

| Command               | Action                                |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Start the dev server                  |
| `npm run build`       | Build the static site to `dist/`      |
| `npm run preview`     | Preview the production build          |
| `npm run check`       | Type-check (`astro check`)            |
| `npm test`            | Run unit tests (Vitest)               |
| `npm run generate:og` | Regenerate the OG image from the SVG  |

## Content

- **Projects:** add a Markdown file in `src/content/projects/` (see the schema in `src/content.config.ts`).
- **Blog:** add a post as a language pair sharing the same filename/slug:
  `src/content/blog/es/<slug>.md` and `src/content/blog/en/<slug>.md`.
- **OG image:** `public/og-image.png` is generated from `public/og-image.svg`; after editing the SVG run `npm run generate:og`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`withastro/action` and publishes to GitHub Pages. One-time setup:
**Settings → Pages → Source = GitHub Actions**.

The site is served from the custom domain **xussof.com** (`public/CNAME`);
`astro.config.mjs` sets `site: 'https://xussof.com'` with no `base`.

## License

[MIT](LICENSE) © xussof
