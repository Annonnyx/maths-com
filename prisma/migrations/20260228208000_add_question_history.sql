-- Ajout de la table question_history pour éviter les répétitions
CREATE TABLE IF NOT EXISTS question_history (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    correct BOOLEAN NOT NULL,
    elo_at_moment INTEGER NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_question_history_user_id ON question_history(user_id);
CREATE INDEX IF NOT EXISTS idx_question_history_answered_at ON question_history(answered_at);
CREATE INDEX IF NOT EXISTS idx_question_history_user_question ON question_history(user_id, question_id);

-- Activer RLS
ALTER TABLE question_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY question_history_own ON question_history
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);
