import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Test de connexion
prisma.$connect()
  .then(() => console.log("✅ Prisma connecté à la base de données"))
  .catch((error) => console.error("❌ Erreur de connexion Prisma:", error));
