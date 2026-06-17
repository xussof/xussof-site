import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL(`${import.meta.env.BASE_URL}sitemap-index.xml`, site);
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
