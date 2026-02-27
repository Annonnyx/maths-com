-- Add Discord integration fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "discordId" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "discordUsername" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "discordLinkedAt" TIMESTAMP(3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "discordLinkCode" TEXT;

-- Add unique constraints (will fail if they already exist, that's ok)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_discordId_key') THEN
        ALTER TABLE users ADD CONSTRAINT "users_discordId_key" UNIQUE ("discordId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_discordLinkCode_key') THEN
        ALTER TABLE users ADD CONSTRAINT "users_discordLinkCode_key" UNIQUE ("discordLinkCode");
    END IF;
END $$;
