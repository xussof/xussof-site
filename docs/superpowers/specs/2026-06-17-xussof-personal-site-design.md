# Diseño: Web personal de xussof

**Fecha:** 2026-06-17
**Estado:** Aprobado (pendiente de revisión final del usuario)
**Repo:** `xussof-site`

## 1. Resumen

Web personal de **xussof** (indie founder / builder) que funciona como portfolio:
presenta quién es, sus proyectos destacados y un blog. Sitio estático, bilingüe
(español por defecto, inglés disponible), construido con **Astro** y desplegado en
**GitHub Pages**.

La personalidad visual es **"Warm Playful Pop"**: cálida, redondeada, con color
caramelo y sombras "chunky". El tono buscado es **profesional pero no demasiado serio**.

## 2. Objetivos y no-objetivos

**Objetivos**
- Presentar a xussof y enlazar sus dos proyectos (YourBrandOnTime, The City Mesh).
- Dar puntos de contacto claros (email, LinkedIn, GitHub, X).
- Tener un blog donde publicar notas, listo para escribir (arranca con 1 post de prueba).
- Bilingüe ES/EN con selector de idioma.
- Rápido, accesible y con buena previsualización al compartir en redes (OpenGraph).
- Fácil de mantener y de añadir proyectos/posts nuevos sin tocar código.

**No-objetivos (por ahora — YAGNI)**
- Sin CMS ni backend; el contenido vive en Markdown dentro del repo.
- Sin páginas de detalle por proyecto (las cards enlazan a los sitios externos).
- Sin sistema de comentarios, newsletter, analítica avanzada ni modo oscuro.
- Sin más de dos idiomas.

## 3. Dirección visual y design tokens

Estilo **C · Warm Playful Pop** (validado con mockup).

**Colores** (CSS variables en `tokens.css`):
```
--bg:        #fff7ef   /* crema de fondo */
--ink:       #2a221b   /* casi-negro cálido (texto principal) */
--muted:     #6b5d4f   /* texto secundario */
--pink:      #ff5d8f   --pink-sh:   #d63e6e   /* acento primario / CTA */
--yellow:    #ffd166   --yellow-sh: #eec476
--blue:      #c6e7ff   --blue-sh:   #9cccef
--green:     #bdebc4                          /* acento puntual */
```
**Tipografía** (auto-alojada con `@fontsource`):
- Display (títulos grandes): **Fraunces** (700–900).
- UI / cuerpo: **Plus Jakarta Sans** (400–800).

**Estética:**
- Radios generosos: cards 18–24px, botones/pills `999px`.
- Sombras "chunky" de offset duro (p. ej. `0 8px 0 var(--pink-sh)`), sin blur.
- "Blobs" de color difuminados en el hero (decorativos).
- Acento por proyecto: YourBrandOnTime → azul, The City Mesh → amarillo.

**Accesibilidad visual:** verificar contraste AA de `--muted` sobre `--bg`;
respetar `prefers-reduced-motion` para desactivar animación de blobs.

## 4. Arquitectura de la información (sitemap)

Una **home de una página con anclas** + un **blog** con índice y posts. Bilingüe:
ES en la raíz, EN bajo `/en/`.

```
/                 Home ES  (Hero · Sobre mí · Proyectos · Blog teaser · Contacto)
/blog/            Índice del blog ES
/blog/[slug]/     Post ES
/en/              Home EN
/en/blog/         Índice del blog EN
/en/blog/[slug]/  Post EN
```

Las secciones de la home (Sobre mí, Proyectos, Contacto) son anclas (`#sobre-mi`,
`#proyectos`, `#contacto`). El blog teaser muestra los 3 posts más recientes.

## 5. Internacionalización (i18n)

- **Astro i18n nativo:** `defaultLocale: 'es'`, `locales: ['es','en']`,
  `routing: { prefixDefaultLocale: false }` → ES en raíz, EN con prefijo `/en`.
- **Strings de UI** en `src/i18n/ui.ts` (diccionarios `es` / `en`: labels de nav,
  botones, encabezados de sección, footer).
- **Utilidades** en `src/i18n/utils.ts`:
  - `getLangFromUrl(url)` → `'es' | 'en'`.
  - `useTranslations(lang)` → función `t(key)`.
  - `localizePath(path, lang)` → construye rutas con/sin prefijo de idioma.
- **Selector de idioma** (`LangToggle`): cambia entre la URL equivalente en el otro
  idioma manteniendo la página actual.
- **Contenido** (proyectos y posts): ver modelo de contenido.

## 6. Modelo de contenido (Astro Content Collections)

Definido en `src/content/config.ts` con esquemas Zod.

**Colección `projects`** (un archivo por proyecto, `src/content/projects/*.md`):
```
title:        string        # "YourBrandOnTime"
url:          string (url)  # "https://yourbrandontime.com"
order:        number        # orden de aparición
accent:       'blue' | 'yellow' | 'pink' | 'green'
emoji:        string        # "🎬"
tags:         string[]      # ["SaaS","IA"]
summary:      { es: string, en: string }   # descripción corta bilingüe
```
Entradas iniciales: `yourbrandontime.md`, `thecitymesh.md`.

**Colección `blog`** (un archivo por post e idioma):
```
src/content/blog/es/*.md
src/content/blog/en/*.md
```
Frontmatter:
```
title:       string
description:  string
pubDate:      date
lang:         'es' | 'en'
draft:        boolean (default false)
```
Post de prueba inicial: `es/hola-mundo.md` y `en/hello-world.md`.

## 7. Componentes y layouts

```
layouts/BaseLayout.astro   # <html>, <head> vía SEO, Nav, slot, Footer; recibe lang
components/
  SEO.astro            # title, description, OpenGraph/Twitter, canonical, hreflang
  Nav.astro            # marca "xussof", enlaces de sección, LangToggle, CTA
  LangToggle.astro     # toggle ES/EN
  Hero.astro           # pill de disponibilidad, título, lead, botones, blobs
  About.astro          # tira "Sobre mí" con avatar/emoji
  ProjectCard.astro    # card de proyecto (color por accent, tags, enlace externo)
  NoteCard.astro       # card de post para teaser e índice de blog
  ContactCTA.astro     # bloque oscuro con enlaces (email, LinkedIn, GitHub, X)
  Footer.astro         # copyright, "hecho con Astro", idioma
```
Cada componente recibe `lang` y usa `useTranslations` para sus textos de UI.

## 8. Contenido (copys iniciales)

**Hero**
- Pill — ES: "Disponible para nuevos proyectos" · EN: "Available for new projects"
- Título — ES: "Hago producto digital con **buen rollo** y buen gusto."
  EN: "I build digital products with **good vibes** and good taste."
- Lead — ES: "Builder & indie founder. Convierto ideas en producto real —de la IA
  al 3D en el navegador— y disfruto los detalles que se notan."
  EN: "Builder & indie founder. I turn ideas into real products —from AI to 3D in
  the browser— and I sweat the details that show."

**Sobre mí**
- ES: "Soy xussof. Diseño y construyo productos de principio a fin: pienso el
  problema, lo prototipo y lo lanzo. Me mueve hacer cosas útiles, cuidadas y con
  personalidad. Ahora mismo, entre la IA aplicada y la web interactiva."
- EN: "I'm xussof. I design and build products end to end: I frame the problem,
  prototype it and ship it. I'm driven by making things that are useful, polished
  and full of character. Right now, somewhere between applied AI and interactive web."

**Proyectos**
- YourBrandOnTime (azul, 🎬, SaaS·IA) → https://yourbrandontime.com
  - ES: "Social listening en vídeo con IA. Detecta menciones de tu marca habladas o
    mostradas en YouTube, TikTok e Instagram, ahí donde las herramientas de texto no llegan."
  - EN: "AI video social listening. Catches brand mentions spoken or shown across
    YouTube, TikTok and Instagram — where text-only tools fall short."
- The City Mesh (amarillo, 🏙️, Web·3D) → https://thecitymesh.com
  - ES: "Financia tu proyecto con quien cree en ti. Ciudades 3D hexagonales donde cada
    patrocinador construye un edificio que crece según su aporte."
  - EN: "Fund your project with the people who believe in you first. 3D hexagonal
    cities where every sponsor builds a plot that grows with their contribution."

**Contacto** (bloque oscuro)
- Título — ES: "¿Construimos algo?" · EN: "Let's build something?"
- Texto — ES: "Escríbeme para colaborar, contratar o charlar de producto."
  EN: "Reach out to collaborate, hire or just talk product."
- Enlaces: Email `xussof@gmail.com` · LinkedIn `https://www.linkedin.com/in/xussof/`
  · GitHub `https://github.com/xussof` · X `https://x.com/xussof`

## 9. Estructura del proyecto

```
xussof-site/
├─ astro.config.mjs            # i18n, site/base, integración sitemap
├─ package.json
├─ tsconfig.json
├─ public/                     # favicon, og-image.png, CNAME (si dominio propio)
├─ src/
│  ├─ content/
│  │  ├─ config.ts             # esquemas de colecciones
│  │  ├─ projects/             # yourbrandontime.md, thecitymesh.md
│  │  └─ blog/
│  │     ├─ es/hola-mundo.md
│  │     └─ en/hello-world.md
│  ├─ components/              # (sección 7)
│  ├─ layouts/BaseLayout.astro
│  ├─ i18n/{ui.ts, utils.ts}
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ blog/{index.astro, [slug].astro}
│  │  └─ en/
│  │     ├─ index.astro
│  │     └─ blog/{index.astro, [slug].astro}
│  └─ styles/{tokens.css, global.css}
└─ .github/workflows/deploy.yml
```

## 10. Estilos

- CSS propio con **design tokens** en `tokens.css` (variables de sección 3) +
  `global.css` (reset, tipos `@fontsource`, estilos base de tipografía/markdown del blog).
- Estilos por componente con `<style>` scoped de Astro.
- Sin framework de utilidades (Tailwind) para no pelear con el estilo bespoke y
  mantener el bundle mínimo.

## 11. SEO, rendimiento y accesibilidad

- `SEO.astro`: `<title>`, meta description, OpenGraph + Twitter Card, `canonical`
  y `hreflang` alternando ES/EN.
- `@astrojs/sitemap` para `sitemap.xml`; `robots.txt` en `public/`.
- Imagen OpenGraph por defecto (`public/og-image.png`).
- Fuentes auto-alojadas (sin llamadas a Google Fonts) → velocidad y privacidad.
- HTML semántico, `alt` en imágenes, foco visible, contraste AA.
- `prefers-reduced-motion` desactiva animaciones decorativas.
- Objetivo: Lighthouse ≥95 en Performance, Accessibility, Best Practices y SEO.

## 12. Despliegue (GitHub Pages)

- Workflow `.github/workflows/deploy.yml` con `withastro/action` +
  `actions/deploy-pages` (build en push a `main`).
- `astro.config.mjs`: `site` = URL de Pages; `base` = `/xussof-site` para project page.
  Si más adelante se usa dominio propio, `base` pasa a `/` y se añade `public/CNAME`.
- Pages configurado en modo "GitHub Actions".

## 13. Criterios de éxito

- `npm run build` y `astro check` pasan sin errores.
- La home renderiza las 5 secciones en ES y EN, con el estilo C.
- El selector de idioma cambia entre la misma página en ES/EN.
- El blog lista posts y cada post se renderiza desde Markdown en ambos idiomas.
- Todos los enlaces de contacto y proyectos apuntan a las URLs correctas.
- El sitio se despliega solo en GitHub Pages al hacer push a `main`.
- Lighthouse ≥95 en las cuatro categorías.

## 14. Estrategia de pruebas

Sitio mayormente estático → la verificación combina build/type-check, pruebas
unitarias de la lógica de i18n y revisión visual.

- **Unitarias (Vitest):** `i18n/utils.ts` —`getLangFromUrl`, `useTranslations`
  (fallback de claves), `localizePath` (con/sin prefijo)—, y validación de esquemas
  de contenido.
- **Build gate:** `astro check` (tipos) + `npm run build` sin errores ni warnings.
- **Verificación manual:** `npm run dev`, revisar las dos homes y el blog en el navegador.
- **Lighthouse:** ejecutar en build de producción antes de dar por terminado.

## 15. Cuestiones abiertas / futuro

- Dominio propio (definir y añadir `CNAME` cuando exista).
- Páginas de detalle por proyecto (`/proyectos/[slug]`) si más adelante interesa.
- Analítica respetuosa con la privacidad (p. ej. Plausible) — opcional.
- Imagen/foto real para "Sobre mí" (ahora un emoji de marcador).
