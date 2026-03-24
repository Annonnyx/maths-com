import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Afficher les variables d'environnement (masquées)
    const envInfo = {
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      databaseUrlHost: process.env.DATABASE_URL?.split('@')[1] || 'UNKNOWN',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'NOT_VERCEL',
      timestamp: new Date().toISOString()
    };

    // Tester la connexion à la base SANS middleware
    let dbTest = 'ERROR';
    let keyDetails = null;
    
    try {
      // Import direct sans passer par le middleware
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const userCount = await prisma.user.count();
      const keyCount = await prisma.cliApiKey.count();
      
      // Chercher la clé spécifique
      const targetKey = 'mths_92cb505dcdde74012d3eb909065bc98721665cbb9afb1d7aeb4e8426a414c797';
      const bcryptjs = require('bcryptjs');
      
      const allKeys = await prisma.cliApiKey.findMany({
        include: { user: true },
        take: 5 // Limiter pour éviter trop de données
      });
      
      let foundKey = null;
      for (const keyRecord of allKeys) {
        const match = await bcryptjs.compare(targetKey, keyRecord.keyHash);
        if (match) {
          foundKey = {
            id: keyRecord.id,
            username: keyRecord.user.username,
            userId: keyRecord.user.id,
            createdAt: keyRecord.createdAt
          };
          break;
        }
      }
      
      dbTest = `OK - Users: ${userCount}, Keys: ${keyCount}`;
      keyDetails = foundKey;
      
      await prisma.$disconnect();
    } catch (error) {
      dbTest = `DB_ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      environment: envInfo,
      database: dbTest,
      keyCheck: keyDetails
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
