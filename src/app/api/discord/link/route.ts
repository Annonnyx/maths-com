import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Lier un compte Discord avec un code
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { code } = await request.json();
    
    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur a déjà un compte lié
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
    
    // Stocker le code temporairement (le bot va le vérifier)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        discordLinkCode: code.toUpperCase(),
      }
    });
    
    // Appeler le bot pour vérifier le code
    const DISCORD_BOT_API = process.env.DISCORD_BOT_API_URL || 'http://localhost:3001';
    const DISCORD_BOT_SECRET = process.env.DISCORD_BOT_SECRET;
    
    const verifyResponse = await fetch(`${DISCORD_BOT_API}/api/verify-link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DISCORD_BOT_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code.toUpperCase(),
        userId: session.user.id,
        username: session.user.username,
      })
    });
    
    const verifyData = await verifyResponse.json();
    
    if (!verifyData.valid) {
      // Réinitialiser le code
      await prisma.user.update({
        where: { id: session.user.id },
        data: { discordLinkCode: null }
      });
      
      return NextResponse.json(
        { error: verifyData.error || 'Code invalide ou expiré' },
        { status: 400 }
      );
    }
    
    // Lier le compte
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        discordId: verifyData.discordId,
        discordUsername: verifyData.discordUsername,
        discordLinkedAt: new Date(),
        discordLinkCode: null,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Compte Discord lié avec succès !',
      discordUsername: verifyData.discordUsername,
    });
    
  } catch (error) {
    console.error('Discord link error:', error);
    return NextResponse.json(
      { error: 'Failed to link Discord account' },
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
        discordLinkCode: null,
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
