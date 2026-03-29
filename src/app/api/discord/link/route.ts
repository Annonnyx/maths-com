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
    const body = await request.json();
    const { discordId, userId } = body;
    
    console.log('🔗 Discord link request:', { discordId, userId });

    // Si discordId est 'pending', générer un code sans validation
    if (discordId === 'pending') {
      console.log('🔗 Pending discordId, generating code without user association');
      const code = generateLinkingCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Stocker le code sans utilisateur (pour le modal du profil)
      const linkCode = await prisma.discordLinkCode.create({
        data: {
          userId: userId || 'pending', // Utiliser userId si fourni, sinon 'pending'
          discordId: 'pending',
          code: code,
          expiresAt: expiresAt,
          used: false
        }
      });

      console.log('🔗 Generated pending code:', code);
      return NextResponse.json({
        success: true,
        code: code,
        instructions: `Utilisez la commande /link code:${code} sur Discord pour lier votre compte.`,
        expiresIn: 15 * 60 // 15 minutes en secondes
      });
    }

    // Pour les autres cas, discordId doit être valide
    if (!discordId || discordId === 'pending') {
      return NextResponse.json(
        { error: 'Discord ID requis' },
        { status: 400 }
      );
    }

    console.log('🔗 Checking if user is already linked:', userId);
    // Vérifier si l'utilisateur n'est pas déjà lié
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { discordId: true }
    });

    console.log('🔗 Existing user:', existingUser);

    if (existingUser?.discordId) {
      console.log('🔗 User already linked to Discord:', existingUser.discordId);
      return NextResponse.json(
        { error: 'Cet utilisateur est déjà lié à Discord' },
        { status: 400 }
      );
    }

    console.log('🔗 Generating code for user:', userId);
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

    console.log('🔗 Generated user code:', code);
    return NextResponse.json({
      success: true,
      code: code,
      instructions: `Utilisez la commande /link code:${code} sur Discord pour lier votre compte.`,
      expiresIn: 15 * 60 // 15 minutes en secondes
    });

  } catch (error) {
    console.error('🔗 Error génération code Discord:', error);
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
