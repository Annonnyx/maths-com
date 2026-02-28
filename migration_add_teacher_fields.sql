-- ============================================
-- 🔧 MIGRATION SQL - AJOUT DES CHAMPS MANQUANTS
-- ============================================
-- Ce script ajoute uniquement les nouveaux champs à la table users existante
-- À exécuter sur Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. AJOUTER LES CHAMPS TEACHER À LA TABLE users
-- ============================================

-- Vérifier si la colonne isTeacher existe déjà
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'isTeacher') THEN
        ALTER TABLE users ADD COLUMN "isTeacher" BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Colonne isTeacher ajoutée';
    ELSE
        RAISE NOTICE 'Colonne isTeacher existe déjà';
    END IF;
END $$;

-- Ajouter la colonne school
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'school') THEN
        ALTER TABLE users ADD COLUMN school TEXT;
        RAISE NOTICE 'Colonne school ajoutée';
    ELSE
        RAISE NOTICE 'Colonne school existe déjà';
    END IF;
END $$;

-- Ajouter la colonne subject
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'subject') THEN
        ALTER TABLE users ADD COLUMN subject TEXT;
        RAISE NOTICE 'Colonne subject ajoutée';
    ELSE
        RAISE NOTICE 'Colonne subject existe déjà';
    END IF;
END $$;

-- ============================================
-- 2. CRÉER LA TABLE teacher_requests (SI ELLE N'EXISTE PAS)
-- ============================================

CREATE TABLE IF NOT EXISTS teacher_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    school TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour teacher_requests
CREATE INDEX IF NOT EXISTS idx_teacher_requests_status ON teacher_requests(status);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_userId ON teacher_requests("userId");

-- ============================================
-- 3. CRÉER LA TABLE faq_submissions (SI ELLE N'EXISTE PAS)
-- ============================================

CREATE TABLE IF NOT EXISTS faq_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'bug', 'question', 'suggestion'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    email TEXT,
    category TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'closed'
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "userAgent" TEXT,
    ip TEXT
);

CREATE INDEX IF NOT EXISTS idx_faq_submissions_status ON faq_submissions(status);

-- ============================================
-- 4. AJOUTER AUTRES CHAMPS POTENTIELLEMENT MANQUANTS
-- ============================================

-- Vérifier et ajouter discordId
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'discordId') THEN
        ALTER TABLE users ADD COLUMN "discordId" TEXT UNIQUE;
        RAISE NOTICE 'Colonne discordId ajoutée';
    END IF;
END $$;

-- Vérifier et ajouter discordUsername
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'discordUsername') THEN
        ALTER TABLE users ADD COLUMN "discordUsername" TEXT;
        RAISE NOTICE 'Colonne discordUsername ajoutée';
    END IF;
END $$;

-- Vérifier et ajouter discordLinkedAt
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'discordLinkedAt') THEN
        ALTER TABLE users ADD COLUMN "discordLinkedAt" TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne discordLinkedAt ajoutée';
    END IF;
END $$;

-- Vérifier et ajouter discordLinkCode
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'discordLinkCode') THEN
        ALTER TABLE users ADD COLUMN "discordLinkCode" TEXT UNIQUE;
        RAISE NOTICE 'Colonne discordLinkCode ajoutée';
    END IF;
END $$;

-- ============================================
-- 5. INDEX POUR LES NOUVELLES COLONNES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_isTeacher ON users("isTeacher");

-- ============================================
-- 6. TRIGGER POUR updatedAt SUR teacher_requests
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_teacher_requests_updated_at 
    BEFORE UPDATE ON teacher_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. VÉRIFICATION FINALE
-- ============================================

SELECT 
    'Colonnes dans users:' as info,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('isTeacher', 'school', 'subject', 'discordId', 'discordUsername')
ORDER BY ordinal_position;

-- Vérifier les nouvelles tables
SELECT 
    'Tables créées:' as info,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teacher_requests', 'faq_submissions')
ORDER BY table_name;

-- ============================================
-- 🎉 MIGRATION TERMINÉE
-- ============================================
-- Les champs teacher sont maintenant disponibles !
-- ============================================
