import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Test simple pour vérifier que l'API fonctionne
    return NextResponse.json({
      message: 'API test endpoint working',
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
        VERCEL_URL: process.env.VERCEL_URL ? 'SET' : 'NOT_SET',
        URL: process.env.URL ? 'SET' : 'NOT_SET'
      },
      headers: {
        host: req.headers.get('host'),
        'x-forwarded-host': req.headers.get('x-forwarded-host'),
        'x-forwarded-proto': req.headers.get('x-forwarded-proto'),
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
