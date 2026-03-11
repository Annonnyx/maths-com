import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Lire le fichier sitemap principal depuis le dossier public
    const filePath = join(process.cwd(), 'public', 'sitemap.xml');
    const sitemapContent = await readFile(filePath, 'utf-8');
    
    // Servir avec le bon content-type XML
    return new NextResponse(sitemapContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error serving sitemap:', error);
    return new NextResponse('Sitemap not found', { status: 404 });
  }
}
