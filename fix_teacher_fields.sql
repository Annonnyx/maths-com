-- ============================================
-- 🚀 MIGRATION SIMPLE - CHAMPS TEACHER
-- ============================================
-- Copier ce script dans Supabase SQL Editor
-- ============================================

-- Ajouter les colonnes manquantes
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "isTeacher" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT;

-- Créer table teacher_requests
CREATE TABLE IF NOT EXISTS teacher_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    school TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_users_isTeacher ON users("isTeacher");
CREATE INDEX IF NOT EXISTS idx_teacher_requests_status ON teacher_requests(status);

-- Vérification
SELECT '✅ Migration réussie!' as status;
SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('isTeacher', 'school', 'subject');
