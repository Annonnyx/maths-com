-- Création complète de la table QuestionHistory avec tous les champs requis
-- À exécuter sur Supabase SQL Editor

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS "QuestionHistory" (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    user_id TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    correct BOOLEAN NOT NULL,
    time_spent INTEGER DEFAULT 0,  -- en millisecondes
    difficulty TEXT DEFAULT 'mixed', -- 'easy', 'medium', 'hard'
    subject TEXT DEFAULT 'maths',
    type TEXT DEFAULT 'calculation', -- 'calculation', 'logic', etc.
    elo_at_moment INTEGER NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS "idx_question_history_user_id" ON "QuestionHistory"(user_id);
CREATE INDEX IF NOT EXISTS "idx_question_history_answered_at" ON "QuestionHistory"(answered_at);
CREATE INDEX IF NOT EXISTS "idx_question_history_user_question" ON "QuestionHistory"(user_id, question_id);

-- Activer RLS
ALTER TABLE "QuestionHistory" ENABLE ROW LEVEL SECURITY;

-- Supprimer ancienne politique si existe
DROP POLICY IF EXISTS "question_history_own" ON "QuestionHistory";

-- Politique RLS: les utilisateurs ne voient que leurs propres entrées
CREATE POLICY "question_history_own" ON "QuestionHistory"
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

-- Politique pour allow all (si besoin d'accès anonyme)
DROP POLICY IF EXISTS "question_history_select_all" ON "QuestionHistory";

CREATE POLICY "question_history_select_all" ON "QuestionHistory"
    FOR SELECT
    TO anon, authenticated
    USING (true);
