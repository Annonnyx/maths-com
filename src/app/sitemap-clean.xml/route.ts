import { NextResponse } from 'next/server';

// Sitemap statique directement dans le code pour éviter toute injection
const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://maths-app.com</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://maths-app.com/courses</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://maths-app.com/test</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://maths-app.com/practice</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://maths-app.com/leaderboard</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://maths-app.com/social</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://maths-app.com/multiplayer</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://maths-app.com/cgu</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://maths-app.com/confidentialite</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://maths-app.com/mentions-legales</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://maths-app.com/cookies</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://maths-app.com/mineurs</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://maths-app.com/transferts-donnees</loc>
    <lastmod>2026-03-11T17:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

export async function GET() {
  return new NextResponse(SITEMAP_XML, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  });
}
