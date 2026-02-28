-- ============================================
-- 🚀 MIGRATION COMPLÈTE - TOUTES LES TABLES
-- ============================================
-- À exécuter sur Supabase SQL Editor
-- ============================================

-- 1. FAQ Submissions (si pas déjà créé)
CREATE TABLE IF NOT EXISTS faq_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- bug, question, suggestion
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    email TEXT,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, resolved, closed
    user_agent TEXT,
    ip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Teacher Requests (si pas déjà créé)
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

-- 3. Class Groups (NOUVEAU)
CREATE TABLE IF NOT EXISTS class_groups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    "teacherId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    "isPrivate" BOOLEAN DEFAULT FALSE,
    "inviteCode" TEXT UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Class Group Members (NOUVEAU)
CREATE TABLE IF NOT EXISTS class_group_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "groupId" TEXT NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'student',
    "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("groupId", "userId")
);

-- 5. Class Messages (NOUVEAU)
CREATE TABLE IF NOT EXISTS class_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "groupId" TEXT NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEX pour optimisation
CREATE INDEX IF NOT EXISTS idx_faq_submissions_status ON faq_submissions(status);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_status ON teacher_requests(status);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_user_id ON teacher_requests("userId");
CREATE INDEX IF NOT EXISTS idx_class_groups_teacher ON class_groups("teacherId");
CREATE INDEX IF NOT EXISTS idx_class_group_members_group ON class_group_members("groupId");
CREATE INDEX IF NOT EXISTS idx_class_group_members_user ON class_group_members("userId");
CREATE INDEX IF NOT EXISTS idx_class_messages_group ON class_messages("groupId");
CREATE INDEX IF NOT EXISTS idx_class_groups_invite ON class_groups("inviteCode");

-- Vérification
SELECT '✅ Migration terminée!' as status;
SELECT 
    'Tables créées:' as info,
    COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('faq_submissions', 'teacher_requests', 'class_groups', 'class_group_members', 'class_messages');
