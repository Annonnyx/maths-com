import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Afficher les informations de connexion SANS les credentials
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
    
    // Extraire l'hôte pour voir quelle base est utilisée
    const host = dbUrl.includes('@') ? dbUrl.split('@')[1].split('/')[0] : 'UNKNOWN';
    
    // Compter les utilisateurs et clés
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    let userCount = 0;
    let keyCount = 0;
    let sampleUsers = [];
    let sampleKeys = [];
    
    try {
      userCount = await prisma.user.count();
      keyCount = await prisma.cliApiKey.count();
      
      // Prendre des échantillons pour comparer
      sampleUsers = await prisma.user.findMany({ take: 2, select: { id: true, username: true, email: true } });
      sampleKeys = await prisma.cliApiKey.findMany({ take: 2, include: { user: { select: { username: true } } } });
      
      await prisma.$disconnect();
    } catch (error) {
      await prisma.$disconnect();
      throw error;
    }
    
    return NextResponse.json({
      database: {
        urlHost: host,
        userCount: userCount,
        keyCount: keyCount,
        sampleUsers: sampleUsers,
        sampleKeys: sampleKeys.map((k: any) => ({ id: k.id, label: k.label, username: k.user.username, createdAt: k.createdAt }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
