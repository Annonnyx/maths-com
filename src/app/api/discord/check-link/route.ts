import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/discord/check-link?discordId=xxx - Vérifier si un utilisateur Discord est déjà lié
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const discordId = searchParams.get('discordId');

    if (!discordId) {
      return NextResponse.json(
        { error: 'Discord ID requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur avec ce Discord ID
    const user = await prisma.user.findUnique({
      where: { discordId: discordId },
      select: {
        id: true,
        username: true,
        displayName: true,
        discordLinkedAt: true
      }
    });

    if (!user) {
      return NextResponse.json({
        linked: false,
        message: 'Aucun compte lié trouvé'
      });
    }

    return NextResponse.json({
      linked: true,
      user: {
        id: user.id,
        username: user.username || user.displayName || 'Inconnu',
        displayName: user.displayName,
        linkedAt: user.discordLinkedAt
      }
    });

  } catch (error) {
    console.error('Erreur vérification lien Discord:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
