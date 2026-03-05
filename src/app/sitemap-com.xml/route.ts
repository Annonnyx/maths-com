import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'sitemap-com.xml');
    const fileContent = await readFile(filePath, 'utf-8');
    
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error serving sitemap-com.xml:', error);
    return NextResponse.json(
      { error: 'Sitemap not found' },
      { status: 404 }
    );
  }
}
