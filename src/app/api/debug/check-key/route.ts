import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key } = body
    
    if (!key) {
      return NextResponse.json({ error: 'Key required' }, { status: 400 })
    }

    // Import direct sans passer par le middleware
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Chercher la clé spécifique
      const bcryptjs = require('bcryptjs');
      
      const allKeys = await prisma.cliApiKey.findMany({
        include: { user: true },
        take: 10 // Limiter pour éviter trop de données
      });
      
      console.log(`🔍 Debug: Testing key ${key.substring(0, 20)}... against ${allKeys.length} keys`);
      
      let foundKey = null;
      for (const keyRecord of allKeys) {
        const match = await bcryptjs.compare(key, keyRecord.keyHash);
        if (match) {
          foundKey = {
            id: keyRecord.id,
            username: keyRecord.user.username,
            userId: keyRecord.user.id,
            createdAt: keyRecord.createdAt,
            label: keyRecord.label
          };
          console.log(`✅ Debug: Key found for user ${keyRecord.user.username}`);
          break;
        }
      }
      
      await prisma.$disconnect();
      
      return NextResponse.json({
        success: true,
        keyFound: !!foundKey,
        keyDetails: foundKey,
        totalKeys: allKeys.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
