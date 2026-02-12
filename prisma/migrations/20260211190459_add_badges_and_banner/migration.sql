-- AlterTable
ALTER TABLE "messages" ADD COLUMN "metadata" TEXT;

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#FFD700',
    "requirement" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awardedById" TEXT,
    CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengerId" TEXT NOT NULL,
    "challengedId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "timeControl" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 20,
    "difficulty" TEXT NOT NULL DEFAULT 'mixed',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "respondedAt" DATETIME,
    CONSTRAINT "challenges_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "challenges_challengedId_fkey" FOREIGN KEY ("challengedId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "selectedBadgeIds" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "elo" INTEGER NOT NULL DEFAULT 400,
    "rankClass" TEXT NOT NULL DEFAULT 'F-',
    "bestElo" INTEGER NOT NULL DEFAULT 400,
    "bestRankClass" TEXT NOT NULL DEFAULT 'F-',
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "additionLevel" INTEGER NOT NULL DEFAULT 1,
    "subtractionLevel" INTEGER NOT NULL DEFAULT 0,
    "multiplicationLevel" INTEGER NOT NULL DEFAULT 0,
    "divisionLevel" INTEGER NOT NULL DEFAULT 0,
    "powerLevel" INTEGER NOT NULL DEFAULT 0,
    "rootLevel" INTEGER NOT NULL DEFAULT 0,
    "factorizationLevel" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastTestDate" DATETIME,
    "multiplayerElo" INTEGER NOT NULL DEFAULT 400,
    "multiplayerRankClass" TEXT NOT NULL DEFAULT 'F-',
    "bestMultiplayerElo" INTEGER NOT NULL DEFAULT 400,
    "bestMultiplayerRankClass" TEXT NOT NULL DEFAULT 'F-',
    "multiplayerGames" INTEGER NOT NULL DEFAULT 0,
    "multiplayerWins" INTEGER NOT NULL DEFAULT 0,
    "multiplayerLosses" INTEGER NOT NULL DEFAULT 0,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("additionLevel", "avatarUrl", "bestElo", "bestMultiplayerElo", "bestMultiplayerRankClass", "bestRankClass", "bestStreak", "createdAt", "currentStreak", "displayName", "divisionLevel", "elo", "email", "factorizationLevel", "hasCompletedOnboarding", "id", "isOnline", "lastSeenAt", "lastTestDate", "multiplayerElo", "multiplayerGames", "multiplayerLosses", "multiplayerRankClass", "multiplayerWins", "multiplicationLevel", "password", "powerLevel", "rankClass", "rootLevel", "subtractionLevel", "updatedAt", "username") SELECT "additionLevel", "avatarUrl", "bestElo", "bestMultiplayerElo", "bestMultiplayerRankClass", "bestRankClass", "bestStreak", "createdAt", "currentStreak", "displayName", "divisionLevel", "elo", "email", "factorizationLevel", "hasCompletedOnboarding", "id", "isOnline", "lastSeenAt", "lastTestDate", "multiplayerElo", "multiplayerGames", "multiplayerLosses", "multiplayerRankClass", "multiplayerWins", "multiplicationLevel", "password", "powerLevel", "rankClass", "rootLevel", "subtractionLevel", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");
