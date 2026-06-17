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
