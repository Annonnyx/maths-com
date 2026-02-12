-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "friendships_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "friendships_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "multiplayer_games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT,
    "status" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "timeControl" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "player1Elo" INTEGER NOT NULL,
    "player2Elo" INTEGER,
    "player1Score" INTEGER NOT NULL DEFAULT 0,
    "player2Score" INTEGER NOT NULL DEFAULT 0,
    "winner" TEXT,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionCount" INTEGER NOT NULL DEFAULT 20,
    "difficulty" TEXT NOT NULL DEFAULT 'mixed',
    CONSTRAINT "multiplayer_games_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "multiplayer_games_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "multiplayer_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "player1Answer" TEXT,
    "player2Answer" TEXT,
    "player1Time" INTEGER,
    "player2Time" INTEGER,
    "player1Correct" BOOLEAN,
    "player2Correct" BOOLEAN,
    CONSTRAINT "multiplayer_questions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "multiplayer_games" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "multiplayer_statistics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalLosses" INTEGER NOT NULL DEFAULT 0,
    "totalDraws" INTEGER NOT NULL DEFAULT 0,
    "lightningGames" INTEGER NOT NULL DEFAULT 0,
    "lightningWins" INTEGER NOT NULL DEFAULT 0,
    "blitzGames" INTEGER NOT NULL DEFAULT 0,
    "blitzWins" INTEGER NOT NULL DEFAULT 0,
    "rapidGames" INTEGER NOT NULL DEFAULT 0,
    "rapidWins" INTEGER NOT NULL DEFAULT 0,
    "classicalGames" INTEGER NOT NULL DEFAULT 0,
    "classicalWins" INTEGER NOT NULL DEFAULT 0,
    "thinkingGames" INTEGER NOT NULL DEFAULT 0,
    "thinkingWins" INTEGER NOT NULL DEFAULT 0,
    "averageScore" REAL NOT NULL DEFAULT 0,
    "averageTime" REAL NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "headToHead" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "multiplayer_statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
INSERT INTO "new_users" ("additionLevel", "avatarUrl", "bestElo", "bestRankClass", "bestStreak", "createdAt", "currentStreak", "displayName", "divisionLevel", "elo", "email", "factorizationLevel", "hasCompletedOnboarding", "id", "lastTestDate", "multiplicationLevel", "password", "powerLevel", "rankClass", "rootLevel", "subtractionLevel", "updatedAt", "username") SELECT "additionLevel", "avatarUrl", "bestElo", "bestRankClass", "bestStreak", "createdAt", "currentStreak", "displayName", "divisionLevel", "elo", "email", "factorizationLevel", "hasCompletedOnboarding", "id", "lastTestDate", "multiplicationLevel", "password", "powerLevel", "rankClass", "rootLevel", "subtractionLevel", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "friendships_user1Id_user2Id_key" ON "friendships"("user1Id", "user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "multiplayer_statistics_userId_key" ON "multiplayer_statistics"("userId");
