# xussof Personal Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (ES/EN) static personal site for xussof — hero, about, projects, blog and contact — with the "Warm Playful Pop" style, deployed to GitHub Pages.

**Architecture:** Astro static site (SSG). Spanish is the default locale at the root; English lives under `/en/` via Astro's native i18n routing. Content (projects + blog posts) lives in Markdown Content Collections. UI strings and date formatting live in a small, unit-tested `src/i18n` module. Presentation is plain CSS (design tokens + scoped component styles), no utility framework.

**Tech Stack:** Astro · `@astrojs/sitemap` · `@fontsource-variable` (Fraunces + Plus Jakarta Sans) · Vitest (unit tests for i18n logic) · GitHub Actions + GitHub Pages.

---

## Conventions used throughout this plan

- **Package manager:** npm.
- **Locales:** `es` (default, unprefixed) and `en` (prefixed `/en/`).
- **Blog posts are language pairs that share a slug.** A post is one logical entity with two files: `src/content/blog/es/<slug>.md` and `src/content/blog/en/<slug>.md`. The filename (= slug) MUST match across languages so the language toggle and `hreflang` links resolve. Titles/bodies are localized; the slug is not.
- **Internal links** are always built with `getRelativeLocaleUrl(lang, route)` from `astro:i18n` — this automatically adds the `base` (`/xussof-site/`) and the locale prefix. Never hand-write `/en/...` paths.
- **`route`** is the *logical* path (no base, no locale): `''` for home, `'blog/'` for the blog index, `'blog/<slug>/'` for a post. Pages pass `route` down so the language toggle and canonical/alternate links work.
- After every task: stage only the files that task touched and commit.

## File map

```
xussof-site/
├─ package.json                      # scripts + deps (Task 1)
├─ tsconfig.json                     # strict TS (Task 1)
├─ astro.config.mjs                  # site/base, i18n, sitemap (Task 1)
├─ vitest.config.ts                  # unit test config (Task 1)
├─ scripts/
│  └─ generate-og.mjs               # (Task 15) regenerates public/og-image.png from SVG via sharp
├─ src/
│  ├─ env.d.ts                       # Astro types ref (Task 1)
│  ├─ styles/
│  │  ├─ tokens.css                  # design tokens (Task 2)
│  │  └─ global.css                  # reset, base, layout utilities, .prose (Task 2)
│  ├─ i18n/
│  │  ├─ ui.ts                       # string dictionaries (Task 3)
│  │  ├─ utils.ts                    # useTranslations, formatDate (Task 3)
│  │  └─ utils.test.ts               # Vitest unit tests (Task 3)
│  ├─ content.config.ts              # collection schemas (Task 4)
│  ├─ content/
│  │  ├─ projects/
│  │  │  ├─ yourbrandontime.md       # (Task 4)
│  │  │  └─ thecitymesh.md           # (Task 4)
│  │  └─ blog/
│  │     ├─ es/welcome.md            # (Task 4)
│  │     └─ en/welcome.md            # (Task 4)
│  ├─ components/
│  │  ├─ SEO.astro                   # (Task 5)
│  │  ├─ Nav.astro                   # (Task 6)
│  │  ├─ LangToggle.astro            # (Task 6)
│  │  ├─ Hero.astro                  # (Task 7)
│  │  ├─ About.astro                 # (Task 8)
│  │  ├─ ProjectCard.astro           # (Task 9)
│  │  ├─ NoteCard.astro              # (Task 10)
│  │  ├─ ContactCTA.astro            # (Task 11)
│  │  └─ Footer.astro                # (Task 11)
│  ├─ layouts/
│  │  └─ BaseLayout.astro            # (Task 5)
│  └─ pages/
│     ├─ index.astro                 # ES home (Task 12)
│     ├─ robots.txt.ts               # (Task 15) dynamic robots.txt endpoint — Sitemap URL derived from site+base
│     ├─ blog/
│     │  ├─ index.astro              # ES blog index (Task 13)
│     │  └─ [slug].astro             # ES post (Task 14)
│     └─ en/
│        ├─ index.astro              # EN home (Task 12)
│        └─ blog/
│           ├─ index.astro           # EN blog index (Task 13)
│           └─ [slug].astro          # EN post (Task 14)
├─ public/
│  ├─ favicon.svg                    # (Task 15)
│  ├─ og-image.svg                   # (Task 15) design source
│  └─ og-image.png                   # (Task 15) generated 1200×630 PNG — run `npm run generate:og` to regenerate
└─ .github/workflows/deploy.yml      # (Task 16)
```

---

## Task 1: Project scaffold & tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `astro.config.mjs`, `vitest.config.ts`, `src/env.d.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "xussof-site",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest",
    "generate:og": "node scripts/generate-og.mjs"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install astro @astrojs/sitemap @fontsource-variable/fraunces @fontsource-variable/plus-jakarta-sans
npm install -D vitest @astrojs/check typescript sharp
```
Expected: installs succeed; `astro`, `@astrojs/sitemap`, the two `@fontsource-variable/*` packages land in `dependencies`, and `vitest`/`@astrojs/check`/`typescript`/`sharp` in `devDependencies`.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Create `src/env.d.ts`**

```ts
/// <reference types="astro/client" />

// @fontsource-variable packages ship CSS only (no type declarations);
// declare them so the side-effect imports in BaseLayout type-check under
// strict + bundler module resolution.
declare module '@fontsource-variable/fraunces';
declare module '@fontsource-variable/plus-jakarta-sans';
```

> Note: the two `declare module` lines may be added now or when `BaseLayout` first imports the fonts (Task 5) — either way they must exist before `astro check` will pass once the font imports are present.

- [ ] **Step 5: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages "project page" URL: https://xussof.github.io/xussof-site/
// If a custom domain is added later, set `site` to it and `base` to '/'.
export default defineConfig({
  site: 'https://xussof.github.io',
  base: '/xussof-site',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
});
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 7: Verify the toolchain installs and type-checks**

Run: `npx astro sync && npm run check`
Expected: `astro sync` generates `.astro/types.d.ts`; `astro check` reports `0 errors` (it may warn about 0 pages — that's fine at this stage).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs vitest.config.ts src/env.d.ts
git commit -m "chore: scaffold Astro project with i18n, sitemap and vitest"
```

---

## Task 2: Design tokens & global styles

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/tokens.css`**

```css
:root {
  /* Palette — Warm Playful Pop */
  --bg: #fff7ef;
  --ink: #2a221b;
  --muted: #6b5d4f;
  --card-border: #f0e6d8;
  --card-shadow: #f4eadb;
  --code-bg: #fff;

  --pink: #ff5d8f;   --pink-sh: #d63e6e;
  --yellow: #ffd166; --yellow-sh: #eec476;
  --blue: #c6e7ff;   --blue-sh: #9cccef;
  --green: #bdebc4;  --green-sh: #97d6a1;

  /* Typography */
  --font-display: 'Fraunces Variable', Georgia, serif;
  --font-body: 'Plus Jakarta Sans Variable', system-ui, sans-serif;

  /* Radii & layout */
  --radius-card: 22px;
  --radius-pill: 999px;
  --maxw: 1080px;
}
```

- [ ] **Step 2: Create `src/styles/global.css`**

```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--ink);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }

:focus-visible { outline: 3px solid var(--pink); outline-offset: 2px; }

/* Layout utilities (used by pages) */
.wrap { max-width: var(--maxw); margin: 0 auto; padding: 0 28px; }
.sec { padding: 56px 0; }
.sec-h { display: flex; align-items: baseline; gap: 14px; margin-bottom: 28px; }
.sec-h .kicker {
  font-size: 13px; font-weight: 800; letter-spacing: .12em;
  text-transform: uppercase; color: var(--pink);
}
.sec-h h1, .sec-h h2 {
  font-family: var(--font-display); font-weight: 900;
  font-size: 34px; letter-spacing: -.02em;
}
.muted { color: var(--muted); }

.pcards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.notes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

/* Blog post body */
.prose { max-width: 70ch; }
.prose p { margin: 0 0 1.1em; color: var(--ink); }
.prose h2 { font-family: var(--font-display); font-size: 26px; margin: 1.4em 0 .5em; letter-spacing: -.01em; }
.prose h3 { font-family: var(--font-display); font-size: 21px; margin: 1.2em 0 .4em; }
.prose ul, .prose ol { margin: 0 0 1.1em 1.2em; }
.prose li { margin: .3em 0; }
.prose a { color: var(--pink-sh); text-decoration: underline; }
.prose code {
  font-family: ui-monospace, monospace; font-size: .9em;
  background: var(--code-bg); border: 1px solid var(--card-border);
  padding: 1px 6px; border-radius: 6px;
}

@media (max-width: 760px) {
  .pcards, .notes { grid-template-columns: 1fr; }
  .sec-h h1, .sec-h h2 { font-size: 28px; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/
git commit -m "feat: add design tokens and global styles"
```

---

## Task 3: i18n dictionaries & utilities (TDD)

**Files:**
- Create: `src/i18n/ui.ts`, `src/i18n/utils.ts`
- Test: `src/i18n/utils.test.ts`

> These files must NOT import anything from `astro:*` — they are pure TS so Vitest can run them without the Astro runtime.

- [ ] **Step 1: Create `src/i18n/ui.ts` (the dictionaries)**

```ts
export const languages = { es: 'Español', en: 'English' } as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'es';

export const ui = {
  es: {
    'nav.projects': 'Proyectos',
    'nav.about': 'Sobre mí',
    'nav.blog': 'Blog',
    'nav.contact': 'Hablemos',

    'hero.badge': 'Disponible para nuevos proyectos',
    'hero.title': 'Hago producto digital con <span class="hl">buen rollo</span> y buen gusto.',
    'hero.lead': 'Builder & indie founder. Convierto ideas en producto real —de la IA al 3D en el navegador— y disfruto los detalles que se notan.',
    'hero.ctaProjects': 'Ver proyectos →',
    'hero.ctaAbout': 'Sobre mí',

    'about.kicker': 'Sobre mí',
    'about.heading': 'Quién soy',
    'about.body': 'Soy <b>xussof</b>. Diseño y construyo productos de principio a fin: pienso el problema, lo prototipo y lo lanzo. Me mueve hacer cosas <b>útiles, cuidadas y con personalidad</b>. Ahora mismo, entre la IA aplicada y la web interactiva.',

    'projects.kicker': 'Proyectos',
    'projects.heading': 'En lo que trabajo',

    'blog.kicker': 'Blog / Notas',
    'blog.heading': 'Cosas que escribo',
    'blog.empty': 'Todavía no hay publicaciones. ¡Pronto!',
    'blog.backHome': 'Volver al inicio',

    'contact.heading': '¿Construimos algo?',
    'contact.body': 'Escríbeme para colaborar, contratar o charlar de producto.',
    'contact.email': 'Email',
    'contact.linkedin': 'LinkedIn',
    'contact.github': 'GitHub',
    'contact.x': 'X',

    'footer.madeWith': 'Hecho con Astro',

    'meta.homeTitle': 'xussof — builder & indie founder',
    'meta.homeDesc': 'Web personal de xussof: builder e indie founder. Proyectos: YourBrandOnTime y The City Mesh.',
    'meta.blogTitle': 'Blog — xussof',
    'meta.blogDesc': 'Notas de xussof sobre producto, IA y construir cosas en la web.',
  },
  en: {
    'nav.projects': 'Projects',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'nav.contact': 'Say hi',

    'hero.badge': 'Available for new projects',
    'hero.title': 'I build digital products with <span class="hl">good vibes</span> and good taste.',
    'hero.lead': 'Builder & indie founder. I turn ideas into real products —from AI to 3D in the browser— and I sweat the details that show.',
    'hero.ctaProjects': 'See projects →',
    'hero.ctaAbout': 'About me',

    'about.kicker': 'About',
    'about.heading': 'Who I am',
    'about.body': "I'm <b>xussof</b>. I design and build products end to end: I frame the problem, prototype it and ship it. I'm driven by making things that are <b>useful, polished and full of character</b>. Right now, somewhere between applied AI and interactive web.",

    'projects.kicker': 'Projects',
    'projects.heading': 'What I work on',

    'blog.kicker': 'Blog / Notes',
    'blog.heading': 'Things I write',
    'blog.empty': 'No posts yet. Soon!',
    'blog.backHome': 'Back home',

    'contact.heading': "Let's build something?",
    'contact.body': 'Reach out to collaborate, hire or just talk product.',
    'contact.email': 'Email',
    'contact.linkedin': 'LinkedIn',
    'contact.github': 'GitHub',
    'contact.x': 'X',

    'footer.madeWith': 'Built with Astro',

    'meta.homeTitle': 'xussof — builder & indie founder',
    'meta.homeDesc': "xussof's personal site: builder and indie founder. Projects: YourBrandOnTime and The City Mesh.",
    'meta.blogTitle': 'Blog — xussof',
    'meta.blogDesc': 'Notes by xussof on product, AI and building things on the web.',
  },
} as const;

export type UIKey = keyof typeof ui[typeof defaultLang];

// Static contact links (not localized)
export const contactLinks = {
  email: 'mailto:xussof@gmail.com',
  linkedin: 'https://www.linkedin.com/in/xussof/',
  github: 'https://github.com/xussof',
  x: 'https://x.com/xussof',
} as const;
```

- [ ] **Step 2: Write the failing tests in `src/i18n/utils.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { useTranslations, formatDate } from './utils';
import { ui, defaultLang } from './ui';

describe('useTranslations', () => {
  it('returns the string for the requested language', () => {
    expect(useTranslations('es')('nav.projects')).toBe('Proyectos');
    expect(useTranslations('en')('nav.projects')).toBe('Projects');
  });

  it('returns undefined for a completely unknown key', () => {
    // @ts-expect-error — key is absent from every dictionary
    expect(useTranslations('en')('totally.unknown.key')).toBeUndefined();
  });
});

describe('ui dictionaries', () => {
  it('every default-language key has a non-empty translation in all languages', () => {
    const keys = Object.keys(ui[defaultLang]) as Array<keyof typeof ui['es']>;
    for (const lang of Object.keys(ui) as Array<keyof typeof ui>) {
      for (const key of keys) {
        expect(ui[lang][key], `${lang} / ${key}`).toBeTruthy();
      }
    }
  });
});

describe('formatDate', () => {
  const d = new Date('2026-06-17T00:00:00Z');
  it('formats a long date in Spanish', () => {
    expect(formatDate(d, 'es')).toBe('17 de junio de 2026');
  });
  it('formats a long date in English', () => {
    expect(formatDate(d, 'en')).toBe('June 17, 2026');
  });
});
```

- [ ] **Step 3: Run the tests to confirm they fail**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./utils"` / `useTranslations is not defined` (the module doesn't exist yet).

- [ ] **Step 4: Implement `src/i18n/utils.ts`**

```ts
import { ui, defaultLang, type Lang, type UIKey } from './ui';

export type { Lang } from './ui';

/** Returns a translator `t(key)` for the given language, falling back to the default language. */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** Formats a date as a long, locale-aware string (timezone-stable in UTC). */
export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
```

- [ ] **Step 5: Run the tests to confirm they pass**

Run: `npm test`
Expected: PASS — all 5 assertions green.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/
git commit -m "feat: add i18n dictionaries and tested translation/date helpers"
```

---

## Task 4: Content collections & content

**Files:**
- Create: `src/content.config.ts`, `src/content/projects/yourbrandontime.md`, `src/content/projects/thecitymesh.md`, `src/content/blog/es/welcome.md`, `src/content/blog/en/welcome.md`

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    url: z.url(),
    order: z.number(),
    accent: z.enum(['blue', 'yellow', 'pink', 'green']),
    emoji: z.string(),
    tags: z.array(z.string()),
    summary: z.object({ es: z.string(), en: z.string() }),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    lang: z.enum(['es', 'en']),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
```

- [ ] **Step 2: Create `src/content/projects/yourbrandontime.md`**

```md
---
title: "YourBrandOnTime"
url: "https://yourbrandontime.com"
order: 1
accent: "blue"
emoji: "🎬"
tags: ["SaaS", "IA"]
summary:
  es: "Social listening en vídeo con IA. Detecta menciones de tu marca habladas o mostradas en YouTube, TikTok e Instagram, ahí donde las herramientas de texto no llegan."
  en: "AI video social listening. Catches brand mentions spoken or shown across YouTube, TikTok and Instagram — where text-only tools fall short."
---
```

- [ ] **Step 3: Create `src/content/projects/thecitymesh.md`**

```md
---
title: "The City Mesh"
url: "https://thecitymesh.com"
order: 2
accent: "yellow"
emoji: "🏙️"
tags: ["Web", "3D"]
summary:
  es: "Financia tu proyecto con quien cree en ti. Ciudades 3D hexagonales donde cada patrocinador construye un edificio que crece según su aporte."
  en: "Fund your project with the people who believe in you first. 3D hexagonal cities where every sponsor builds a plot that grows with their contribution."
---
```

- [ ] **Step 4: Create `src/content/blog/es/welcome.md`**

```md
---
title: "Hola, mundo 👋"
description: "Estreno blog. Por qué escribo aquí y qué tipo de notas vas a encontrar."
pubDate: 2026-06-17
lang: "es"
---

Bienvenida y bienvenido a mi rincón en internet. Aquí iré dejando **notas
cortas** sobre lo que construyo: producto, IA aplicada y web interactiva.

## Qué vas a encontrar

- Cómo valido ideas antes de escribir una línea de código.
- Decisiones de producto en [YourBrandOnTime](https://yourbrandontime.com) y
  [The City Mesh](https://thecitymesh.com).
- Mi stack de *indie founder* y trucos para enviar rápido.

Nos leemos pronto.
```

- [ ] **Step 5: Create `src/content/blog/en/welcome.md`**

```md
---
title: "Hello, world 👋"
description: "Kicking off the blog. Why I write here and what kind of notes you'll find."
pubDate: 2026-06-17
lang: "en"
---

Welcome to my corner of the internet. I'll be posting **short notes** about the
things I build: product, applied AI and interactive web.

## What you'll find

- How I validate ideas before writing a line of code.
- Product decisions behind [YourBrandOnTime](https://yourbrandontime.com) and
  [The City Mesh](https://thecitymesh.com).
- My indie-founder stack and tricks for shipping fast.

See you soon.
```

- [ ] **Step 6: Verify collections compile**

Run: `npx astro sync && npm run check`
Expected: `astro sync` generates collection types with no schema errors; `astro check` reports `0 errors`.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/content/
git commit -m "feat: add projects and blog content collections with seed content"
```

---

## Task 5: SEO component & BaseLayout

**Files:**
- Create: `src/components/SEO.astro`, `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create `src/components/SEO.astro`**

```astro
---
import { getAbsoluteLocaleUrl } from 'astro:i18n';
import type { Lang } from '../i18n/ui';

interface Props {
  title: string;
  description: string;
  lang: Lang;
  route: string;
  type?: 'website' | 'article';
  publishedTime?: string;
}
const { title, description, lang, route, type = 'website', publishedTime } = Astro.props;

const canonical = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL(`${import.meta.env.BASE_URL}og-image.png`, Astro.site);
const esUrl = getAbsoluteLocaleUrl('es', route);
const enUrl = getAbsoluteLocaleUrl('en', route);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />

<link rel="alternate" hreflang="es" href={esUrl} />
<link rel="alternate" hreflang="en" href={enUrl} />
<link rel="alternate" hreflang="x-default" href={esUrl} />

<meta property="og:type" content={type} />
{publishedTime && <meta property="article:published_time" content={publishedTime} />}
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta property="og:locale" content={lang === 'es' ? 'es_ES' : 'en_US'} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />
<meta name="generator" content={Astro.generator} />
```

- [ ] **Step 2: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource-variable/fraunces';
import '@fontsource-variable/plus-jakarta-sans';
import '../styles/global.css';
import SEO from '../components/SEO.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import type { Lang } from '../i18n/ui';

interface Props {
  title: string;
  description: string;
  lang: Lang;
  route: string;
  type?: 'website' | 'article';
  publishedTime?: string;
}
const { title, description, lang, route, type, publishedTime } = Astro.props;
---
<!doctype html>
<html lang={lang}>
  <head>
    <SEO title={title} description={description} lang={lang} route={route} type={type} publishedTime={publishedTime} />
  </head>
  <body>
    <Nav lang={lang} route={route} />
    <main>
      <slot />
    </main>
    <Footer lang={lang} />
  </body>
</html>
```

> Note: `BaseLayout` imports `Nav` and `Footer`, which are created in Tasks 6 and 11. `astro check` will report missing-module errors until those exist — that is expected. The verification step for this task is type-checking the two files in isolation; full-build verification happens in Task 12.

- [ ] **Step 3: Commit**

```bash
git add src/components/SEO.astro src/layouts/BaseLayout.astro
git commit -m "feat: add SEO head component and base layout"
```

---

## Task 6: Nav & language toggle

**Files:**
- Create: `src/components/Nav.astro`, `src/components/LangToggle.astro`

- [ ] **Step 1: Create `src/components/LangToggle.astro`**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import { languages, type Lang } from '../i18n/ui';

interface Props {
  lang: Lang;
  route?: string;
}
const { lang, route = '' } = Astro.props;
const codes = Object.keys(languages) as Lang[];
---
<div class="lang">
  {codes.map((code) => (
    <a
      class:list={['lang-opt', { on: code === lang }]}
      href={getRelativeLocaleUrl(code, route)}
      hreflang={code}
      aria-current={code === lang ? 'page' : undefined}
    >{code.toUpperCase()}</a>
  ))}
</div>

<style>
  .lang {
    display: inline-flex;
    border: 2px solid var(--ink);
    border-radius: var(--radius-pill);
    overflow: hidden;
    font-size: 12px;
    font-weight: 700;
  }
  .lang-opt { padding: 4px 10px; color: var(--ink); }
  .lang-opt.on { background: var(--ink); color: var(--bg); }
</style>
```

- [ ] **Step 2: Create `src/components/Nav.astro`**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
import LangToggle from './LangToggle.astro';

interface Props {
  lang: Lang;
  route?: string;
}
const { lang, route = '' } = Astro.props;
const t = useTranslations(lang);
const home = getRelativeLocaleUrl(lang, '');
const blog = getRelativeLocaleUrl(lang, 'blog/');
---
<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href={home}><b>xus</b>sof</a>
    <nav>
      <a class="hide" href={`${home}#proyectos`}>{t('nav.projects')}</a>
      <a class="hide" href={`${home}#sobre-mi`}>{t('nav.about')}</a>
      <a class="hide" href={blog}>{t('nav.blog')}</a>
      <LangToggle lang={lang} route={route} />
      <a class="nav-cta" href={`${home}#contacto`}>{t('nav.contact')}</a>
    </nav>
  </div>
</header>

<style>
  .nav {
    position: sticky; top: 0; z-index: 10;
    background: rgba(255, 247, 239, 0.85);
    background: color-mix(in srgb, var(--bg) 85%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--card-border);
  }
  .nav-in { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }
  .brand { font-weight: 800; font-size: 20px; }
  .brand b { background: var(--ink); color: var(--bg); padding: 2px 8px; border-radius: 8px; }
  nav { display: flex; align-items: center; gap: 22px; font-size: 14px; font-weight: 600; color: var(--muted); }
  .nav-cta {
    background: var(--pink); color: #fff; padding: 9px 16px;
    border-radius: var(--radius-pill); font-weight: 700;
    box-shadow: 0 5px 0 var(--pink-sh);
  }
  @media (max-width: 760px) { nav .hide { display: none; } }
</style>
```

- [ ] **Step 3: Verify these two components type-check**

Run: `npm run check`
Expected: no errors reported *for `Nav.astro` or `LangToggle.astro`* (errors about `Hero`, `About`, etc. not yet existing, referenced from pages, will not appear yet since no page imports them; `BaseLayout` now resolves `Nav` and `Footer` — `Footer` still missing until Task 11, so a missing-`Footer` error is expected and acceptable here).

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.astro src/components/LangToggle.astro
git commit -m "feat: add nav with language toggle"
```

---

## Task 7: Hero

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
const home = getRelativeLocaleUrl(lang, '');
---
<section class="hero">
  <div class="blob b1" aria-hidden="true"></div>
  <div class="blob b2" aria-hidden="true"></div>
  <div class="wrap hero-in">
    <span class="pill"><span class="dot" aria-hidden="true"></span>{t('hero.badge')}</span>
    <h1 class="hero-t" set:html={t('hero.title')} />
    <p class="lead">{t('hero.lead')}</p>
    <div class="btns">
      <a class="btn primary" href={`${home}#proyectos`}>{t('hero.ctaProjects')}</a>
      <a class="btn ghost" href={`${home}#sobre-mi`}>{t('hero.ctaAbout')}</a>
    </div>
  </div>
</section>

<style>
  .hero { position: relative; overflow: hidden; padding: 72px 0 56px; }
  .blob { position: absolute; border-radius: 50%; filter: blur(50px); opacity: .55; z-index: 0; }
  .blob.b1 { width: 360px; height: 360px; background: var(--yellow); top: -120px; right: -40px; }
  .blob.b2 { width: 320px; height: 320px; background: var(--pink); bottom: -160px; left: -80px; }
  .hero-in { position: relative; z-index: 1; }
  .pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: #fff; border: 1px solid var(--card-border);
    border-radius: var(--radius-pill); padding: 6px 14px;
    font-size: 13px; font-weight: 600; color: var(--muted);
    box-shadow: 0 3px 0 var(--card-border);
  }
  .pill .dot { width: 8px; height: 8px; border-radius: 50%; background: #3ec46d; }
  .hero-t {
    font-weight: 800; font-size: 60px; line-height: 1.03;
    letter-spacing: -.03em; margin: 20px 0 16px; max-width: 15ch;
  }
  .hero-t :global(.hl) {
    background: linear-gradient(120deg, var(--yellow), var(--pink));
    padding: 0 8px; border-radius: 10px;
  }
  .lead { font-size: 18px; color: var(--muted); max-width: 50ch; font-weight: 500; margin-bottom: 28px; }
  .btns { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn { padding: 13px 22px; border-radius: var(--radius-pill); font-weight: 700; font-size: 15px; }
  .btn.primary { background: var(--ink); color: var(--bg); box-shadow: 0 6px 0 rgba(0,0,0,.13); }
  .btn.ghost { background: #fff; border: 2px solid var(--ink); }
  @media (max-width: 760px) { .hero-t { font-size: 42px; } }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: add hero section"
```

---

## Task 8: About

**Files:**
- Create: `src/components/About.astro`

- [ ] **Step 1: Create `src/components/About.astro`**

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
---
<div class="about">
  <div class="ava" aria-hidden="true">👋</div>
  <p set:html={t('about.body')} />
</div>

<style>
  .about {
    background: #fff; border: 1px solid var(--card-border);
    border-radius: 24px; padding: 34px;
    display: flex; gap: 28px; align-items: center;
    box-shadow: 0 10px 0 var(--card-shadow);
  }
  .ava {
    width: 84px; height: 84px; border-radius: 22px; flex: none;
    display: grid; place-items: center; font-size: 34px;
    background: linear-gradient(135deg, var(--blue), var(--pink));
  }
  .about p { font-size: 16px; color: var(--muted); font-weight: 500; }
  .about p :global(b) { color: var(--ink); }
  @media (max-width: 760px) { .about { flex-direction: column; text-align: center; } }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/About.astro
git commit -m "feat: add about section"
```

---

## Task 9: ProjectCard

**Files:**
- Create: `src/components/ProjectCard.astro`

- [ ] **Step 1: Create `src/components/ProjectCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

interface Props {
  project: CollectionEntry<'projects'>;
  lang: Lang;
}
const { project, lang } = Astro.props;
const { title, url, accent, emoji, tags, summary } = project.data;
const host = new URL(url).hostname.replace(/^www\./, '');
---
<a class:list={['pcard', accent]} href={url} target="_blank" rel="noopener noreferrer">
  <div class="emoji" aria-hidden="true">{emoji}</div>
  <h3>{title}</h3>
  <p>{summary[lang]}</p>
  <div class="row">
    {tags.map((tag) => <span class="tag">{tag}</span>)}
    <span class="visit">{host} →</span>
  </div>
</a>

<style>
  .pcard {
    display: block; border-radius: var(--radius-card); padding: 26px;
    position: relative; overflow: hidden; color: var(--ink);
    box-shadow: 0 10px 0 rgba(0,0,0,.07);
    transition: transform .15s ease;
  }
  .pcard:hover { transform: translateY(-3px); }
  .pcard.blue   { background: var(--blue);   box-shadow: 0 10px 0 var(--blue-sh); }
  .pcard.yellow { background: var(--yellow); box-shadow: 0 10px 0 var(--yellow-sh); }
  .pcard.pink   { background: var(--pink);   box-shadow: 0 10px 0 var(--pink-sh); color: var(--ink); }
  .pcard.green  { background: var(--green);  box-shadow: 0 10px 0 var(--green-sh); }
  .emoji { font-size: 34px; }
  .pcard h3 { font-weight: 800; font-size: 24px; margin: 14px 0 8px; letter-spacing: -.01em; }
  .pcard p { font-size: 14px; color: #5b4f43; font-weight: 500; max-width: 42ch; }
  .pcard.pink p { color: var(--ink); }
  .row { display: flex; align-items: center; gap: 8px; margin-top: 18px; flex-wrap: wrap; }
  .tag { font-size: 12px; font-weight: 700; background: rgba(0,0,0,.10); padding: 5px 12px; border-radius: var(--radius-pill); }
  .visit { margin-left: auto; font-weight: 800; font-size: 14px; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProjectCard.astro
git commit -m "feat: add project card"
```

---

## Task 10: NoteCard

**Files:**
- Create: `src/components/NoteCard.astro`

- [ ] **Step 1: Create `src/components/NoteCard.astro`**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import type { CollectionEntry } from 'astro:content';
import { formatDate } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props {
  post: CollectionEntry<'blog'>;
  lang: Lang;
}
const { post, lang } = Astro.props;
const slug = post.id.split('/').pop()!;
const href = getRelativeLocaleUrl(lang, `blog/${slug}/`);
---
<a class="ncard" href={href}>
  <div class="date">{formatDate(post.data.pubDate, lang)}</div>
  <h3>{post.data.title}</h3>
  <p>{post.data.description}</p>
</a>

<style>
  .ncard {
    display: block; background: #fff; border: 1px solid var(--card-border);
    border-radius: 18px; padding: 20px; box-shadow: 0 6px 0 var(--card-shadow);
    transition: transform .15s ease;
  }
  .ncard:hover { transform: translateY(-3px); }
  .date { font-size: 12px; font-weight: 700; color: var(--pink); text-transform: uppercase; letter-spacing: .08em; }
  .ncard h3 { font-size: 17px; font-weight: 700; margin: 8px 0 6px; line-height: 1.25; }
  .ncard p { font-size: 13px; color: var(--muted); font-weight: 500; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/NoteCard.astro
git commit -m "feat: add blog note card"
```

---

## Task 11: ContactCTA & Footer

**Files:**
- Create: `src/components/ContactCTA.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/ContactCTA.astro`**

```astro
---
import { useTranslations } from '../i18n/utils';
import { contactLinks, type Lang } from '../i18n/ui';

interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
---
<div class="contact">
  <h2>{t('contact.heading')}</h2>
  <p>{t('contact.body')}</p>
  <div class="links">
    <a class="pink" href={contactLinks.email}><span aria-hidden="true">✉️</span> {t('contact.email')}</a>
    <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer">{t('contact.linkedin')}</a>
    <a href={contactLinks.github} target="_blank" rel="noopener noreferrer">{t('contact.github')}</a>
    <a href={contactLinks.x} target="_blank" rel="noopener noreferrer">{t('contact.x')}</a>
  </div>
</div>

<style>
  .contact {
    background: var(--ink); color: var(--bg);
    border-radius: 28px; padding: 48px; text-align: center; margin-bottom: 40px;
  }
  .contact h2 { font-family: var(--font-display); font-weight: 900; font-size: 40px; letter-spacing: -.02em; margin-bottom: 10px; }
  .contact p { color: #d9cdbf; font-weight: 500; margin-bottom: 24px; }
  .links { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .links a {
    background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.16);
    padding: 11px 20px; border-radius: var(--radius-pill); font-weight: 700; font-size: 14px;
  }
  .links a.pink { background: var(--pink); border-color: var(--pink); box-shadow: 0 5px 0 var(--pink-sh); color: var(--ink); }
  @media (max-width: 760px) { .contact { padding: 34px 24px; } .contact h2 { font-size: 30px; } }
</style>
```

- [ ] **Step 2: Create `src/components/Footer.astro`**

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
const year = new Date().getFullYear();
---
<footer class="foot">
  <div class="wrap">© {year} xussof · {t('footer.madeWith')} · ES / EN</div>
</footer>

<style>
  .foot { text-align: center; color: #a99a8a; font-size: 13px; font-weight: 500; padding: 0 0 50px; }
</style>
```

> Note: the year is computed at build time with `new Date().getFullYear()` and self-updates on each deploy — no manual bump required.

- [ ] **Step 3: Commit**

```bash
git add src/components/ContactCTA.astro src/components/Footer.astro
git commit -m "feat: add contact CTA and footer"
```

---

## Task 12: Home pages (ES + EN)

**Files:**
- Create: `src/pages/index.astro`, `src/pages/en/index.astro`

- [ ] **Step 1: Create `src/pages/index.astro` (Spanish home)**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import About from '../components/About.astro';
import ProjectCard from '../components/ProjectCard.astro';
import NoteCard from '../components/NoteCard.astro';
import ContactCTA from '../components/ContactCTA.astro';
import { useTranslations } from '../i18n/utils';

const lang = 'es' as const;
const t = useTranslations(lang);

const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
const posts = (await getCollection('blog', (p) => p.data.lang === lang && !p.data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id))
  .slice(0, 3);
---
<BaseLayout title={t('meta.homeTitle')} description={t('meta.homeDesc')} lang={lang} route="">
  <Hero lang={lang} />
  <div class="wrap">
    <section id="sobre-mi" class="sec">
      <div class="sec-h"><span class="kicker">{t('about.kicker')}</span><h2>{t('about.heading')}</h2></div>
      <About lang={lang} />
    </section>

    <section id="proyectos" class="sec">
      <div class="sec-h"><span class="kicker">{t('projects.kicker')}</span><h2>{t('projects.heading')}</h2></div>
      <div class="pcards">
        {projects.map((p) => <ProjectCard project={p} lang={lang} />)}
      </div>
    </section>

    <section class="sec">
      <div class="sec-h"><span class="kicker">{t('blog.kicker')}</span><h2>{t('blog.heading')}</h2></div>
      <div class="notes">
        {posts.map((p) => <NoteCard post={p} lang={lang} />)}
      </div>
    </section>
  </div>

  <div class="wrap">
    <section id="contacto"><ContactCTA lang={lang} /></section>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/en/index.astro` (English home)**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Hero from '../../components/Hero.astro';
import About from '../../components/About.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import NoteCard from '../../components/NoteCard.astro';
import ContactCTA from '../../components/ContactCTA.astro';
import { useTranslations } from '../../i18n/utils';

const lang = 'en' as const;
const t = useTranslations(lang);

const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
const posts = (await getCollection('blog', (p) => p.data.lang === lang && !p.data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id))
  .slice(0, 3);
---
<BaseLayout title={t('meta.homeTitle')} description={t('meta.homeDesc')} lang={lang} route="">
  <Hero lang={lang} />
  <div class="wrap">
    <section id="sobre-mi" class="sec">
      <div class="sec-h"><span class="kicker">{t('about.kicker')}</span><h2>{t('about.heading')}</h2></div>
      <About lang={lang} />
    </section>

    <section id="proyectos" class="sec">
      <div class="sec-h"><span class="kicker">{t('projects.kicker')}</span><h2>{t('projects.heading')}</h2></div>
      <div class="pcards">
        {projects.map((p) => <ProjectCard project={p} lang={lang} />)}
      </div>
    </section>

    <section class="sec">
      <div class="sec-h"><span class="kicker">{t('blog.kicker')}</span><h2>{t('blog.heading')}</h2></div>
      <div class="notes">
        {posts.map((p) => <NoteCard post={p} lang={lang} />)}
      </div>
    </section>
  </div>

  <div class="wrap">
    <section id="contacto"><ContactCTA lang={lang} /></section>
  </div>
</BaseLayout>
```

> Note: the anchor IDs (`#sobre-mi`, `#proyectos`, `#contacto`) are intentionally the same Spanish-derived IDs on both language homes — they match the anchors the Nav links to (`getRelativeLocaleUrl` only localizes the path prefix, not the fragment). Keeping IDs identical keeps the Nav simple across locales.

- [ ] **Step 3: Verify the full build succeeds**

Run: `npm run check && npm run build`
Expected: `astro check` → `0 errors`; `astro build` completes and emits `dist/index.html` and `dist/en/index.html`.

- [ ] **Step 4: Verify visually in the dev server**

Run: `npm run dev` then open `http://localhost:4321/xussof-site/` and `http://localhost:4321/xussof-site/en/`.
Expected: both homes render the hero, about, two project cards (blue YourBrandOnTime, yellow The City Mesh), one blog teaser card, and the dark contact block. The ES/EN toggle switches between the two. Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "feat: add Spanish and English home pages"
```

---

## Task 13: Blog index pages (ES + EN)

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/en/blog/index.astro`

- [ ] **Step 1: Create `src/pages/blog/index.astro` (Spanish)**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NoteCard from '../../components/NoteCard.astro';
import { useTranslations } from '../../i18n/utils';

const lang = 'es' as const;
const t = useTranslations(lang);
const posts = (await getCollection('blog', (p) => p.data.lang === lang && !p.data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id));
---
<BaseLayout title={t('meta.blogTitle')} description={t('meta.blogDesc')} lang={lang} route="blog/">
  <div class="wrap sec">
    <div class="sec-h"><span class="kicker">{t('blog.kicker')}</span><h1>{t('blog.heading')}</h1></div>
    {posts.length === 0
      ? <p class="muted">{t('blog.empty')}</p>
      : <div class="notes">{posts.map((p) => <NoteCard post={p} lang={lang} />)}</div>}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/en/blog/index.astro` (English)**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import NoteCard from '../../../components/NoteCard.astro';
import { useTranslations } from '../../../i18n/utils';

const lang = 'en' as const;
const t = useTranslations(lang);
const posts = (await getCollection('blog', (p) => p.data.lang === lang && !p.data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id));
---
<BaseLayout title={t('meta.blogTitle')} description={t('meta.blogDesc')} lang={lang} route="blog/">
  <div class="wrap sec">
    <div class="sec-h"><span class="kicker">{t('blog.kicker')}</span><h1>{t('blog.heading')}</h1></div>
    {posts.length === 0
      ? <p class="muted">{t('blog.empty')}</p>
      : <div class="notes">{posts.map((p) => <NoteCard post={p} lang={lang} />)}</div>}
  </div>
</BaseLayout>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: emits `dist/blog/index.html` and `dist/en/blog/index.html`, each listing the "welcome" post.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog/index.astro src/pages/en/blog/index.astro
git commit -m "feat: add blog index pages"
```

---

## Task 14: Blog post pages (ES + EN)

**Files:**
- Create: `src/pages/blog/[slug].astro`, `src/pages/en/blog/[slug].astro`

- [ ] **Step 1: Create `src/pages/blog/[slug].astro` (Spanish)**

```astro
---
import { getCollection, render } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { useTranslations, formatDate } from '../../i18n/utils';

export async function getStaticPaths() {
  const posts = await getCollection('blog', (p) => p.data.lang === 'es' && !p.data.draft);
  return posts.map((post) => ({
    params: { slug: post.id.split('/').pop()! },
    props: { post },
  }));
}

const lang = 'es' as const;
const t = useTranslations(lang);
const { post } = Astro.props;
const slug = post.id.split('/').pop()!;
const { Content } = await render(post);
const home = getRelativeLocaleUrl(lang, '');
---
<BaseLayout
  title={`${post.data.title} · xussof`}
  description={post.data.description}
  lang={lang}
  route={`blog/${slug}/`}
  type="article"
  publishedTime={post.data.pubDate.toISOString()}
>
  <article class="wrap sec post">
    <a class="back" href={home}>← {t('blog.backHome')}</a>
    <p class="date">{formatDate(post.data.pubDate, lang)}</p>
    <h1>{post.data.title}</h1>
    <div class="prose"><Content /></div>
  </article>
</BaseLayout>

<style>
  .post { max-width: 760px; }
  .back { display: inline-block; margin-bottom: 18px; font-weight: 700; color: var(--pink-sh); }
  .post .date { font-size: 13px; font-weight: 700; color: var(--pink); text-transform: uppercase; letter-spacing: .08em; }
  .post h1 { font-family: var(--font-display); font-weight: 900; font-size: 40px; letter-spacing: -.02em; margin: 8px 0 24px; line-height: 1.08; }
</style>
```

- [ ] **Step 2: Create `src/pages/en/blog/[slug].astro` (English)**

```astro
---
import { getCollection, render } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { useTranslations, formatDate } from '../../../i18n/utils';

export async function getStaticPaths() {
  const posts = await getCollection('blog', (p) => p.data.lang === 'en' && !p.data.draft);
  return posts.map((post) => ({
    params: { slug: post.id.split('/').pop()! },
    props: { post },
  }));
}

const lang = 'en' as const;
const t = useTranslations(lang);
const { post } = Astro.props;
const slug = post.id.split('/').pop()!;
const { Content } = await render(post);
const home = getRelativeLocaleUrl(lang, '');
---
<BaseLayout
  title={`${post.data.title} · xussof`}
  description={post.data.description}
  lang={lang}
  route={`blog/${slug}/`}
  type="article"
  publishedTime={post.data.pubDate.toISOString()}
>
  <article class="wrap sec post">
    <a class="back" href={home}>← {t('blog.backHome')}</a>
    <p class="date">{formatDate(post.data.pubDate, lang)}</p>
    <h1>{post.data.title}</h1>
    <div class="prose"><Content /></div>
  </article>
</BaseLayout>

<style>
  .post { max-width: 760px; }
  .back { display: inline-block; margin-bottom: 18px; font-weight: 700; color: var(--pink-sh); }
  .post .date { font-size: 13px; font-weight: 700; color: var(--pink); text-transform: uppercase; letter-spacing: .08em; }
  .post h1 { font-family: var(--font-display); font-weight: 900; font-size: 40px; letter-spacing: -.02em; margin: 8px 0 24px; line-height: 1.08; }
</style>
```

- [ ] **Step 3: Verify build & posts render**

Run: `npm run build`
Expected: emits `dist/blog/welcome/index.html` and `dist/en/blog/welcome/index.html`, each rendering the Markdown body (heading + list).

- [ ] **Step 4: Verify the language toggle on a post**

Run: `npm run dev`, open `http://localhost:4321/xussof-site/blog/welcome/`, click `EN`.
Expected: lands on `http://localhost:4321/xussof-site/en/blog/welcome/` (same slug, English content). Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/pages/blog/\[slug\].astro src/pages/en/blog/\[slug\].astro
git commit -m "feat: add blog post pages with shared-slug language pairing"
```

---

## Task 15: Public assets (favicon, OG image, robots)

**Files:**
- Create: `public/favicon.svg`, `public/og-image.svg`, `public/og-image.png` (generated), `scripts/generate-og.mjs`, `src/pages/robots.txt.ts`

> **Enhancement:** Social crawlers (LinkedIn, Facebook, X/Twitter) do not render SVG og:images. `og-image.svg` is kept as the design source, but a 1200×630 PNG is rendered from it via `sharp` and is the file actually referenced in `SEO.astro`.
>
> `robots.txt` is served as a dynamic Astro endpoint (`src/pages/robots.txt.ts`) so the `Sitemap:` URL is always derived from the configured `site` + `base` — it stays correct across domain or base-path changes without manual edits.

- [ ] **Step 1: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#2a221b"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="Georgia, serif" font-weight="900" font-size="40" fill="#fff7ef">x</text>
</svg>
```

- [ ] **Step 2: Create `public/og-image.svg` (1200×630 design source)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fff7ef"/>
  <circle cx="1050" cy="120" r="220" fill="#ffd166" opacity="0.55"/>
  <circle cx="160" cy="560" r="200" fill="#ff5d8f" opacity="0.5"/>
  <text x="90" y="300" font-family="Georgia, serif" font-weight="900" font-size="92" fill="#2a221b">xussof</text>
  <text x="92" y="372" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="34" fill="#6b5d4f">builder &amp; indie founder</text>
  <text x="92" y="430" font-family="Helvetica, Arial, sans-serif" font-weight="500" font-size="26" fill="#6b5d4f">YourBrandOnTime · The City Mesh</text>
</svg>
```

- [ ] **Step 2b: Add `sharp` devDep and create `scripts/generate-og.mjs`**

`sharp` must be an explicit `devDependency` (not just a transitive dep). Run:

```bash
npm install -D sharp
```

Create `scripts/generate-og.mjs`:

```js
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync('public/og-image.svg');
await sharp(svg, { density: 150 })
  .resize(1200, 630)
  .png()
  .toFile('public/og-image.png');
console.log('Generated public/og-image.png (1200x630)');
```

Add the script entry to `package.json` `scripts`:

```json
"generate:og": "node scripts/generate-og.mjs"
```

Then generate the PNG:

```bash
npm run generate:og
```

Verify it is valid and exactly 1200×630:

```bash
node --input-type=module -e "import sharp from 'sharp'; const m=await sharp('public/og-image.png').metadata(); console.log(m.format, m.width, m.height);"
```

Expected: `png 1200 630`. If sharp errors or the PNG is not produced, STOP and report BLOCKED — do NOT leave a dangling reference in `SEO.astro`.

- [ ] **Step 2c: Update `src/components/SEO.astro` to reference `og-image.png`**

Change:
```ts
const ogImage = new URL(`${import.meta.env.BASE_URL}og-image.svg`, Astro.site);
```
to:
```ts
const ogImage = new URL(`${import.meta.env.BASE_URL}og-image.png`, Astro.site);
```
Both `og:image` and `twitter:image` use this constant, so one change covers both.

- [ ] **Step 3: Create `src/pages/robots.txt.ts` (dynamic endpoint)**

Instead of a static `public/robots.txt`, serve it as an Astro API endpoint so the `Sitemap:` URL is always derived from the live `site` + `base` config:

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL(`${import.meta.env.BASE_URL}sitemap-index.xml`, site);
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
```

- [ ] **Step 4: Verify assets are served and referenced**

Run: `npm run build`
Expected: `dist/favicon.svg`, `dist/og-image.svg`, `dist/og-image.png`, `dist/robots.txt` (generated from the endpoint) and `dist/sitemap-index.xml` all exist. Open `dist/index.html` and confirm the `<link rel="icon">` points at `/xussof-site/favicon.svg` and `og:image` / `twitter:image` point at `/xussof-site/og-image.png`. Open `dist/robots.txt` and confirm `Sitemap: https://xussof.github.io/xussof-site/sitemap-index.xml`.

- [ ] **Step 5: Commit**

```bash
git add public/ scripts/ src/pages/robots.txt.ts src/components/SEO.astro
git commit -m "feat: add favicon, robots endpoint, generate:og script, and rendered PNG OpenGraph image"
```

---

## Task 16: GitHub Pages deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read

# One deployment at a time; never cancel an in-progress Pages deploy.
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - name: Build with Astro
        uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

> `withastro/action@v6` auto-detects npm from `package-lock.json`, runs `npm run build`, and uploads `dist/` as the Pages artifact. No `path`/`build-cmd` overrides are needed.

- [ ] **Step 2: Verify the workflow file is valid YAML**

Run: `npx --yes js-yaml .github/workflows/deploy.yml > /dev/null && echo OK`
Expected: prints `OK` (no YAML parse error).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy to GitHub Pages on push to main"
```

> **Manual step for the repo owner (not part of code):** In GitHub → Settings → Pages, set **Source = GitHub Actions**. The site goes live at `https://xussof.github.io/xussof-site/` after this branch is merged to `main`.

---

## Task 17: Final verification & README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run the full verification suite**

Run:
```bash
npm test && npm run check && npm run build
```
Expected: Vitest → all tests pass; `astro check` → `0 errors, 0 warnings`; `astro build` → completes, emitting `index.html`, `en/index.html`, `blog/index.html`, `en/blog/index.html`, `blog/welcome/index.html`, `en/blog/welcome/index.html`, `sitemap-index.xml`.

- [ ] **Step 2: Preview the production build and spot-check**

Run: `npm run preview`, then open `http://localhost:4321/xussof-site/`.
Expected (check each): both home languages render in Style C; ES/EN toggle preserves the page; project cards link out to the right hosts; blog index + post render; contact links point to `mailto:xussof@gmail.com`, `linkedin.com/in/xussof`, `github.com/xussof`, `x.com/xussof`. Stop preview when done.

- [ ] **Step 3: Run Lighthouse (optional but recommended)**

Run: with `npm run preview` running, `npx --yes lighthouse http://localhost:4321/xussof-site/ --quiet --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices,seo` (or use the browser DevTools Lighthouse panel).
Expected: all four categories ≥ 95. If accessibility flags color contrast, darken `--muted` slightly in `tokens.css` and re-run.

- [ ] **Step 4: Replace `README.md`**

```md
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
- **OG image:** `public/og-image.png` is generated from `public/og-image.svg`; after editing the SVG run `npm run generate:og`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`withastro/action` and publishes to GitHub Pages. Set **Settings → Pages →
Source = GitHub Actions** once.
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: project README with dev, content and deploy instructions"
```

---

## Self-review checklist (run before handing off to execution)

- **Spec coverage:** tokens (T2) · sitemap/pages (T12–14) · i18n config+utils (T1,T3) · content model (T4) · components (T5–11) · copy (T3 dictionaries + T4 content) · styles (T2 + scoped) · SEO/sitemap/robots/OG (T5,T15) · a11y/reduced-motion (T2,T7) · deploy (T1 config + T16) · success criteria & testing (T3,T17). ✅ No spec section is unimplemented.
- **Placeholder scan:** every code step contains complete, runnable code; the only "future" items (PNG OG image, custom domain) are explicitly documented, not left as TODOs. ✅
- **Type/name consistency:** `useTranslations`, `formatDate`, `Lang`, `UIKey`, `contactLinks`, `ui`, `defaultLang` are defined in T3 and used unchanged in T5–14; collection names `projects`/`blog` and field names (`order`, `accent`, `summary`, `pubDate`, `lang`, `draft`) match the T4 schema everywhere; `route` prop threads consistently from pages → BaseLayout → SEO/Nav/LangToggle; blog slug derivation `post.id.split('/').pop()!` is identical in NoteCard and both `[slug].astro` pages. ✅
```
