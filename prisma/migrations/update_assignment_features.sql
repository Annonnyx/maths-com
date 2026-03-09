-- Migration pour les nouvelles fonctionnalités de devoirs
-- À exécuter sur Supabase SQL Editor

-- Ajouter les nouvelles colonnes à class_assignments
ALTER TABLE "class_assignments" 
ADD COLUMN IF NOT EXISTS "school_level" TEXT,
ADD COLUMN IF NOT EXISTS "negative_points" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "question_source" TEXT DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS "share_code" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "share_enabled" BOOLEAN DEFAULT false;

-- Créer un index pour share_code
CREATE INDEX IF NOT EXISTS "idx_class_assignments_share_code" ON "class_assignments"("share_code");

-- Ajouter les nouvelles colonnes à assignment_questions
ALTER TABLE "assignment_questions"
ADD COLUMN IF NOT EXISTS "question_type" TEXT DEFAULT 'single',
ADD COLUMN IF NOT EXISTS "points" INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS "options" TEXT, -- JSON pour choix multiples
ADD COLUMN IF NOT EXISTS "correct_answers" TEXT, -- JSON pour réponses correctes multiples
ADD COLUMN IF NOT EXISTS "requires_manual_grading" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "accepted_answers" TEXT; -- JSON pour réponses acceptées

-- Ajouter les nouvelles colonnes à assignment_answers
ALTER TABLE "assignment_answers"
ADD COLUMN IF NOT EXISTS "selected_options" TEXT, -- JSON pour choix multiples
ADD COLUMN IF NOT EXISTS "points_earned" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "manually_graded" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "graded_by" TEXT,
ADD COLUMN IF NOT EXISTS "graded_at" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "feedback" TEXT;

-- Mettre à jour les colonnes de class_messages
ALTER TABLE "class_messages"
ADD COLUMN IF NOT EXISTS "read_by" TEXT, -- JSON array
ADD COLUMN IF NOT EXISTS "requires_confirmation" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "confirmed_by" TEXT, -- JSON array
ADD COLUMN IF NOT EXISTS "attachments" TEXT, -- JSON array
ADD COLUMN IF NOT EXISTS "is_pinned" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "pinned_at" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "pinned_by" TEXT,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Modifier le type par défaut de class_messages
ALTER TABLE "class_messages" ALTER COLUMN "type" SET DEFAULT 'discussion';

-- Trigger pour updated_at sur class_messages
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_class_messages_updated_at ON "class_messages";
CREATE TRIGGER update_class_messages_updated_at
    BEFORE UPDATE ON "class_messages"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
