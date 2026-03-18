import { NextRequest, NextResponse } from 'next/server'
import { authenticateCliKey } from '@/lib/cli-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateCliKey(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Récupérer l'historique des tests solo
    const tests = await prisma.soloTest.findMany({
      where: {
        userId: user.id,
        completedAt: { not: null } // Seulement les tests complétés
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        completedAt: true,
        totalQuestions: true,
        correctAnswers: true,
        score: true,
        timeTaken: true,
        eloBefore: true,
        eloAfter: true,
        eloChange: true,
        isPerfect: true,
        isStreakTest: true
      }
    })

    // Compter le total
    const total = await prisma.soloTest.count({
      where: {
        userId: user.id,
        completedAt: { not: null }
      }
    })

    return NextResponse.json({
      tests,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Erreur historique solo CLI:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
