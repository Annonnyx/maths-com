import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host');
  
  // Déterminer quel sitemap index utiliser en fonction du domaine
  let sitemapIndexUrl = '';
  
  if (host?.includes('maths-app.com')) {
    sitemapIndexUrl = 'https://maths-app.com/api/sitemap-index';
  } else if (host?.includes('maths-app.fr')) {
    sitemapIndexUrl = 'https://maths-app.fr/api/sitemap-index';
  } else {
    // Par défaut, utiliser le domaine principal
    sitemapIndexUrl = 'https://maths-app.com/api/sitemap-index';
  }

  try {
    // Récupérer le contenu du sitemap index approprié
    const response = await fetch(sitemapIndexUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Sitemap index not found' }, { status: 404 });
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
    console.error('Error proxying sitemap index:', error);
    return NextResponse.json({ error: 'Failed to fetch sitemap index' }, { status: 500 });
  }
}
