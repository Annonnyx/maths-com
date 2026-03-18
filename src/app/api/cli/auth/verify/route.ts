import { NextRequest, NextResponse } from 'next/server'
import { authenticateCliKey } from '@/lib/cli-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateCliKey(request)
    
    if (!user) {
      return NextResponse.json(
        { valid: false, error: "Clef invalide" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      valid: true,
      userId: user.id,
      username: user.username,
      soloElo: user.soloElo,
      multiplayerElo: user.multiplayerElo
    })
  } catch (error) {
    console.error('Erreur vérification clef CLI:', error)
    return NextResponse.json(
      { valid: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
