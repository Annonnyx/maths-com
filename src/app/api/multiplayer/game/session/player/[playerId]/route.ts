import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer le joueur pour trouver la session
    const player = await prisma.gamePlayer.findUnique({
      where: { id: playerId },
      include: { session: true }
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const sessionId = player.sessionId;

    // Vérifier que l'utilisateur est l'hôte
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId }
    });

    if (!gameSession) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    if (gameSession.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Only host can remove players' }, { status: 403 });
    }

    // Empêcher l'hôte de se supprimer lui-même
    if (player.userId === session.user.id) {
      return NextResponse.json({ error: 'Host cannot remove themselves' }, { status: 400 });
    }

    // Supprimer le joueur
    await prisma.gamePlayer.delete({
      where: { id: playerId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error removing player:', error);
    return NextResponse.json(
      { error: 'Failed to remove player' },
      { status: 500 }
    );
  }
}
