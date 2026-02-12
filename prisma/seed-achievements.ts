import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedAchievements() {
  console.log('Seeding achievements...');

  // Rank achievements (F- to S+)
  const ranks = ['F-', 'F', 'F+', 'E-', 'E', 'E+', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+'];
  
  for (const rank of ranks) {
    const tier = rank.charAt(0);
    const tierColors: Record<string, string> = {
      'S': '#FFD700', // Gold
      'A': '#FF6B35', // Orange
      'B': '#9B59B6', // Purple
      'C': '#3498DB', // Blue
      'D': '#1ABC9C', // Teal
      'E': '#2ECC71', // Green
      'F': '#95A5A6', // Gray
    };

    await prisma.badge.upsert({
      where: { name: `Classe ${rank}` },
      update: {},
      create: {
        name: `Classe ${rank}`,
        description: `Atteindre la classe ${rank} en Elo`,
        icon: tier === 'S' ? '👑' : tier === 'A' ? '⭐' : tier === 'B' ? '🎯' : tier === 'C' ? '💎' : tier === 'D' ? '🔷' : tier === 'E' ? '🟢' : '⚪',
        category: 'rank',
        color: tierColors[tier] || '#95A5A6',
        requirement: `Atteindre la classe ${rank}`,
      }
    });
  }

  // Perfect test achievement
  await prisma.badge.upsert({
    where: { name: 'Test Parfait' },
    update: {},
    create: {
      name: 'Test Parfait',
      description: 'Réussir un test avec un score de 20/20',
      icon: '🏆',
      category: 'achievement',
      color: '#FFD700',
      requirement: 'Obtenir 20/20 à un test chronométré',
    }
  });

  // Solo games achievements
  const soloMilestones = [10, 50, 100, 500, 1000];
  for (const milestone of soloMilestones) {
    await prisma.badge.upsert({
      where: { name: `${milestone} Tests Solo` },
      update: {},
      create: {
        name: `${milestone} Tests Solo`,
        description: `Compléter ${milestone} tests en mode solo`,
        icon: milestone >= 1000 ? '💎' : milestone >= 500 ? '🏅' : milestone >= 100 ? '🎖️' : milestone >= 50 ? '🏵️' : '🎯',
        category: 'achievement',
        color: milestone >= 1000 ? '#FF6B35' : milestone >= 500 ? '#9B59B6' : milestone >= 100 ? '#3498DB' : '#2ECC71',
        requirement: `Compléter ${milestone} tests solo`,
      }
    });
  }

  // Multiplayer games achievements
  const multiplayerMilestones = [10, 50, 100, 500, 1000];
  for (const milestone of multiplayerMilestones) {
    await prisma.badge.upsert({
      where: { name: `${milestone} Parties Multijoueur` },
      update: {},
      create: {
        name: `${milestone} Parties Multijoueur`,
        description: `Jouer ${milestone} parties en multijoueur`,
        icon: milestone >= 1000 ? '👑' : milestone >= 500 ? '🏆' : milestone >= 100 ? '🥇' : milestone >= 50 ? '🥈' : '🥉',
        category: 'achievement',
        color: milestone >= 1000 ? '#FFD700' : milestone >= 500 ? '#C0C0C0' : '#CD7F32',
        requirement: `Jouer ${milestone} parties multijoueur`,
      }
    });
  }

  // Monthly top 1 badges (temporary)
  await prisma.badge.upsert({
    where: { name: 'Top 1 Mensuel Solo' },
    update: {},
    create: {
      name: 'Top 1 Mensuel Solo',
      description: 'Classé premier du mois en mode solo',
      icon: '🥇',
      category: 'special',
      color: '#FFD700',
      requirement: 'Être premier au classement mensuel solo',
      isTemporary: true,
    }
  });

  await prisma.badge.upsert({
    where: { name: 'Top 1 Mensuel Multijoueur' },
    update: {},
    create: {
      name: 'Top 1 Mensuel Multijoueur',
      description: 'Classé premier du mois en mode multijoueur',
      icon: '👑',
      category: 'special',
      color: '#FF6B35',
      requirement: 'Être premier au classement mensuel multijoueur',
      isTemporary: true,
    }
  });

  console.log('Achievements seeded successfully!');
}

if (require.main === module) {
  seedAchievements()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
