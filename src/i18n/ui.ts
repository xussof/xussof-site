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
