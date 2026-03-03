import { NextResponse } from 'next/server';

export async function GET() {
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.maths-app.com/api/sitemap-www</loc>
    <lastmod>2026-03-03</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://maths-app.com/api/sitemap-no-www</loc>
    <lastmod>2026-03-03</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.maths-app.fr/api/sitemap-www-fr</loc>
    <lastmod>2026-03-03</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://maths-app.fr/api/sitemap-no-www-fr</loc>
    <lastmod>2026-03-03</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
