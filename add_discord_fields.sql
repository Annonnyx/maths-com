-- Add Discord integration fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "discordId" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "discordUsername" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "discordLinkedAt" TIMESTAMP(3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "discordLinkCode" TEXT;

-- Add unique constraints
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS "users_discordId_key" UNIQUE ("discordId");
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS "users_discordLinkCode_key" UNIQUE ("discordLinkCode");
