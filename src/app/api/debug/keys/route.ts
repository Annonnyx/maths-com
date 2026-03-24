import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Récupérer toutes les clés sans bcrypt pour l'instant
    const keys = await prisma.cliApiKey.findMany({
      include: { user: true },
      take: 5
    })
    
    return NextResponse.json({
      success: true,
      totalKeys: keys.length,
      keys: keys.map(k => ({
        id: k.id,
        label: k.label,
        createdAt: k.createdAt,
        username: k.user.username,
        userId: k.user.id
      })),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
