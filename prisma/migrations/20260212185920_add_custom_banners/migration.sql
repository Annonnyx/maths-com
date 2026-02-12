/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `badges` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "customBannerId" TEXT;

-- CreateTable
CREATE TABLE "custom_banners" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "custom_banners_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserBanners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserBanners_A_fkey" FOREIGN KEY ("A") REFERENCES "custom_banners" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserBanners_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengerId" TEXT NOT NULL,
    "challengedId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL DEFAULT 'pending',
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
INSERT INTO "new_challenges" ("challengedId", "challengerId", "createdAt", "difficulty", "expiresAt", "gameType", "id", "questionCount", "respondedAt", "status", "timeControl", "timeLimit") SELECT "challengedId", "challengerId", "createdAt", "difficulty", "expiresAt", "gameType", "id", "questionCount", "respondedAt", "status", "timeControl", "timeLimit" FROM "challenges";
DROP TABLE "challenges";
ALTER TABLE "new_challenges" RENAME TO "challenges";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_UserBanners_AB_unique" ON "_UserBanners"("A", "B");

-- CreateIndex
CREATE INDEX "_UserBanners_B_index" ON "_UserBanners"("B");

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");
