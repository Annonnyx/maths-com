/**
 * Utilitaires de nettoyage et maintenance pour l'application
 */

import { prisma } from '@/lib/prisma';

/**
 * Nettoie les anciens tests incomplets (plus de 24h)
 */
export async function cleanupIncompleteTests() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await prisma.soloTest.deleteMany({
      where: {
        completedAt: null,
        startedAt: {
          lt: oneDayAgo
        }
      }
    });
    
    console.log(`Cleaned up ${result.count} incomplete tests older than 24h`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up incomplete tests:', error);
    return 0;
  }
}

/**
 * Nettoie les logs de debug anciens (à implémenter avec une table de logs)
 */
export async function cleanupDebugLogs() {
  // TODO: Implémenter quand une table de logs sera ajoutée
  console.log('Debug log cleanup not implemented yet');
}

/**
 * Optimise la base de données (réindexation, vacuum, etc.)
 */
export async function optimizeDatabase() {
  try {
    // Pour PostgreSQL
    await prisma.$executeRaw`VACUUM ANALYZE;`;
    console.log('Database optimization completed');
  } catch (error) {
    console.error('Error optimizing database:', error);
  }
}

/**
 * Vérifie l'intégrité des données Elo
 */
export async function validateEloData() {
  try {
    const usersWithInvalidElo = await prisma.user.findMany({
      where: {
        OR: [
          { soloElo: { lt: 0 } },
          { soloElo: { gt: 4000 } }
        ]
      },
      select: {
        id: true,
        username: true,
        soloElo: true,
        soloClass: true
      }
    });
    
    if (usersWithInvalidElo.length > 0) {
      console.log(`Found ${usersWithInvalidElo.length} users with invalid Elo:`);
      usersWithInvalidElo.forEach(user => {
        console.log(`- ${user.username}: ${user.soloElo} (${user.soloClass})`);
      });
    }
    
    return usersWithInvalidElo.length;
  } catch (error) {
    console.error('Error validating Elo data:', error);
    return 0;
  }
}

/**
 * Statistiques de santé du système
 */
export async function getSystemHealth() {
  try {
    const [
      totalUsers,
      totalTests,
      completedTests,
      incompleteTests,
      avgElo
    ] = await Promise.all([
      prisma.user.count(),
      prisma.soloTest.count(),
      prisma.soloTest.count({ where: { completedAt: { not: null } } }),
      prisma.soloTest.count({ where: { completedAt: null } }),
      prisma.user.aggregate({ _avg: { soloElo: true } })
    ]);
    
    return {
      totalUsers,
      totalTests,
      completedTests,
      incompleteTests,
      averageElo: Math.round(avgElo._avg.soloElo || 0),
      completionRate: totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0
    };
  } catch (error) {
    console.error('Error getting system health:', error);
    return null;
  }
}
