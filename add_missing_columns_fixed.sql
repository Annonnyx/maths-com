-- Supprimer les contraintes existantes d'abord
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_challengerid_fkey;
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_challengedid_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_senderid_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiverid_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_userid_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_senderid_fkey;

-- Ajouter les colonnes manquantes
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "challengerId" TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "challengedId" TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "gameType" TEXT DEFAULT 'pending';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "timeControl" TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "timeLimit" INTEGER;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "questionCount" INTEGER DEFAULT 20;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "difficulty" TEXT DEFAULT 'mixed';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'pending';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS "respondedAt" TIMESTAMP WITH TIME ZONE;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS "senderId" TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "receiverId" TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "read" BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "metadata" TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "message" TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "senderId" TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "senderName" TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "senderAvatarUrl" TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Recréer les contraintes
ALTER TABLE challenges ADD CONSTRAINT challenges_challengerid_fkey FOREIGN KEY ("challengerId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE challenges ADD CONSTRAINT challenges_challengedid_fkey FOREIGN KEY ("challengedId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_senderid_fkey FOREIGN KEY ("senderId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_receiverid_fkey FOREIGN KEY ("receiverId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT notifications_userid_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT notifications_senderid_fkey FOREIGN KEY ("senderId") REFERENCES users(id) ON DELETE SET NULL;
