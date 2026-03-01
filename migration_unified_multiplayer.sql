-- MIGRATION SQL - MODÈLE DE DONNÉES UNIFIÉ MULTIJOUER
-- Exécuter dans Supabase SQL Editor

-- ÉTAPE 1: Ajouter les champs manquants à game_sessions pour supporter tous les modes
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS game_mode TEXT CHECK (game_mode IN ('ranked_1v1', 'casual_1v1', 'group_quiz')) DEFAULT 'group_quiz',
ADD COLUMN IF NOT EXISTS time_control TEXT CHECK (time_control IN ('bullet', 'blitz', 'rapid', 'classical', 'custom')) DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS time_per_question INTEGER DEFAULT 10, -- en secondes, pour mode groupe
ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 20, -- 2 pour 1v1, jusqu'à 30 pour groupe
ADD COLUMN IF NOT EXISTS join_code VARCHAR(6) UNIQUE, -- pour rejoindre via code (remplace code)
ADD COLUMN IF NOT EXISTS qr_code_url TEXT, -- nullable, pour QR code
ADD COLUMN IF NOT EXISTS is_ranked BOOLEAN DEFAULT false, -- pour différencier ranked/casual
ADD COLUMN IF NOT EXISTS time_limit INTEGER, -- en secondes, pour modes 1v1
ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'mixed' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
ADD COLUMN IF NOT EXISTS player1_id TEXT REFERENCES users(id),
ADD COLUMN IF NOT EXISTS player2_id TEXT REFERENCES users(id),
ADD COLUMN IF NOT EXISTS player1_elo INTEGER DEFAULT 400,
ADD COLUMN IF NOT EXISTS player2_elo INTEGER DEFAULT 400,
ADD COLUMN IF NOT EXISTS player1_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS player2_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS winner TEXT REFERENCES users(id),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP WITH TIME ZONE;

-- ÉTAPE 2: Mettre à jour les contraintes existantes
-- Supprimer l'ancienne contrainte unique sur code si elle existe
ALTER TABLE game_sessions DROP CONSTRAINT IF EXISTS game_sessions_code_key;

-- Renommer l'ancien champ code vers join_code pour compatibilité
ALTER TABLE game_sessions RENAME COLUMN code TO old_code;

-- Créer le nouveau join_code s'il n'existe pas
UPDATE game_sessions SET join_code = old_code WHERE join_code IS NULL AND old_code IS NOT NULL;

-- Supprimer l'ancien champ code
ALTER TABLE game_sessions DROP COLUMN IF EXISTS old_code;

-- Ajouter la contrainte unique sur join_code
ALTER TABLE game_sessions ADD CONSTRAINT game_sessions_join_code_key UNIQUE (join_code);

-- ÉTAPE 3: Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_game_sessions_mode ON game_sessions(game_mode);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_host ON game_sessions(hostId);
CREATE INDEX IF NOT EXISTS idx_game_sessions_join_code ON game_sessions(join_code);
CREATE INDEX IF NOT EXISTS idx_game_sessions_time_control ON game_sessions(time_control);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);

-- ÉTAPE 4: Mettre à jour les données existantes pour le mode groupe
-- Pour les sessions existantes (mode Kahoot), les marquer comme group_quiz
UPDATE game_sessions 
SET 
    game_mode = 'group_quiz',
    time_control = 'custom',
    is_ranked = false,
    max_players = 20
WHERE game_mode IS NULL;

-- ÉTAPE 5: Créer une table unifiée pour les questions
-- Renommer kahoot_questions vers game_questions
ALTER TABLE kahoot_questions RENAME TO game_questions;

-- Ajouter des champs pour supporter les réponses des joueurs 1v1
ALTER TABLE game_questions 
ADD COLUMN IF NOT EXISTS player1_answer TEXT,
ADD COLUMN IF NOT EXISTS player2_answer TEXT,
ADD COLUMN IF NOT EXISTS player1_time INTEGER, -- en milliseconds
ADD COLUMN IF NOT EXISTS player2_time INTEGER, -- en milliseconds
ADD COLUMN IF NOT EXISTS player1_correct BOOLEAN,
ADD COLUMN IF NOT EXISTS player2_correct BOOLEAN;

-- ÉTAPE 6: Créer une table de migration pour les jeux 1v1 existants
-- Créer une table temporaire pour migrer multiplayer_games vers game_sessions
CREATE TEMPORARY TABLE temp_multiplayer_migration AS
SELECT 
    id,
    player1Id,
    player2Id,
    status,
    CASE 
        WHEN gameType = 'ranked' THEN 'ranked_1v1'
        WHEN gameType = 'friendly' THEN 'casual_1v1'
        ELSE 'casual_1v1'
    END as game_mode,
    timeControl,
    timeLimit as time_limit,
    player1Elo as player1_elo,
    player2Elo as player2_elo,
    player1Score as player1_score,
    player2Score as player2_score,
    winner,
    startedAt as started_at,
    finishedAt as finished_at,
    questionCount as question_count,
    difficulty,
    createdAt as created_at,
    NULL as hostId, -- Pas d'hôte pour 1v1
    NULL as join_code, -- Pas de code pour 1v1
    NULL as qr_code_url,
    CASE WHEN gameType = 'ranked' THEN true ELSE false END as is_ranked,
    2 as max_players,
    NULL as time_per_question,
    NULL as currentQuestionIndex,
    NULL as quizId
FROM multiplayer_games;

-- ÉTAPE 7: Insérer les jeux 1v1 dans game_sessions
INSERT INTO game_sessions (
    id, player1_id, player2_id, status, game_mode, time_control, time_limit,
    player1_elo, player2_elo, player1_score, player2_score, winner,
    started_at, finished_at, question_count, difficulty, created_at,
    hostId, join_code, qr_code_url, is_ranked, max_players, time_per_question,
    currentQuestionIndex, quizId
)
SELECT * FROM temp_multiplayer_migration
ON CONFLICT (id) DO NOTHING;

-- ÉTAPE 8: Migrer les questions des jeux 1v1
INSERT INTO game_questions (
    id, sessionId, question, answer, type, difficulty, order, createdAt,
    player1_answer, player2_answer, player1_time, player2_time,
    player1_correct, player2_correct
)
SELECT 
    q.id,
    q.gameId as sessionId,
    q.question,
    q.answer,
    q.type,
    q.difficulty,
    q.order,
    g.createdAt,
    q.player1Answer as player1_answer,
    q.player2Answer as player2_answer,
    q.player1Time as player1_time,
    q.player2Time as player2_time,
    q.player1Correct as player1_correct,
    q.player2Correct as player2_correct
FROM multiplayer_questions q
JOIN game_sessions g ON g.id = q.gameId
WHERE g.game_mode IN ('ranked_1v1', 'casual_1v1')
ON CONFLICT (id) DO NOTHING;

-- ÉTAPE 9: Nettoyage optionnel (à faire après validation)
-- Supprimer les anciennes tables seulement après validation
-- DROP TABLE IF EXISTS multiplayer_games CASCADE;
-- DROP TABLE IF EXISTS multiplayer_questions CASCADE;

-- ÉTAPE 10: Validation finale
SELECT 
    'Migration unifiée terminée' as status,
    (SELECT COUNT(*) FROM game_sessions) as total_sessions,
    (SELECT COUNT(*) FROM game_sessions WHERE game_mode = 'group_quiz') as group_sessions,
    (SELECT COUNT(*) FROM game_sessions WHERE game_mode IN ('ranked_1v1', 'casual_1v1')) as pvp_sessions,
    (SELECT COUNT(*) FROM game_questions) as total_questions,
    (SELECT COUNT(*) FROM game_players) as total_players
FROM dual;
