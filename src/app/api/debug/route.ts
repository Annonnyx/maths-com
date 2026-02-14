import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Route de debug simple pour tester la connexion DB
export async function GET(req: NextRequest) {
  try {
    // Test 1: Connexion DB
    const count = await prisma.user.count();
    
    return NextResponse.json({
      status: 'OK',
      dbConnection: true,
      userCount: count,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'ERROR',
      dbConnection: false,
      error: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN',
      stack: error?.stack?.split('\n').slice(0, 3).join(' | '),
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      }
    }, { status: 500 });
  }
}
