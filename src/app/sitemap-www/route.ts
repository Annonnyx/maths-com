import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Récupérer le contenu du sitemap www
    const response = await fetch('https://www.maths-app.com/api/sitemap-www');
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Sitemap not found' }, { status: 404 });
    }

    const sitemapContent = await response.text();

    return new NextResponse(sitemapContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('Error proxying sitemap www:', error);
    return NextResponse.json({ error: 'Failed to fetch sitemap' }, { status: 500 });
  }
}
