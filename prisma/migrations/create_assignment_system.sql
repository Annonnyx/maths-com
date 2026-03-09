-- Créer le système complet de devoirs (Class Assignments)
-- À exécuter sur Supabase SQL Editor

-- Table principale des devoirs
CREATE TABLE IF NOT EXISTS "class_assignments" (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    class_id TEXT NOT NULL REFERENCES "class_groups"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    question_count INTEGER DEFAULT 10,
    difficulty TEXT DEFAULT 'mixed', -- easy, medium, hard, mixed
    time_limit INTEGER, -- en minutes, null = pas de limite
    operation_types TEXT, -- JSON array: ["addition", "subtraction", ...]
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active', -- active, closed, draft
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des questions générées pour chaque devoir
CREATE TABLE IF NOT EXISTS "assignment_questions" (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    assignment_id TEXT NOT NULL REFERENCES "class_assignments"(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    type TEXT NOT NULL, -- addition, subtraction, etc.
    difficulty INTEGER NOT NULL, -- 1-10
    "order" INTEGER NOT NULL -- Position dans le devoir
);

-- Table des rendus des élèves
CREATE TABLE IF NOT EXISTS "assignment_submissions" (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    assignment_id TEXT NOT NULL REFERENCES "class_assignments"(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress', -- in_progress, submitted, graded
    score INTEGER, -- 0-100, null si pas encore noté
    correct_count INTEGER DEFAULT 0,
    total_answered INTEGER DEFAULT 0,
    time_spent INTEGER, -- en secondes
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by TEXT,
    UNIQUE(assignment_id, student_id)
);

-- Table des réponses individuelles
CREATE TABLE IF NOT EXISTS "assignment_answers" (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    submission_id TEXT NOT NULL REFERENCES "assignment_submissions"(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES "assignment_questions"(id) ON DELETE CASCADE,
    user_answer TEXT,
    is_correct BOOLEAN,
    time_taken INTEGER, -- en millisecondes
    UNIQUE(submission_id, question_id)
);

-- Indexes pour les performances
CREATE INDEX IF NOT EXISTS "idx_class_assignments_class_id" ON "class_assignments"(class_id);
CREATE INDEX IF NOT EXISTS "idx_class_assignments_status" ON "class_assignments"(status);
CREATE INDEX IF NOT EXISTS "idx_assignment_questions_assignment_id" ON "assignment_questions"(assignment_id);
CREATE INDEX IF NOT EXISTS "idx_assignment_submissions_assignment_id" ON "assignment_submissions"(assignment_id);
CREATE INDEX IF NOT EXISTS "idx_assignment_submissions_student_id" ON "assignment_submissions"(student_id);
CREATE INDEX IF NOT EXISTS "idx_assignment_answers_submission_id" ON "assignment_answers"(submission_id);

-- Activer RLS sur toutes les tables
ALTER TABLE "class_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assignment_questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assignment_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assignment_answers" ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour class_assignments
DROP POLICY IF EXISTS "assignments_select_all" ON "class_assignments";
DROP POLICY IF EXISTS "assignments_teacher_all" ON "class_assignments";

-- Tous les membres de la classe peuvent voir les devoirs actifs
CREATE POLICY "assignments_select_all" ON "class_assignments"
    FOR SELECT
    TO authenticated
    USING (true);

-- Seul le professeur peut créer/modifier/supprimer
CREATE POLICY "assignments_teacher_all" ON "class_assignments"
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "class_groups" cg
            WHERE cg.id = class_assignments.class_id
            AND cg.teacher_id = auth.uid()::text
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "class_groups" cg
            WHERE cg.id = class_assignments.class_id
            AND cg.teacher_id = auth.uid()::text
        )
    );

-- Politiques RLS pour assignment_questions
DROP POLICY IF EXISTS "questions_select_all" ON "assignment_questions";

CREATE POLICY "questions_select_all" ON "assignment_questions"
    FOR SELECT
    TO authenticated
    USING (true);

-- Politiques RLS pour assignment_submissions
DROP POLICY IF EXISTS "submissions_own_all" ON "assignment_submissions";
DROP POLICY IF EXISTS "submissions_teacher_view" ON "assignment_submissions";

-- Les élèves peuvent gérer leurs propres rendus
CREATE POLICY "submissions_own_all" ON "assignment_submissions"
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid()::text)
    WITH CHECK (student_id = auth.uid()::text);

-- Le professeur peut voir tous les rendus de sa classe
CREATE POLICY "submissions_teacher_view" ON "assignment_submissions"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "class_assignments" ca
            JOIN "class_groups" cg ON ca.class_id = cg.id
            WHERE ca.id = assignment_submissions.assignment_id
            AND cg.teacher_id = auth.uid()::text
        )
    );

-- Politiques RLS pour assignment_answers
DROP POLICY IF EXISTS "answers_own_all" ON "assignment_answers";
DROP POLICY IF EXISTS "answers_teacher_view" ON "assignment_answers";

-- Les élèves peuvent gérer leurs propres réponses
CREATE POLICY "answers_own_all" ON "assignment_answers"
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "assignment_submissions" sub
            WHERE sub.id = assignment_answers.submission_id
            AND sub.student_id = auth.uid()::text
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "assignment_submissions" sub
            WHERE sub.id = assignment_answers.submission_id
            AND sub.student_id = auth.uid()::text
        )
    );

-- Le professeur peut voir toutes les réponses
CREATE POLICY "answers_teacher_view" ON "assignment_answers"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "assignment_submissions" sub
            JOIN "class_assignments" ca ON sub.assignment_id = ca.id
            JOIN "class_groups" cg ON ca.class_id = cg.id
            WHERE sub.id = assignment_answers.submission_id
            AND cg.teacher_id = auth.uid()::text
        )
    );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_class_assignments_updated_at ON "class_assignments";
CREATE TRIGGER update_class_assignments_updated_at
    BEFORE UPDATE ON "class_assignments"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
