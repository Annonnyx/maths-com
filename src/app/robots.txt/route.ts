import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Lire le fichier robots.txt depuis le dossier public
    const filePath = join(process.cwd(), 'public', 'robots.txt');
    const robotsContent = await readFile(filePath, 'utf-8');
    
    // Servir avec le bon content-type
    return new NextResponse(robotsContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error serving robots.txt:', error);
    return new NextResponse('robots.txt not found', { status: 404 });
  }
}
