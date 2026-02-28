/* ============================================
 * 🎯 SCRIPT ULTRA-SIMPLE - MIGRATION CHAMPS TEACHER
 * ============================================
 * Copier-coller ce script dans Supabase SQL Editor
 * et cliquer sur "Run"
 * ============================================ */

-- Ajouter les 3 champs teacher à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "isTeacher" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT;

-- Créer la table teacher_requests
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

-- Créer la table faq_submissions  
CREATE TABLE IF NOT EXISTS faq_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    email TEXT,
    category TEXT,
    status TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "userAgent" TEXT,
    ip TEXT
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_isTeacher ON users("isTeacher");
CREATE INDEX IF NOT EXISTS idx_teacher_requests_status ON teacher_requests(status);
CREATE INDEX IF NOT EXISTS idx_faq_submissions_status ON faq_submissions(status);

-- Vérification
SELECT 'Migration terminée !' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('isTeacher', 'school', 'subject');
