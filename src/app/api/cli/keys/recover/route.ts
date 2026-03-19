import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 API Key Recovery - POST request received');
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const { keyId } = body

    if (!keyId) {
      return NextResponse.json({ error: 'ID de clé requis' }, { status: 400 })
    }

    // Vérifier que la clé appartient bien à l'utilisateur
    const apiKey = await prisma.cliApiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id
      }
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'Clé non trouvée' }, { status: 404 })
    }

    // Générer un token de récupération unique
    const recoveryToken = crypto.randomBytes(32).toString('hex')
    const recoveryExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Sauvegarder le token de récupération
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Note: Vous devriez ajouter ces champs au modèle User
        // recoveryToken: recoveryToken,
        // recoveryExpires: recoveryExpires
      }
    })

    // TODO: Envoyer un email avec le lien de récupération
    // Pour l'instant, on retourne le token directement pour le développement
    const recoveryLink = `${process.env.NEXTAUTH_URL}/recover-key?token=${recoveryToken}&keyId=${keyId}`

    return NextResponse.json({
      success: true,
      message: 'Instructions de récupération envoyées par email',
      developmentLink: process.env.NODE_ENV === 'development' ? recoveryLink : undefined
    })

  } catch (error) {
    console.error('Erreur récupération clé API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
