import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientSqlite } from '@prisma/client';
import { PrismaClient as PrismaClientPostgres } from '@prisma/client';

import { PrismaSQLite } from '@prisma/adapter-sqlite';
import { PrismaPg } from '@prisma/adapter-pg';
import { Database } from 'sqlite3';
import pg from 'pg';

type ModelsToCopy = {
  user: PrismaClient['user'];
  badge: PrismaClient['badge'];
  userBadge: PrismaClient['userBadge'];
  customBanner: PrismaClient['customBanner'];
  course: PrismaClient['course'];
  test: PrismaClient['test'];
  question: PrismaClient['question'];
  statistics: PrismaClient['statistics'];
  exerciseAttempt: PrismaClient['exerciseAttempt'];
  multiplayerStatistics: PrismaClient['multiplayerStatistics'];
  friendship: PrismaClient['friendship'];
  message: PrismaClient['message'];
  challenge: PrismaClient['challenge'];
  multiplayerGame: PrismaClient['multiplayerGame'];
  multiplayerQuestion: PrismaClient['multiplayerQuestion'];
};

function pick<T extends object>(obj: T, keys: (keyof T)[]): Partial<T> {
  const out: Partial<T> = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}

async function copyAll<T extends { id: string }>(
  modelName: string,
  sourceFindMany: () => Promise<T[]>,
  targetCreate: (data: T) => Promise<unknown>,
  batchSize = 250
) {
  const rows = await sourceFindMany();
  console.log(`${modelName}: ${rows.length}`);

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (row) => {
        try {
          await targetCreate(row);
        } catch (e: any) {
          // Ignore duplicates if rerun
          if (typeof e?.code === 'string' && e.code === 'P2002') return;
          throw e;
        }
      })
    );
    console.log(`${modelName}: copied ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
  }
}

async function main() {
  const sqliteUrl = process.env.SQLITE_DATABASE_URL;
  const pgUrl = process.env.DATABASE_URL;

  if (!sqliteUrl) {
    throw new Error('Missing SQLITE_DATABASE_URL env var (example: file:./prisma/prisma/dev.db)');
  }
  if (!pgUrl) {
    throw new Error('Missing DATABASE_URL env var (Postgres Supabase)');
  }

  const sqliteFilePath = sqliteUrl.startsWith('file:') ? sqliteUrl.replace(/^file:/, '') : sqliteUrl;

  const sqliteDb = new Database(sqliteFilePath);
  const sqliteAdapter = new PrismaSQLite(sqliteDb);
  const source = new PrismaClientSqlite({ adapter: sqliteAdapter });

  const pool = new pg.Pool({ connectionString: pgUrl });
  const pgAdapter = new PrismaPg(pool);
  const target = new PrismaClientPostgres({ adapter: pgAdapter });

  try {
    console.log('Starting migration SQLite -> Postgres');

    // Copy in FK-safe-ish order
    await copyAll('users', () => source.user.findMany(), (row) => target.user.create({ data: row as any }));
    await copyAll('badges', () => source.badge.findMany(), (row) => target.badge.create({ data: row as any }));
    await copyAll('courses', () => source.course.findMany(), (row) => target.course.create({ data: row as any }));
    await copyAll('custom_banners', () => source.customBanner.findMany(), (row) => target.customBanner.create({ data: row as any }));

    await copyAll('statistics', () => source.statistics.findMany(), (row) => target.statistics.create({ data: row as any }));
    await copyAll('multiplayer_statistics', () => source.multiplayerStatistics.findMany(), (row) => target.multiplayerStatistics.create({ data: row as any }));

    await copyAll('tests', () => source.test.findMany(), (row) => target.test.create({ data: row as any }));
    await copyAll('questions', () => source.question.findMany(), (row) => target.question.create({ data: row as any }));

    await copyAll('exercise_attempts', () => source.exerciseAttempt.findMany(), (row) => target.exerciseAttempt.create({ data: row as any }));

    await copyAll('friendships', () => source.friendship.findMany(), (row) => target.friendship.create({ data: row as any }));
    await copyAll('messages', () => source.message.findMany(), (row) => target.message.create({ data: row as any }));

    await copyAll('challenges', () => source.challenge.findMany(), (row) => target.challenge.create({ data: row as any }));

    await copyAll('multiplayer_games', () => source.multiplayerGame.findMany(), (row) => target.multiplayerGame.create({ data: row as any }));
    await copyAll('multiplayer_questions', () => source.multiplayerQuestion.findMany(), (row) => target.multiplayerQuestion.create({ data: row as any }));

    await copyAll('user_badges', () => source.userBadge.findMany(), (row) => target.userBadge.create({ data: row as any }));

    console.log('Migration finished');
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
