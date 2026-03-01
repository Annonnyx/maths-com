-- Colonnes manquantes pour friendships
ALTER TABLE friendships ADD COLUMN IF NOT EXISTS "user1Id" TEXT;
ALTER TABLE friendships ADD COLUMN IF NOT EXISTS "user2Id" TEXT;
ALTER TABLE friendships ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE friendships ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE friendships ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Colonnes manquantes pour multiplayer_games (complément)
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "gametype" TEXT;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "timecontrol" TEXT;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "questioncount" INTEGER DEFAULT 20;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "difficulty" TEXT DEFAULT 'mixed';

-- Colonnes manquantes pour game_sessions (complément)
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS "quizId" TEXT;

-- Colonnes manquantes pour kahoot_questions
ALTER TABLE kahoot_questions ADD COLUMN IF NOT EXISTS "sessionId" TEXT;
ALTER TABLE kahoot_questions ADD COLUMN IF NOT EXISTS "question" TEXT;
ALTER TABLE kahoot_questions ADD COLUMN IF NOT EXISTS "answer" TEXT;
ALTER TABLE kahoot_questions ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE kahoot_questions ADD COLUMN IF NOT EXISTS "difficulty" INTEGER;
ALTER TABLE kahoot_questions ADD COLUMN IF NOT EXISTS "order" INTEGER;
ALTER TABLE kahoot_questions ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE kahoot_questions ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Colonnes manquantes pour multiplayer_questions
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "gameId" TEXT;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "question" TEXT;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "answer" TEXT;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "difficulty" INTEGER;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "order" INTEGER;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "player1Answer" TEXT;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "player2Answer" TEXT;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "player1Time" INTEGER;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "player2Time" INTEGER;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "player1Correct" BOOLEAN;
ALTER TABLE multiplayer_questions ADD COLUMN IF NOT EXISTS "player2Correct" BOOLEAN;

-- Foreign keys
ALTER TABLE friendships ADD CONSTRAINT friendships_user1id_fkey FOREIGN KEY ("user1Id") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE friendships ADD CONSTRAINT friendships_user2id_fkey FOREIGN KEY ("user2Id") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE kahoot_questions ADD CONSTRAINT kahoot_questions_sessionid_fkey FOREIGN KEY ("sessionId") REFERENCES game_sessions(id) ON DELETE CASCADE;
ALTER TABLE multiplayer_questions ADD CONSTRAINT multiplayer_questions_gameid_fkey FOREIGN KEY ("gameId") REFERENCES multiplayer_games(id) ON DELETE CASCADE;
