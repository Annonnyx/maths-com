-- SCRIPT COMPLET DE MIGRATION SOLO/MULTIJOUEUR
-- Exécuter dans Supabase SQL Editor

-- ÉTAPE 1: Ajouter les nouveaux champs dans users
ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloElo" INTEGER DEFAULT 400;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloRankClass" TEXT DEFAULT 'F-';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloBestElo" INTEGER DEFAULT 400;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloBestRankClass" TEXT DEFAULT 'F-';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloCurrentStreak" INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloBestStreak" INTEGER DEFAULT 0;

ALTER TABLE users ADD COLUMN IF NOT EXISTS "multiplayerElo" INTEGER DEFAULT 400;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "multiplayerRankClass" TEXT DEFAULT 'F-';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "multiplayerBestElo" INTEGER DEFAULT 400;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "multiplayerBestRankClass" TEXT DEFAULT 'F-';

-- ÉTAPE 2: Migrer les données existantes vers les nouveaux champs
UPDATE users SET 
    "soloElo" = COALESCE(elo, 400),
    "soloRankClass" = COALESCE("rankClass", 'F-'),
    "soloBestElo" = COALESCE("bestElo", 400),
    "soloBestRankClass" = COALESCE("bestRankClass", 'F-'),
    "soloCurrentStreak" = COALESCE("currentStreak", 0),
    "soloBestStreak" = COALESCE("bestStreak", 0)
WHERE "soloElo" = 400; -- Seulement pour les utilisateurs avec valeurs par défaut

-- ÉTAPE 3: Renommer les tables solo
ALTER TABLE statistics RENAME TO solo_statistics;
ALTER TABLE tests RENAME TO solo_tests;
ALTER TABLE questions RENAME TO solo_questions;

-- ÉTAPE 4: Mettre à jour les contraintes et relations
-- Supprimer les anciennes contraintes
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_statistics_id_fkey;
ALTER TABLE solo_statistics DROP CONSTRAINT IF EXISTS statistics_userid_fkey;

-- Recréer les contraintes avec les nouveaux noms
ALTER TABLE solo_statistics ADD CONSTRAINT solo_statistics_userid_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- ÉTAPE 5: Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_solo_elo ON users("soloElo");
CREATE INDEX IF NOT EXISTS idx_users_multiplayer_elo ON users("multiplayerElo");
CREATE INDEX IF NOT EXISTS idx_solo_statistics_userid ON solo_statistics("userId");
CREATE INDEX IF NOT EXISTS idx_multiplayer_statistics_userid ON multiplayer_statistics("userId");
CREATE INDEX IF NOT EXISTS idx_solo_tests_userid ON solo_tests("userId");
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_player1 ON multiplayer_games("player1Id");
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_player2 ON multiplayer_games("player2Id");
CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships("user1Id");
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships("user2Id");
CREATE INDEX IF NOT EXISTS idx_notifications_userid ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_createdat ON notifications("createdAt");

-- ÉTAPE 6: Créer la table leaderboard unifiée
CREATE TABLE IF NOT EXISTS leaderboard (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('solo', 'multiplayer')),
    elo INTEGER NOT NULL,
    rankClass TEXT NOT NULL,
    globalRank INTEGER,
    weeklyRank INTEGER,
    monthlyRank INTEGER,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(userId, mode)
);

-- ÉTAPE 7: Peupler la table leaderboard
-- Solo leaderboard
INSERT INTO leaderboard (userId, mode, elo, rankClass, globalRank)
SELECT 
    id as userId,
    'solo' as mode,
    "soloElo" as elo,
    "soloRankClass" as rankClass,
    ROW_NUMBER() OVER (ORDER BY "soloElo" DESC) as globalRank
FROM users
ON CONFLICT (userId, mode) DO UPDATE SET
    elo = EXCLUDED.elo,
    rankClass = EXCLUDED.rankClass,
    globalRank = EXCLUDED.globalRank,
    updatedAt = NOW();

-- Multiplayer leaderboard
INSERT INTO leaderboard (userId, mode, elo, rankClass, globalRank)
SELECT 
    id as userId,
    'multiplayer' as mode,
    "multiplayerElo" as elo,
    "multiplayerRankClass" as rankClass,
    ROW_NUMBER() OVER (ORDER BY "multiplayerElo" DESC) as globalRank
FROM users
ON CONFLICT (userId, mode) DO UPDATE SET
    elo = EXCLUDED.elo,
    rankClass = EXCLUDED.rankClass,
    globalRank = EXCLUDED.globalRank,
    updatedAt = NOW();

-- ÉTAPE 8: Nettoyer les anciens champs (optionnel, à faire après validation)
-- COMMENTAIRE: Exécuter seulement après validation que tout fonctionne
-- ALTER TABLE users DROP COLUMN IF EXISTS elo;
-- ALTER TABLE users DROP COLUMN IF EXISTS "rankClass";
-- ALTER TABLE users DROP COLUMN IF EXISTS "bestElo";
-- ALTER TABLE users DROP COLUMN IF EXISTS "bestRankClass";
-- ALTER TABLE users DROP COLUMN IF EXISTS "currentStreak";
-- ALTER TABLE users DROP COLUMN IF EXISTS "bestStreak";

-- ÉTAPE 9: Créer les fonctions de mise à jour automatique du leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard_on_elo_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le leaderboard solo
    IF TG_TABLE_NAME = 'users' THEN
        INSERT INTO leaderboard (userId, mode, elo, rankClass, globalRank)
        VALUES 
            (NEW.id, 'solo', NEW."soloElo", NEW."soloRankClass", 
             (SELECT COUNT(*) + 1 FROM users WHERE "soloElo" > NEW."soloElo")),
            (NEW.id, 'multiplayer', NEW."multiplayerElo", NEW."multiplayerRankClass",
             (SELECT COUNT(*) + 1 FROM users WHERE "multiplayerElo" > NEW."multiplayerElo"))
        ON CONFLICT (userId, mode) DO UPDATE SET
            elo = EXCLUDED.elo,
            rankClass = EXCLUDED.rankClass,
            globalRank = EXCLUDED.globalRank,
            updatedAt = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ÉTAPE 10: Créer le trigger sur la table users
DROP TRIGGER IF EXISTS trigger_update_leaderboard ON users;
CREATE TRIGGER trigger_update_leaderboard
    AFTER UPDATE OF "soloElo", "soloRankClass", "multiplayerElo", "multiplayerRankClass"
    ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_leaderboard_on_elo_change();

-- ÉTAPE 11: Politiques RLS pour la nouvelle table leaderboard
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Politique pour voir son propre rang et le leaderboard global
CREATE POLICY "Users can view leaderboard" ON leaderboard
    FOR SELECT USING (true);

-- Politique pour que le système mette à jour le leaderboard
CREATE POLICY "System can update leaderboard" ON leaderboard
    FOR ALL USING (false); -- Seul le trigger peut modifier

-- ÉTAPE 12: Validation finale
SELECT 'Migration solo/multiplayer terminée avec succès!' as status,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM leaderboard WHERE mode = 'solo') as solo_leaderboard_entries,
       (SELECT COUNT(*) FROM leaderboard WHERE mode = 'multiplayer') as multiplayer_leaderboard_entries;
