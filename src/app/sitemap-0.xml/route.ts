import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host');
  
  // Déterminer quel sitemap utiliser en fonction du domaine
  let sitemapUrl = '';
  
  if (host?.includes('maths-app.com')) {
    if (host?.includes('www.')) {
      sitemapUrl = 'https://www.maths-app.com/api/sitemap-www';
    } else {
      sitemapUrl = 'https://maths-app.com/api/sitemap-no-www';
    }
  } else if (host?.includes('maths-app.fr')) {
    if (host?.includes('www.')) {
      sitemapUrl = 'https://www.maths-app.fr/api/sitemap-www-fr';
    } else {
      sitemapUrl = 'https://maths-app.fr/api/sitemap-no-www-fr';
    }
  } else {
    // Par défaut, utiliser le domaine principal
    sitemapUrl = 'https://maths-app.com/api/sitemap-no-www';
  }

  try {
    // Récupérer le contenu du sitemap approprié
    const response = await fetch(sitemapUrl);
    
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
    console.error('Error proxying sitemap:', error);
    return NextResponse.json({ error: 'Failed to fetch sitemap' }, { status: 500 });
  }
}
