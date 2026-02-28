-- Création de la table pour les questions Kahoot synchronisées
CREATE TABLE IF NOT EXISTS kahoot_questions (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    session_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    type TEXT NOT NULL, -- operation type
    difficulty INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_kahoot_questions_session_order ON kahoot_questions(session_id, "order");

-- Activer RLS
ALTER TABLE kahoot_questions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY kahoot_questions_public ON kahoot_questions
    FOR SELECT
    USING (true);

CREATE POLICY kahoot_questions_host ON kahoot_questions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM game_sessions 
            WHERE game_sessions.id = session_id 
            AND game_sessions.host_id = auth.uid()::text
        )
    );

-- Ajouter la relation dans le modèle GameSession (sera mis à jour dans schema.prisma)
-- ALTER TABLE game_sessions ADD COLUMN kahootQuestions KahootQuestion[];
