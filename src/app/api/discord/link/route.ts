import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Générer un code de liaison unique
function generateLinkingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST - Générer un code de liaison Discord
export async function POST(request: Request) {
  try {
    const { discordId, userId } = await request.json();

    if (!discordId) {
      return NextResponse.json(
        { error: 'Discord ID requis' },
        { status: 400 }
      );
    }

    // Si userId n'est pas fourni, générer un code sans l'associer à un utilisateur
    if (!userId) {
      const code = generateLinkingCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Stocker le code sans utilisateur (pour le modal du profil)
      const linkCode = await prisma.discordLinkCode.create({
        data: {
          userId: 'pending', // Sera mis à jour plus tard
          discordId: discordId,
          code: code,
          expiresAt: expiresAt,
          used: false
        }
      });

      return NextResponse.json({
        success: true,
        code: code,
        instructions: `Utilisez la commande /link code:${code} sur Discord pour lier votre compte.`,
        expiresIn: 15 * 60 // 15 minutes en secondes
      });
    }

    // Vérifier si l'utilisateur n'est pas déjà lié
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { discordId: true }
    });

    if (existingUser?.discordId) {
      return NextResponse.json(
        { error: 'Cet utilisateur est déjà lié à Discord' },
        { status: 400 }
      );
    }

    const code = generateLinkingCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Stocker le code dans la base de données
    const linkCode = await prisma.discordLinkCode.create({
      data: {
        userId: userId,
        discordId: discordId,
        code: code,
        expiresAt: expiresAt,
        used: false
      }
    });

    return NextResponse.json({
      success: true,
      code: code,
      instructions: `Utilisez la commande /link code:${code} sur Discord pour lier votre compte.`,
      expiresIn: 15 * 60 // 15 minutes en secondes
    });

  } catch (error) {
    console.error('Erreur génération code Discord:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du code' },
      { status: 500 }
    );
  }
}

// GET - Obtenir les informations d'un code
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Code requis' },
        { status: 400 }
      );
    }

    // Vérifier le code dans la base de données
    const linkCode = await prisma.discordLinkCode.findFirst({
      where: {
        code: code.toUpperCase(),
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!linkCode) {
      return NextResponse.json(
        { error: 'Code invalide ou expiré' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      discordId: linkCode.discordId,
      expiresAt: linkCode.expiresAt
    });

  } catch (error) {
    console.error('Erreur vérification code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
