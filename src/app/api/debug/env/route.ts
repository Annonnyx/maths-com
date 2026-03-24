import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Afficher les variables d'environnement (masquées)
    const envInfo = {
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString()
    };

    // Tester la connexion à la base
    const { prisma } = await import('@/lib/prisma');
    
    let dbTest = 'ERROR';
    try {
      const userCount = await prisma.user.count();
      const keyCount = await prisma.cliApiKey.count();
      dbTest = `OK - Users: ${userCount}, Keys: ${keyCount}`;
    } catch (error) {
      dbTest = `DB_ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      environment: envInfo,
      database: dbTest
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
