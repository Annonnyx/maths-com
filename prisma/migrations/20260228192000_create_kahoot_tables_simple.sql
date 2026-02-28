-- Migration simplifiée pour créer les tables Kahoot sans contraintes foreign key
-- Les contraintes seront ajoutées plus tard

-- Créer la table game_sessions
CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(6) UNIQUE NOT NULL,
    host_id TEXT NOT NULL,
    status TEXT DEFAULT 'waiting',
    quiz_id TEXT,
    max_players INTEGER DEFAULT 20,
    current_question_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table game_players
CREATE TABLE IF NOT EXISTS game_players (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_ready BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour game_sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_code ON game_sessions(code);
CREATE INDEX IF NOT EXISTS idx_game_sessions_host_id ON game_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);

-- Créer les index pour game_players
CREATE INDEX IF NOT EXISTS idx_game_players_session_id ON game_players(session_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);
CREATE INDEX IF NOT EXISTS idx_game_players_score ON game_players(score);

-- Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux deux tables
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;
CREATE TRIGGER update_game_sessions_updated_at 
    BEFORE UPDATE ON game_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_players_updated_at ON game_players;
CREATE TRIGGER update_game_players_updated_at 
    BEFORE UPDATE ON game_players 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur les tables
COMMENT ON TABLE game_sessions IS 'Sessions de jeu multijoueur style Kahoot';
COMMENT ON TABLE game_players IS 'Joueurs dans les sessions de jeu multijoueur';

COMMENT ON COLUMN game_sessions.code IS 'Code unique à 6 caractères pour rejoindre la partie';
COMMENT ON COLUMN game_sessions.status IS 'Statut de la session: waiting, active, finished';
COMMENT ON COLUMN game_sessions.max_players IS 'Nombre maximum de joueurs autorisés';
COMMENT ON COLUMN game_sessions.current_question_index IS 'Index de la question en cours';

COMMENT ON COLUMN game_players.score IS 'Score du joueur dans la session';
COMMENT ON COLUMN game_players.is_ready IS 'Le joueur est prêt à commencer';
