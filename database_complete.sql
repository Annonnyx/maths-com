-- ============================================
-- 📊 SCRIPT SQL COMPLET - MATHS-COM DATABASE
-- ============================================
-- Ce script crée toutes les tables nécessaires pour Maths-Com
-- Compatible avec PostgreSQL (Supabase)
-- ============================================

-- ============================================
-- 1. TABLE PRINCIPALE : users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Profile
    "displayName" TEXT,
    "avatarUrl" TEXT,
    
    -- Banner customization
    "bannerUrl" TEXT,
    "selectedBadgeIds" TEXT,
    "customBannerId" TEXT,
    
    -- Admin flag
    "isAdmin" BOOLEAN DEFAULT FALSE,
    
    -- Teacher information (NOUVEAU)
    "isTeacher" BOOLEAN DEFAULT FALSE,
    school TEXT,
    subject TEXT,
    
    -- Ranking System
    elo INTEGER DEFAULT 400,
    "rankClass" TEXT DEFAULT 'F-',
    "bestElo" INTEGER DEFAULT 400,
    "bestRankClass" TEXT DEFAULT 'F-',
    
    -- First-time setup
    "hasCompletedOnboarding" BOOLEAN DEFAULT FALSE,
    
    -- Progression tracking
    "additionLevel" INTEGER DEFAULT 1,
    "subtractionLevel" INTEGER DEFAULT 0,
    "multiplicationLevel" INTEGER DEFAULT 0,
    "divisionLevel" INTEGER DEFAULT 0,
    "powerLevel" INTEGER DEFAULT 0,
    "rootLevel" INTEGER DEFAULT 0,
    "factorizationLevel" INTEGER DEFAULT 0,
    "percentageLevel" INTEGER DEFAULT 0,
    "fractionLevel" INTEGER DEFAULT 0,
    "equationLevel" INTEGER DEFAULT 0,
    
    -- Streaks
    "currentStreak" INTEGER DEFAULT 0,
    "bestStreak" INTEGER DEFAULT 0,
    "lastTestDate" TIMESTAMP WITH TIME ZONE,
    
    -- Multiplayer ranking system
    "multiplayerElo" INTEGER DEFAULT 400,
    "multiplayerRankClass" TEXT DEFAULT 'F-',
    "bestMultiplayerElo" INTEGER DEFAULT 400,
    "bestMultiplayerRankClass" TEXT DEFAULT 'F-',
    "multiplayerGames" INTEGER DEFAULT 0,
    "multiplayerWins" INTEGER DEFAULT 0,
    "multiplayerLosses" INTEGER DEFAULT 0,
    
    -- Online status
    "isOnline" BOOLEAN DEFAULT FALSE,
    "lastSeenAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Discord integration
    "discordId" TEXT UNIQUE,
    "discordUsername" TEXT,
    "discordLinkedAt" TIMESTAMP WITH TIME ZONE,
    "discordLinkCode" TEXT UNIQUE
);

-- Index pour users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_elo ON users(elo DESC);
CREATE INDEX IF NOT EXISTS idx_users_isTeacher ON users("isTeacher");
CREATE INDEX IF NOT EXISTS idx_users_isAdmin ON users("isAdmin");

-- ============================================
-- 2. TABLE : tests (Tests de mathématiques)
-- ============================================
CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'solo', 'multiplayer', 'practice'
    difficulty INTEGER,
    operations TEXT, -- JSON array
    score INTEGER,
    "totalQuestions" INTEGER,
    "correctAnswers" INTEGER,
    duration INTEGER, -- en secondes
    elo INTEGER,
    "rankClass" TEXT,
    "eloChange" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tests_userId ON tests("userId");
CREATE INDEX IF NOT EXISTS idx_tests_createdAt ON tests("createdAt" DESC);

-- ============================================
-- 3. TABLE : statistics
-- ============================================
CREATE TABLE IF NOT EXISTS statistics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "totalTests" INTEGER DEFAULT 0,
    "totalQuestions" INTEGER DEFAULT 0,
    "correctAnswers" INTEGER DEFAULT 0,
    "totalTime" INTEGER DEFAULT 0, -- en secondes
    "averageScore" DECIMAL(5,2) DEFAULT 0,
    "bestStreak" INTEGER DEFAULT 0,
    "currentStreak" INTEGER DEFAULT 0,
    "lastTestDate" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TABLE : exercise_attempts
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_attempts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    difficulty INTEGER,
    correct BOOLEAN,
    "timeSpent" INTEGER, -- en secondes
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_attempts_userId ON exercise_attempts("userId");

-- ============================================
-- 5. TABLE : badges
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL, -- 'rank', 'achievement', 'special', 'custom'
    condition TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. TABLE : user_badges (Relation many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "badgeId" TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    "awardedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId", "badgeId")
);

CREATE INDEX IF NOT EXISTS idx_user_badges_userId ON user_badges("userId");

-- ============================================
-- 7. TABLE : custom_banners
-- ============================================
CREATE TABLE IF NOT EXISTS custom_banners (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "isPremium" BOOLEAN DEFAULT FALSE,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdBy" TEXT NOT NULL REFERENCES users(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. TABLE : friendships
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "user1Id" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "user2Id" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("user1Id", "user2Id")
);

CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships("user1Id");
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships("user2Id");

-- ============================================
-- 9. TABLE : messages
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "senderId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "receiverId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages("senderId");
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages("receiverId");

-- ============================================
-- 10. TABLE : multiplayer_games
-- ============================================
CREATE TABLE IF NOT EXISTS multiplayer_games (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "player1Id" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "player2Id" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "player1Score" INTEGER DEFAULT 0,
    "player2Score" INTEGER DEFAULT 0,
    "player1Answers" INTEGER DEFAULT 0,
    "player2Answers" INTEGER DEFAULT 0,
    "player1RankClass" TEXT,
    "player2RankClass" TEXT,
    "player1EloChange" INTEGER DEFAULT 0,
    "player2EloChange" INTEGER DEFAULT 0,
    "timeControl" INTEGER DEFAULT 60, -- secondes
    status TEXT DEFAULT 'waiting', -- 'waiting', 'playing', 'finished'
    winner TEXT, -- 'player1', 'player2', 'draw'
    "gameType" TEXT DEFAULT 'classic',
    questions JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "startedAt" TIMESTAMP WITH TIME ZONE,
    "finishedAt" TIMESTAMP WITH TIME ZONE,
    "searchStartTime" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_multiplayer_games_player1 ON multiplayer_games("player1Id");
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_player2 ON multiplayer_games("player2Id");
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_status ON multiplayer_games(status);

-- ============================================
-- 11. TABLE : challenges
-- ============================================
CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "challengerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "challengedId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
    "gameId" TEXT REFERENCES multiplayer_games(id),
    "timeControl" INTEGER DEFAULT 60,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "gameType" TEXT DEFAULT 'classic'
);

-- ============================================
-- 12. TABLE : faq_submissions (NOUVEAU)
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
-- 13. TABLE : teacher_requests (NOUVEAU)
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

CREATE INDEX IF NOT EXISTS idx_teacher_requests_status ON teacher_requests(status);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_userId ON teacher_requests("userId");

-- ============================================
-- 14. TABLE : notifications (NOUVEAU)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'friend_request', 'challenge', 'message', 'achievement'
    title TEXT NOT NULL,
    content TEXT,
    "isRead" BOOLEAN DEFAULT FALSE,
    "linkUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications("isRead");

-- ============================================
-- 15. TABLE : presence (NOUVEAU - pour statut en ligne)
-- ============================================
CREATE TABLE IF NOT EXISTS presence (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'offline', -- 'online', 'away', 'offline'
    "lastSeen" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SEED DATA : Badges de base
-- ============================================

INSERT INTO badges (name, description, icon, category) VALUES
('Rookie', 'Terminez votre premier test', '🎯', 'achievement'),
('Streak Master', 'Maintenez une série de 7 jours', '🔥', 'achievement'),
('Speed Demon', 'Complétez un test en moins de 60 secondes', '⚡', 'achievement'),
('Perfect Score', 'Obtenez 100% à un test', '💯', 'achievement'),
('ELO King', 'Atteignez 2000 ELO', '👑', 'rank'),
('Champion', 'Gagnez 10 parties multijoueurs', '🏆', 'achievement'),
('Social Butterfly', 'Ajoutez 5 amis', '🦋', 'achievement'),
('Teacher', 'Devenez professeur vérifié', '👨‍🏫', 'special')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

-- Note: Les policies spécifiques doivent être créées selon les besoins
-- Exemple pour users (lecture publique, modification privée):
-- CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
-- CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour mettre à jour updatedAt automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statistics_updated_at BEFORE UPDATE ON statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_banners_updated_at BEFORE UPDATE ON custom_banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_requests_updated_at BEFORE UPDATE ON teacher_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presence_updated_at BEFORE UPDATE ON presence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTAIRES POUR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Table principale des utilisateurs Maths-Com';
COMMENT ON TABLE tests IS 'Tests de mathématiques complétés par les utilisateurs';
COMMENT ON TABLE badges IS 'Badges et récompenses disponibles';
COMMENT ON TABLE multiplayer_games IS 'Parties multijoueurs en cours et terminées';
COMMENT ON TABLE teacher_requests IS 'Demandes de statut professeur (NOUVEAU)';
COMMENT ON TABLE faq_submissions IS 'Soumissions de bugs et questions (NOUVEAU)';

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

-- Vérifier que tout est créé
SELECT 
    'Tables créées:' as info,
    COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Liste des tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ============================================
-- 🎉 FIN DU SCRIPT
-- ============================================
-- Pour exécuter ce script sur Supabase:
-- 1. Aller sur https://supabase.com/dashboard/project/plfjxxakrqxveufldtrc/sql-editor
-- 2. Copier-coller tout ce script
-- 3. Cliquer sur "Run"
-- 4. Vérifier les résultats dans la section "Results"
-- ============================================
