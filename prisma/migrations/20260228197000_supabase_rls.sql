-- Migration Supabase pour activer RLS
-- Cette migration gère le cas où les tables n'existent pas encore
-- Utilise la syntaxe PostgreSQL compatible Supabase

-- D'abord, s'assurer que les tables existent (création silencieuse si nécessaire)
DO $$
BEGIN
    -- Créer la table users si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT,
            displayName TEXT,
            avatar TEXT,
            role TEXT DEFAULT 'user',
            isAdmin BOOLEAN DEFAULT false,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table statistics si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'statistics' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS statistics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            totalGames INTEGER DEFAULT 0,
            totalWins INTEGER DEFAULT 0,
            totalLosses INTEGER DEFAULT 0,
            totalScore BIGINT DEFAULT 0,
            averageScore DECIMAL(10,2) DEFAULT 0.00,
            bestScore INTEGER DEFAULT 0,
            currentStreak INTEGER DEFAULT 0,
            bestStreak INTEGER DEFAULT 0,
            totalTime INTEGER DEFAULT 0,
            averageTime DECIMAL(10,2) DEFAULT 0.00,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table tests si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tests' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS tests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            difficulty INTEGER DEFAULT 1,
            category TEXT DEFAULT 'general',
            questions TEXT[] DEFAULT '{}',
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table questions si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS questions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            testid UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
            question TEXT NOT NULL,
            options TEXT[] NOT NULL DEFAULT '{}',
            correctAnswer INTEGER NOT NULL,
            explanation TEXT,
            difficulty INTEGER DEFAULT 1,
            category TEXT DEFAULT 'general',
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table exercise_attempts si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_attempts' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS exercise_attempts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            operation TEXT NOT NULL,
            difficulty INTEGER DEFAULT 1,
            question TEXT NOT NULL,
            userAnswer TEXT,
            correctAnswer TEXT NOT NULL,
            isCorrect BOOLEAN DEFAULT false,
            timeTaken INTEGER DEFAULT 0,
            points INTEGER DEFAULT 0,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table multiplayer_games si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'multiplayer_games' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS multiplayer_games (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            player1id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            player2id UUID REFERENCES users(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'waiting',
            currentQuestionIndex INTEGER DEFAULT 0,
            player1Score INTEGER DEFAULT 0,
            player2Score INTEGER DEFAULT 0,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table multiplayer_questions si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'multiplayer_questions' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS multiplayer_questions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            gameid UUID NOT NULL REFERENCES multiplayer_games(id) ON DELETE CASCADE,
            question TEXT NOT NULL,
            options TEXT[] NOT NULL DEFAULT '{}',
            correctAnswer INTEGER NOT NULL,
            explanation TEXT,
            difficulty INTEGER DEFAULT 1,
            category TEXT DEFAULT 'general',
            player1Answer INTEGER,
            player2Answer INTEGER,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table multiplayer_statistics si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'multiplayer_statistics' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS multiplayer_statistics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            totalGames INTEGER DEFAULT 0,
            totalWins INTEGER DEFAULT 0,
            totalLosses INTEGER DEFAULT 0,
            totalScore BIGINT DEFAULT 0,
            averageScore DECIMAL(10,2) DEFAULT 0.00,
            bestScore INTEGER DEFAULT 0,
            currentStreak INTEGER DEFAULT 0,
            bestStreak INTEGER DEFAULT 0,
            totalTime INTEGER DEFAULT 0,
            averageTime DECIMAL(10,2) DEFAULT 0.00,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table friendships si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friendships' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS friendships (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user1id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            user2id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'pending',
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table messages si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            senderid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            receiverid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            isRead BOOLEAN DEFAULT false,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table challenges si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenges' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS challenges (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            challengerid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            challengedid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'pending',
            challengerScore INTEGER DEFAULT 0,
            challengedScore INTEGER DEFAULT 0,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table user_badges si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS user_badges (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            badgeId TEXT NOT NULL,
            earnedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table game_sessions si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_sessions' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS game_sessions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code VARCHAR(6) UNIQUE NOT NULL,
            hostid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'waiting',
            quizid UUID,
            maxPlayers INTEGER DEFAULT 20,
            currentQuestionIndex INTEGER DEFAULT 0,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table game_players si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_players' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS game_players (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sessionid UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
            userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            score INTEGER DEFAULT 0,
            joinedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table class_groups si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'class_groups' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS class_groups (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            teacherid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table class_group_members si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'class_group_members' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS class_group_members (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            groupid UUID NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
            userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role TEXT DEFAULT 'student',
            joinedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table class_messages si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'class_messages' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS class_messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            groupid UUID NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
            senderid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table teacher_requests si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_requests' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS teacher_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'pending',
            motivation TEXT,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table faq_submissions si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faq_submissions' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS faq_submissions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            userid UUID REFERENCES users(id) ON DELETE CASCADE,
            question TEXT NOT NULL,
            email TEXT,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Créer la table custom_banners si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'custom_banners' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS custom_banners (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            imageUrl TEXT,
            linkUrl TEXT,
            isActive BOOLEAN DEFAULT true,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

END $$;

-- Maintenant activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_banners ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY users_own_profile ON users
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY users_update_own_profile ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY users_insert_own ON users
    FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY statistics_own ON statistics
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY tests_own ON tests
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY questions_own_tests ON questions
    FOR ALL
    USING (test_id IN (
        SELECT id FROM tests WHERE user_id = auth.uid()
    ))
    WITH CHECK (test_id IN (
        SELECT id FROM tests WHERE user_id = auth.uid()
    ));

CREATE POLICY exercise_attempts_own ON exercise_attempts
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY multiplayer_games_own ON multiplayer_games
    FOR ALL
    USING (player1_id = auth.uid() OR player2_id = auth.uid())
    WITH CHECK (player1_id = auth.uid() OR player2_id = auth.uid());

CREATE POLICY multiplayer_questions_own_games ON multiplayer_questions
    FOR ALL
    USING (game_id IN (
        SELECT id FROM multiplayer_games 
        WHERE player1_id = auth.uid() OR player2_id = auth.uid()
    ))
    WITH CHECK (game_id IN (
        SELECT id FROM multiplayer_games 
        WHERE player1_id = auth.uid() OR player2_id = auth.uid()
    ));

CREATE POLICY multiplayer_statistics_own ON multiplayer_statistics
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY friendships_own ON friendships
    FOR ALL
    USING (user1_id = auth.uid() OR user2_id = auth.uid())
    WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY messages_own ON messages
    FOR ALL
    USING (sender_id = auth.uid() OR receiver_id = auth.uid())
    WITH CHECK (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY challenges_own ON challenges
    FOR ALL
    USING (challenger_id = auth.uid() OR challenged_id = auth.uid())
    WITH CHECK (challenger_id = auth.uid() OR challenged_id = auth.uid());

CREATE POLICY user_badges_own ON user_badges
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY game_sessions_public ON game_sessions
    FOR SELECT
    USING (true);

CREATE POLICY game_sessions_host_only ON game_sessions
    FOR UPDATE
    USING (host_id = auth.uid())
    WITH CHECK (host_id = auth.uid());

CREATE POLICY game_sessions_host_delete ON game_sessions
    FOR DELETE
    USING (host_id = auth.uid());

CREATE POLICY game_sessions_insert ON game_sessions
    FOR INSERT
    WITH CHECK (host_id = auth.uid());

CREATE POLICY game_players_public ON game_players
    FOR SELECT
    USING (true);

CREATE POLICY game_players_own ON game_players
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY class_groups_teacher_own ON class_groups
    FOR ALL
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY class_groups_member_view ON class_groups
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM class_group_members 
        WHERE group_id = class_groups.id AND user_id = auth.uid()
    ));

CREATE POLICY class_group_members_own ON class_group_members
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY class_messages_member_view ON class_messages
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM class_group_members 
        WHERE group_id = class_messages.group_id AND user_id = auth.uid()
    ));

CREATE POLICY class_messages_member_post ON class_messages
    FOR INSERT
    USING (EXISTS (
        SELECT 1 FROM class_group_members 
        WHERE group_id = class_messages.group_id AND user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM class_group_members 
        WHERE group_id = class_messages.group_id AND user_id = auth.uid()
    ));

CREATE POLICY teacher_requests_own ON teacher_requests
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY teacher_requests_create_own ON teacher_requests
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY teacher_requests_admin_all ON teacher_requests
    FOR ALL
    USING (auth.jwt()->>'isAdmin' = 'true')
    WITH CHECK (auth.jwt()->>'isAdmin' = 'true');

CREATE POLICY faq_submissions_own ON faq_submissions
    FOR ALL
    USING (auth.uid() = COALESCE(user_id, 'anonymous'))
    WITH CHECK (auth.uid() = COALESCE(user_id, 'anonymous'));

CREATE POLICY custom_banners_admin_all ON custom_banners
    FOR ALL
    USING (auth.jwt()->>'isAdmin' = 'true')
    WITH CHECK (auth.jwt()->>'isAdmin' = 'true');
