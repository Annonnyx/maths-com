-- Création de la table pour l'historique des entraînements par cours
CREATE TABLE IF NOT EXISTS course_practice_history (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    questions_count INTEGER NOT NULL CHECK (questions_count > 0),
    correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
    time_spent_seconds INTEGER NOT NULL CHECK (time_spent_seconds >= 0),
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_course_practice_user_course ON course_practice_history(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_course_practice_user_date ON course_practice_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_practice_course_date ON course_practice_history(course_id, created_at DESC);

-- Activer RLS
ALTER TABLE course_practice_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY course_practice_own ON course_practice_history
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

-- Ajouter les relations dans le modèle User (sera mis à jour dans schema.prisma)
-- ALTER TABLE users ADD COLUMN coursePracticeHistories CoursePracticeHistory[];
