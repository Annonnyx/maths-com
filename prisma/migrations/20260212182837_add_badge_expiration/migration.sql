-- AlterTable
ALTER TABLE "user_badges" ADD COLUMN "expiresAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#FFD700',
    "requirement" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isTemporary" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_badges" ("category", "color", "createdAt", "createdById", "description", "icon", "id", "isCustom", "name", "requirement") SELECT "category", "color", "createdAt", "createdById", "description", "icon", "id", "isCustom", "name", "requirement" FROM "badges";
DROP TABLE "badges";
ALTER TABLE "new_badges" RENAME TO "badges";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
