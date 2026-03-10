import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { initializeBadges, awardRankBadge, RANK_BADGES } from '@/lib/badges';
import { RANK_CLASSES } from '@/lib/elo';

async function isAdminEmail(email: string): Promise<boolean> {
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

// Fonction pour calculer la classe scolaire à partir de l'année de naissance
function calculateSchoolClass(birthYear: number | null | undefined): string | null {
  if (!birthYear) return null;
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  
  // Logique de calcul de classe basée sur l'âge (simplifiée)
  if (age < 6) return null; // Trop jeune pour être scolarisé
  if (age === 6) return "CP";
  if (age === 7) return "CE1";
  if (age === 8) return "CE2";
  if (age === 9) return "CM1";
  if (age === 10) return "CM2";
  if (age === 11) return "6ème";
  if (age === 12) return "5ème";
  if (age === 13) return "4ème";
  if (age === 14) return "3ème";
  if (age === 15) return "2nde";
  if (age === 16) return "1ère";
  if (age === 17) return "Terminale";
  if (age > 17) return "Terminale+"; // Au-delà de Terminale
  
  return null;
}

// POST /api/admin/init-badges - Initialize all default badges and sync user rank badges
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdminEmail(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Initialize standard badges
    await initializeBadges();

    // Create or update Top 1 badges with fire icons
    let top1Solo = await prisma.badge.findFirst({ where: { id: 'top_1_solo' } });
    if (!top1Solo) {
      top1Solo = await prisma.badge.create({
        data: {
          id: 'top_1_solo',
          name: 'Top 1 Solo Mondial',
          description: 'Être classé numéro 1 au classement solo mondial',
          icon: '🔥',
          category: 'special',
          rarity: 'legendary',
          condition: 'Atteindre la première place du classement solo',
        }
      });
    } else if (top1Solo.icon !== '🔥') {
      // Update icon if it's not the fire emoji
      top1Solo = await prisma.badge.update({
        where: { id: 'top_1_solo' },
        data: { icon: '🔥', rarity: 'legendary' }
      });
    }

    let top1Multi = await prisma.badge.findFirst({ where: { id: 'top_1_multi' } });
    if (!top1Multi) {
      top1Multi = await prisma.badge.create({
        data: {
          id: 'top_1_multi',
          name: 'Top 1 Multijoueur',
          description: 'Classé premier du classement multijoueur',
          icon: '🔥',
          category: 'special',
          rarity: 'legendary',
          condition: 'Atteindre la première place du classement multijoueur',
        }
      });
    } else if (top1Multi.icon !== '🔥') {
      // Update icon if it's not the fire emoji
      top1Multi = await prisma.badge.update({
        where: { id: 'top_1_multi' },
        data: { icon: '🔥', rarity: 'legendary' }
      });
    }

    // Get all users with their stats
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        soloRankClass: true, 
        soloElo: true,
        birthYear: true,
        classe: true,
        soloStatistics: {
          select: {
            totalTests: true
          }
        }
      }
    });

    // Find top 1 users
    const top1SoloUser = users.length > 0 ? users.reduce((max, u) => u.soloElo > max.soloElo ? u : max, users[0]) : null;
    const top1MultiUser = top1SoloUser; // Utiliser le même utilisateur pour l'instant

    // Get all rank badges
    const allRankBadges = await prisma.badge.findMany({
      where: { category: 'rank' }
    });

    let awardedCount = 0;
    let classesUpdatedCount = 0;

    for (const user of users) {
      const soloGames = user.soloStatistics?.totalTests || 0;
      const multiGames = 0; // Pas de champ multiplayerGames pour l'instant
      
      // Calculer et mettre à jour la classe scolaire
      const calculatedClass = calculateSchoolClass(user.birthYear);
      if (calculatedClass && calculatedClass !== user.classe) {
        await prisma.user.update({
          where: { id: user.id },
          data: { classe: calculatedClass }
        });
        classesUpdatedCount++;
      }
      
      // Get user's current rank badges
      const userBadges = await prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true }
      });

      // Award ONLY current rank badge (not all previous ones)
      if (user.soloRankClass && (soloGames > 0 || multiGames > 0)) {
        const badgeInfo = RANK_BADGES[user.soloRankClass as keyof typeof RANK_BADGES];
        if (badgeInfo) {
          const badge = allRankBadges.find(b => b.name === badgeInfo.name);
          if (badge) {
            const hasBadge = userBadges.some(ub => ub.badgeId === badge.id);
            if (!hasBadge) {
              await prisma.userBadge.create({
                data: { userId: user.id, badgeId: badge.id }
              });
              awardedCount++;
            }
          }
        }
        
        // Remove badges of higher ranks
        const currentRankIndex = RANK_CLASSES.indexOf(user.soloRankClass as any);
        const higherRanks = RANK_CLASSES.slice(currentRankIndex + 1);
        
        for (const higherRank of higherRanks) {
          const higherBadgeInfo = RANK_BADGES[higherRank as keyof typeof RANK_BADGES];
          if (higherBadgeInfo) {
            const higherBadge = allRankBadges.find(b => b.name === higherBadgeInfo.name);
            if (higherBadge) {
              await prisma.userBadge.deleteMany({
                where: { userId: user.id, badgeId: higherBadge.id }
              });
            }
          }
        }
      }

      // Award/Remove Top 1 Solo badge
      const hasTop1Solo = userBadges.some(ub => ub.badge.id === 'top_1_solo');
      if (user.id === top1SoloUser?.id) {
        if (!hasTop1Solo) {
          await prisma.userBadge.create({
            data: {
              userId: user.id,
              badgeId: 'top_1_solo'
            }
          });
        }
      } else if (hasTop1Solo) {
        await prisma.userBadge.deleteMany({
          where: { userId: user.id, badgeId: 'top_1_solo' }
        });
      }

      // Award/Remove Top 1 Multi badge
      const hasTop1Multi = userBadges.some(ub => ub.badge.id === 'top_1_multi');
      if (user.id === top1MultiUser?.id) {
        if (!hasTop1Multi) {
          await prisma.userBadge.create({
            data: {
              userId: user.id,
              badgeId: 'top_1_multi'
            }
          });
        }
      } else if (hasTop1Multi) {
        await prisma.userBadge.deleteMany({
          where: { userId: user.id, badgeId: 'top_1_multi' }
        });
      }
    }

    const allBadges = await prisma.badge.findMany({ orderBy: { category: 'asc' } });

    return NextResponse.json({ 
      success: true, 
      message: 'Badges synchronized',
      totalBadges: allBadges.length,
      rankBadgesAwarded: awardedCount,
      classesUpdated: classesUpdatedCount,
      top1Solo: top1SoloUser?.id || null,
      top1Multi: top1MultiUser?.id || null,
      totalUsers: users.length
    });

  } catch (error: any) {
    console.error('Error initializing badges:', error);
    return NextResponse.json({ 
      error: 'Failed to initialize badges',
      details: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN'
    }, { status: 500 });
  }
}
