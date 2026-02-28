import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Store for linking codes (in production, use Redis or database)
const linkingCodes = new Map<string, {
  userId: string;
  discordId: string;
  code: string;
  expiresAt: Date;
  used: boolean;
}>();

// Générer un code de liaison unique
function generateLinkingCode(): string {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

// Nettoyer les codes expirés
function cleanupExpiredCodes() {
  const now = new Date();
  for (const [key, data] of linkingCodes.entries()) {
    if (data.expiresAt < now || data.used) {
      linkingCodes.delete(key);
    }
  }
}

// POST - Initier la liaison Discord (génère code et demande au bot d'envoyer DM)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { discordId } = await request.json();

    if (!discordId) {
      return NextResponse.json(
        { error: 'Discord ID requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur n'est pas déjà lié
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { discordId: true }
    });

    if (existingUser?.discordId) {
      return NextResponse.json(
        { error: 'Votre compte est déjà lié à Discord' },
        { status: 400 }
      );
    }

    // Générer un code unique
    const code = generateLinkingCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Stocker le code
    const linkId = `${session.user.id}_${discordId}_${Date.now()}`;
    linkingCodes.set(linkId, {
      userId: session.user.id,
      discordId,
      code,
      expiresAt,
      used: false
    });

    // Nettoyer les codes expirés
    cleanupExpiredCodes();

    // Demander au bot d'envoyer un DM avec le code
    const DISCORD_BOT_API = process.env.DISCORD_BOT_API_URL || 'http://localhost:3001';
    const DISCORD_BOT_SECRET = process.env.DISCORD_BOT_SECRET;

    try {
      const botResponse = await fetch(`${DISCORD_BOT_API}/api/send-link-dm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DISCORD_BOT_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordId,
          code,
          websiteUsername: session.user.username || session.user.email,
        })
      });

      if (!botResponse.ok) {
        console.error('Erreur envoi DM bot:', await botResponse.text());
        return NextResponse.json(
          { error: 'Impossible d\'envoyer le message de vérification' },
          { status: 500 }
        );
      }
    } catch (botError) {
      console.error('Erreur communication bot:', botError);
      return NextResponse.json(
        { error: 'Service de vérification indisponible' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Code de vérification envoyé en message privé Discord !',
      instructions: 'Vérifiez vos MPs Discord et envoyez le code au bot.',
      expiresIn: 10 * 60 // 10 minutes en secondes
    });

  } catch (error) {
    console.error('Discord link error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Discord linking' },
      { status: 500 }
    );
  }
}

// PUT /api/discord/link/verify - Vérifier un code envoyé par DM
export async function PUT(request: Request) {
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

    // Lier le compte dans la base de données
    await prisma.user.update({
      where: { id: foundCode.userId },
      data: {
        discordId: discordId,
        discordUsername: discordUsername || 'Utilisateur Discord',
        discordLinkedAt: new Date(),
      }
    });

    return NextResponse.json({
      valid: true,
      userId: foundCode.userId,
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

// DELETE - Délier le compte Discord
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        discordId: null,
        discordUsername: null,
        discordLinkedAt: null,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Compte Discord délié avec succès',
    });
    
  } catch (error) {
    console.error('Discord unlink error:', error);
    return NextResponse.json(
      { error: 'Failed to unlink Discord account' },
      { status: 500 }
    );
  }
}

// GET - Vérifier le statut de liaison
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        discordId: true,
        discordUsername: true,
        discordLinkedAt: true,
      }
    });
    
    return NextResponse.json({
      linked: !!user?.discordId,
      discordId: user?.discordId,
      discordUsername: user?.discordUsername,
      linkedAt: user?.discordLinkedAt,
    });
    
  } catch (error) {
    console.error('Discord status error:', error);
    return NextResponse.json(
      { error: 'Failed to check Discord link status' },
      { status: 500 }
    );
  }
}
