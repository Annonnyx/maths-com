import { NextRequest, NextResponse } from 'next/server';

// Store for linking codes (in production, use Redis or database)
const linkingCodes = new Map<string, {
  userId: string;
  discordId: string;
  code: string;
  expiresAt: Date;
  used: boolean;
}>();

// PUT /api/discord/verify-code - Vérifier un code envoyé par DM (pour le bot)
export async function PUT(request: NextRequest) {
  try {
    const { discordId, code, discordUsername } = await request.json();

    if (!discordId || !code) {
      return NextResponse.json(
        { valid: false, error: 'Discord ID et code requis' },
        { status: 400 }
      );
    }

    // Trouver le code dans la Map
    let foundCode: { userId: string; discordId: string; code: string; expiresAt: Date; used: boolean } | undefined;

    for (const [key, data] of linkingCodes.entries()) {
      if (data.discordId === discordId && data.code === code.toUpperCase() && !data.used && data.expiresAt > new Date()) {
        foundCode = data;
        break;
      }
    }

    if (!foundCode) {
      return NextResponse.json({
        valid: false,
        error: 'Code invalide ou expiré'
      });
    }

    // Marquer le code comme utilisé et supprimer de la Map
    foundCode.used = true;
    for (const [key, data] of linkingCodes.entries()) {
      if (data === foundCode) {
        linkingCodes.delete(key);
        break;
      }
    }

    // Importer Prisma pour lier le compte
    const { prisma } = await import('@/lib/prisma');

    // Lier le compte dans la base de données
    await prisma.user.update({
      where: { id: foundCode.userId },
      data: {
        discordId: discordId,
        discordUsername: discordUsername || 'Utilisateur Discord',
        discordLinkedAt: new Date(),
      }
    });

    // Récupérer les infos de l'utilisateur pour la réponse
    const user = await prisma.user.findUnique({
      where: { id: foundCode.userId },
      select: {
        username: true,
        displayName: true
      }
    });

    return NextResponse.json({
      valid: true,
      userId: foundCode.userId,
      username: user?.username || user?.displayName || 'Inconnu',
      discordId: discordId,
      discordUsername: discordUsername || 'Utilisateur Discord'
    });

  } catch (error) {
    console.error('Erreur vérification code:', error);
    return NextResponse.json(
      { valid: false, error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

// POST /api/discord/verify-code - Créer un code (pour le site)
export async function POST(request: NextRequest) {
  try {
    const { userId, discordId } = await request.json();

    if (!userId || !discordId) {
      return NextResponse.json(
        { error: 'User ID et Discord ID requis' },
        { status: 400 }
      );
    }

    // Générer un code unique
    function generateLinkingCode(): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    const code = generateLinkingCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Stocker le code
    const linkId = `${userId}_${discordId}_${Date.now()}`;
    linkingCodes.set(linkId, {
      userId,
      discordId,
      code,
      expiresAt,
      used: false
    });

    // Nettoyer les codes expirés
    const now = new Date();
    for (const [key, data] of linkingCodes.entries()) {
      if (data.expiresAt < now || data.used) {
        linkingCodes.delete(key);
      }
    }

    return NextResponse.json({
      success: true,
      code: code,
      expiresIn: 10 * 60 // 10 minutes en secondes
    });

  } catch (error) {
    console.error('Erreur création code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du code' },
      { status: 500 }
    );
  }
}
