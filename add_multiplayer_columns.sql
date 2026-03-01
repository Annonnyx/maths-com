-- Colonnes manquantes pour multiplayer_games
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player1Id" TEXT;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player2Id" TEXT;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'waiting';
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "gametype" TEXT;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "timecontrol" TEXT;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "timelimit" INTEGER;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player1elo" INTEGER;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player2elo" INTEGER;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player1score" INTEGER DEFAULT 0;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player2score" INTEGER DEFAULT 0;
ALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "winner" TEXT;
ALTER TABLE multiplayer_games-- Colonnes manquantes pour multiplayer_games
ALTER TABLE multiplayer_games ADD COLUMN IgaALTER TABLE multiplayer_games ADD COLUMN IF MEALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player2Id" TEXTXIALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "status" TEXT DEtiALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "gametype" TEXT;
ALTER TABLE mumuALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "timecontrol" TxeALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "timelimit" INTEGE AALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player1elo" INTEGEEFALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player2elo" INTEGERTRALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player1score" INTEGusALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player2score" INTEGER DEFAULT 0seALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "winner" TEXT;
ALTER TABLE multiNOALTER TABLE multiplayer_games-- Colonnes manquantes pour multiplayerUMALTER TABLE multiplayer_games ADD COLUMN IgaALTER TABLE multiplayer_gamess ALTER TABLE mumuALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "timecontrol" TxeALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "timelimit" INTEGE AALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player1elo" INTEGEEFALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player2elo"EFALTER TABLE multiNOALTER TABLE multiplayer_games-- Colonnes manquantes pour multiplayerUMALTER TABLE multiplayer_games ADD COLUMN IgaALTER TABLE multiplayer_gamess ALTER TABLE mumuALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "timecontrol" TxeALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "timelimit" INTEGE AALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player1elo" INTEGEEFALTER TABLE multiplayer_games ADD COLUMN IF NOT EXISTS "player2elo"EFALTER TABLE multiNOALTER TABLE multiplayer_games-- Colonnes manquantes pour mulayers ADD COLUMN IF NOT EXISTS "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE game_players ADD COLUMN IF NOT EXISTS "isReady" BOOLEAN DEFAULT FALSE;
ALTER TABLE game_players ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Foreign keys pour game_players
ALTER TABLE game_players ADD CONSTRAINT game_players_sessionid_fkey FOREIGN KEY ("sessionId") REFERENCES game_sessions(id) ON DELETE CASCADE;
ALTER TABLE game_players ADD CONSTRAINT game_players_userid_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
