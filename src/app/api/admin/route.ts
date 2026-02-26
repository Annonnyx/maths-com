import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRankFromElo } from '@/lib/elo';
import { getClassFromElo, checkClassPromotion, FrenchClass, getUnlockedClasses } from '@/lib/french-classes';
import crypto from 'crypto';

import { Session } from 'next-auth';

// Store for reset codes (in production, use Redis or similar)
const resetCodes = new Map<string, { code: string; expiresAt: Date }>();

async function isAdmin(session: Session | null): Promise<boolean> {
  const email = session?.user?.email;
  if (!email) return false;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true, email: true }
  });

  if (user?.isAdmin) return true;

  const allowlistedEmail = process.env.ADMIN_EMAIL;
  if (allowlistedEmail && user?.email && user.email.toLowerCase() === allowlistedEmail.toLowerCase()) {
    return true;
  }

  return false;
}

// Generate random secure code
function generateResetCode(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

// GET - Récupérer les infos admin
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(await isAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'users') {
      // Liste des utilisateurs pour attribution de badges
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          elo: true,
          rankClass: true,
          multiplayerElo: true,
          multiplayerRankClass: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });
      return NextResponse.json({ users });
    }

    if (action === 'my-elo') {
      // Récupérer son propre Elo
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          elo: true,
          rankClass: true,
          multiplayerElo: true,
          multiplayerRankClass: true,
          bestElo: true,
          bestRankClass: true,
          bestMultiplayerElo: true,
          bestMultiplayerRankClass: true
        }
      });
      return NextResponse.json({ user });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in admin API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Actions admin
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(await isAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // Modifier son propre Elo
    if (action === 'update-my-elo') {
      const { 
        elo, 
        multiplayerElo, 
        bestElo,
        bestMultiplayerElo,
      } = body;

      const updateData: Record<string, string | number> = {};
      
      if (elo !== undefined) {
        const newElo = parseInt(elo);
        updateData.elo = newElo;
        // Auto-calculate rank from ELO
        updateData.rankClass = getRankFromElo(newElo);
      }
      
      if (multiplayerElo !== undefined) {
        const newMultiElo = parseInt(multiplayerElo);
        updateData.multiplayerElo = newMultiElo;
        // Auto-calculate rank from ELO
        updateData.multiplayerRankClass = getRankFromElo(newMultiElo);
      }
      
      if (bestElo !== undefined) {
        const newBestElo = parseInt(bestElo);
        updateData.bestElo = newBestElo;
        updateData.bestRankClass = getRankFromElo(newBestElo);
      }
      
      if (bestMultiplayerElo !== undefined) {
        const newBestMultiElo = parseInt(bestMultiplayerElo);
        updateData.bestMultiplayerElo = newBestMultiElo;
        updateData.bestMultiplayerRankClass = getRankFromElo(newBestMultiElo);
      }

      const user = await prisma.user.update({
        where: { email: session!.user.email },
        data: updateData,
        select: {
          id: true,
          elo: true,
          rankClass: true,
          multiplayerElo: true,
          multiplayerRankClass: true
        }
      });

      return NextResponse.json({ success: true, user });
    }

    // Créer un badge
    if (action === 'create-badge') {
      const { name, description, icon, category, color, requirement } = body;

      const user = await prisma.user.findUnique({
        where: { email: session!.user.email },
        select: { id: true }
      });

      const badge = await prisma.badge.create({
        data: {
          name,
          description,
          icon,
          category: category || 'custom',
          color: color || '#FFD700',
          requirement,
          isCustom: true,
          createdById: user?.id
        }
      });

      return NextResponse.json({ success: true, badge });
    }

    // Attribuer un badge
    if (action === 'award-badge') {
      const { badgeId, userId } = body;

      // Vérifier si déjà possédé
      const existing = await prisma.userBadge.findFirst({
        where: { userId, badgeId }
      });

      if (existing) {
        return NextResponse.json({ error: 'User already has this badge' }, { status: 400 });
      }

      const admin = await prisma.user.findUnique({
        where: { email: session!.user.email },
        select: { id: true }
      });

      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
          awardedById: admin?.id
        },
        include: { badge: true }
      });

      return NextResponse.json({ success: true, userBadge });
    }

    // Supprimer un badge
    if (action === 'delete-badge') {
      const { badgeId } = body;

      await prisma.badge.delete({
        where: { id: badgeId }
      });

      return NextResponse.json({ success: true });
    }

    // Generate reset code for all users ELO reset
    if (action === 'generate-reset-code') {
      const code = generateResetCode();
      const adminEmail = session!.user.email;
      
      // Store code with 10 minute expiry
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      resetCodes.set(adminEmail, { code, expiresAt });
      
      // Get admin user
      const admin = await prisma.user.findUnique({
        where: { email: adminEmail },
        select: { id: true }
      });

      if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }

      // Send code as system message to admin (from admin to themselves with system marker)
      await prisma.message.create({
        data: {
          senderId: admin.id,
          receiverId: admin.id,
          content: `🔐 CODE DE RÉINITIALISATION ELO: ${code}\n\nCe code expire dans 10 minutes. Utilise-le pour confirmer la réinitialisation de l'ELO de tous les joueurs.`,
          type: 'system'
        }
      });

      return NextResponse.json({ 
        success: true, 
        code,
        message: 'Code de réinitialisation envoyé dans vos messages',
        expiresAt 
      });
    }

    // Reset all users ELO with verification code
    if (action === 'reset-all-elo') {
      const { code } = body;
      const adminEmail = session!.user.email;
      
      // Verify code
      const storedCode = resetCodes.get(adminEmail);
      
      if (!storedCode) {
        return NextResponse.json({ 
          error: 'Aucun code actif. Générez d\'abord un code de réinitialisation.' 
        }, { status: 400 });
      }
      
      if (storedCode.code !== code.toUpperCase()) {
        return NextResponse.json({ 
          error: 'Code invalide. Vérifiez vos messages.' 
        }, { status: 400 });
      }
      
      if (new Date() > storedCode.expiresAt) {
        resetCodes.delete(adminEmail);
        return NextResponse.json({ 
          error: 'Code expiré. Générez un nouveau code.' 
        }, { status: 400 });
      }
      
      // Code valid - proceed with reset
      resetCodes.delete(adminEmail);
      
      // Reset all users ELO
      const resetResult = await prisma.user.updateMany({
        data: {
          elo: 400,
          rankClass: 'F-',
          bestElo: 400,
          bestRankClass: 'F-',
          multiplayerElo: 400,
          multiplayerRankClass: 'F-',
          bestMultiplayerElo: 400,
          bestMultiplayerRankClass: 'F-'
        }
      });

      // Also reset statistics
      await prisma.statistics.updateMany({
        data: {
          totalTests: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          totalTime: 0,
          averageScore: 0,
          averageTime: 0,
          additionTests: 0,
          additionCorrect: 0,
          additionTotal: 0,
          subtractionTests: 0,
          subtractionCorrect: 0,
          subtractionTotal: 0,
          multiplicationTests: 0,
          multiplicationCorrect: 0,
          multiplicationTotal: 0,
          divisionTests: 0,
          divisionCorrect: 0,
          divisionTotal: 0,
          powerTests: 0,
          powerCorrect: 0,
          powerTotal: 0,
          rootTests: 0,
          rootCorrect: 0,
          rootTotal: 0,
          factorizationTests: 0,
          factorizationCorrect: 0,
          factorizationTotal: 0,
          weakPoints: '[]',
          eloHistory: '[]'
        }
      });

      // Reset multiplayer statistics
      await prisma.multiplayerStatistics.updateMany({
        data: {
          totalGames: 0,
          totalWins: 0,
          totalLosses: 0,
          totalDraws: 0,
          lightningGames: 0,
          lightningWins: 0,
          blitzGames: 0,
          blitzWins: 0,
          rapidGames: 0,
          rapidWins: 0,
          classicalGames: 0,
          classicalWins: 0,
          thinkingGames: 0,
          thinkingWins: 0,
          averageScore: 0,
          averageTime: 0,
          bestStreak: 0,
          currentStreak: 0,
          headToHead: '[]'
        }
      });

      // Send confirmation to admin
      const admin = await prisma.user.findUnique({
        where: { email: adminEmail },
        select: { id: true }
      });

      if (admin) {
        await prisma.message.create({
          data: {
            senderId: admin.id,
            receiverId: admin.id,
            content: `✅ RÉINITIALISATION COMPLÈTE EFFECTUÉE\n\n${resetResult.count} joueurs ont été réinitialisés.\nTous les ELO sont maintenant à 400 (F-).\nLes statistiques solo et multijoueur ont été remises à zéro.`,
            type: 'system'
          }
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Réinitialisation complète effectuée',
        usersReset: resetResult.count
      });
    }

    // Get user class info (for the new French class system)
    if (action === 'get-class-info') {
      const { userId } = body;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { elo: true, rankClass: true }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const currentClass = getClassFromElo(user.elo);
      const unlockedClasses = getUnlockedClasses(user.rankClass as any);

      return NextResponse.json({
        currentClass,
        unlockedClasses,
        elo: user.elo,
        rankClass: user.rankClass
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in admin API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
