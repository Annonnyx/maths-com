import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ keyId: string }> }
) {
  try {
    const { keyId } = await context.params
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

    // Vérifier que la clef appartient bien à l'utilisateur
    const apiKey = await prisma.cliApiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id
      }
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'Clef non trouvée' }, { status: 404 })
    }

    // Supprimer la clef
    await prisma.cliApiKey.delete({
      where: { id: keyId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression clef CLI:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
