import { prisma } from '@/lib/prisma';
import { RANK_CLASSES, RankClass } from '@/lib/elo';

export class AchievementService {
  // Check and award rank achievements
  static async checkRankAchievement(userId: string, newRankClass: string) {
    const badge = await prisma.badge.findFirst({
      where: {
        name: `Classe ${newRankClass}`,
        category: 'rank'
      }
    });

    if (!badge) return;

    // Check if user already has this badge
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeId: badge.id
      }
    });

    if (!existingBadge) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id
        }
      });
      console.log(`Awarded rank badge: ${badge.name} to user ${userId}`);
    }
    
    // Remove badges of higher ranks when ranking down
    await this.removeHigherRankBadges(userId, newRankClass as RankClass);
  }
  
  // Remove badges of ranks higher than current rank
  static async removeHigherRankBadges(userId: string, currentRank: RankClass) {
    const currentRankIndex = RANK_CLASSES.indexOf(currentRank);
    
    // Get all rank badges that are higher than current rank
    const higherRanks = RANK_CLASSES.slice(currentRankIndex + 1);
    
    for (const rank of higherRanks) {
      const badge = await prisma.badge.findFirst({
        where: {
          name: `Classe ${rank}`,
          category: 'rank'
        }
      });
      
      if (badge) {
        // Remove the badge if user has it
        await prisma.userBadge.deleteMany({
          where: {
            userId,
            badgeId: badge.id
          }
        });
      }
    }
  }

  // Check and award perfect test achievement
  static async checkPerfectTestAchievement(userId: string, score: number, totalQuestions: number) {
    if (score === totalQuestions && totalQuestions === 20) {
      const badge = await prisma.badge.findFirst({
        where: {
          name: 'Test Parfait',
          category: 'achievement'
        }
      });

      if (!badge) return;

      const existingBadge = await prisma.userBadge.findFirst({
        where: {
          userId,
          badgeId: badge.id
        }
      });

      if (!existingBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id
          }
        });
        console.log(`Awarded perfect test badge to user ${userId}`);
      }
    }
  }

  // Check and award solo games milestones
  static async checkSoloGamesAchievements(userId: string) {
    const stats = await prisma.statistics.findUnique({
      where: { userId }
    });

    if (!stats) return;

    const milestones = [10, 50, 100, 500, 1000];
    
    for (const milestone of milestones) {
      if (stats.totalTests >= milestone) {
        const badge = await prisma.badge.findFirst({
          where: {
            name: `${milestone} Tests Solo`,
            category: 'achievement'
          }
        });

        if (!badge) continue;

        const existingBadge = await prisma.userBadge.findFirst({
          where: {
            userId,
            badgeId: badge.id
          }
        });

        if (!existingBadge) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id
            }
          });
          console.log(`Awarded solo games badge: ${badge.name} to user ${userId}`);
        }
      }
    }
  }

  // Check and award multiplayer games milestones
  static async checkMultiplayerGamesAchievements(userId: string) {
    const stats = await prisma.multiplayerStatistics.findUnique({
      where: { userId }
    });

    if (!stats) return;

    const milestones = [10, 50, 100, 500, 1000];
    
    for (const milestone of milestones) {
      if (stats.totalGames >= milestone) {
        const badge = await prisma.badge.findFirst({
          where: {
            name: `${milestone} Parties Multijoueur`,
            category: 'achievement'
          }
        });

        if (!badge) continue;

        const existingBadge = await prisma.userBadge.findFirst({
          where: {
            userId,
            badgeId: badge.id
          }
        });

        if (!existingBadge) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id
            }
          });
          console.log(`Awarded multiplayer games badge: ${badge.name} to user ${userId}`);
        }
      }
    }
  }

  // Award monthly top 1 badges
  static async awardMonthlyTop1Badges() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Remove expired monthly badges
    await prisma.userBadge.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });

    // Get top solo player of the month
    const topSoloPlayer = await prisma.user.findFirst({
      orderBy: {
        elo: 'desc'
      },
      take: 1
    });

    if (topSoloPlayer) {
      const badge = await prisma.badge.findFirst({
        where: {
          name: 'Top 1 Mensuel Solo',
          category: 'special'
        }
      });

      if (badge) {
        // Remove existing top 1 solo badges from all users
        await prisma.userBadge.deleteMany({
          where: {
            badgeId: badge.id
          }
        });

        // Award to new top player
        await prisma.userBadge.create({
          data: {
            userId: topSoloPlayer.id,
            badgeId: badge.id,
            expiresAt: endOfMonth
          }
        });
        console.log(`Awarded monthly top 1 solo badge to ${topSoloPlayer.username}`);
      }
    }

    // Get top multiplayer player of the month
    const topMultiplayerPlayer = await prisma.user.findFirst({
      orderBy: {
        multiplayerElo: 'desc'
      },
      take: 1
    });

    if (topMultiplayerPlayer) {
      const badge = await prisma.badge.findFirst({
        where: {
          name: 'Top 1 Mensuel Multijoueur',
          category: 'special'
        }
      });

      if (badge) {
        // Remove existing top 1 multiplayer badges from all users
        await prisma.userBadge.deleteMany({
          where: {
            badgeId: badge.id
          }
        });

        // Award to new top player
        await prisma.userBadge.create({
          data: {
            userId: topMultiplayerPlayer.id,
            badgeId: badge.id,
            expiresAt: endOfMonth
          }
        });
        console.log(`Awarded monthly top 1 multiplayer badge to ${topMultiplayerPlayer.username}`);
      }
    }
  }

  // Get all user badges
  static async getUserBadges(userId: string) {
    return await prisma.userBadge.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        badge: true
      },
      orderBy: {
        earnedAt: 'desc'
      }
    });
  }

  // Get user's active badges (non-expired)
  static async getActiveUserBadges(userId: string) {
    return await prisma.userBadge.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        badge: true
      }
    });
  }

  // Check all achievements for a user
  static async checkAllAchievements(userId: string) {
    await this.checkSoloGamesAchievements(userId);
    await this.checkMultiplayerGamesAchievements(userId);
    
    // Check rank achievement
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (user) {
      await this.checkRankAchievement(userId, user.rankClass);
    }
  }
}
