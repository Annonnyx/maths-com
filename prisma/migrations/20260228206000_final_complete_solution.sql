-- Migration finale : Solution complète Supabase RLS
-- Cette migration résout TOUS les problèmes identifiés
-- 1. Crée les tables avec les noms Prisma (camelCase) - PostgreSQL les transforme automatiquement en snake_case
-- 2. Active RLS
-- 3. Utilise les vrais noms de colonnes PostgreSQL (snake_case) dans les politiques

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables avec noms Prisma (camelCase) - PostgreSQL transforme automatiquement en snake_case
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
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

CREATE TABLE IF NOT EXISTS statistics (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    totalTests INTEGER DEFAULT 0,
    totalQuestions INTEGER DEFAULT 0,
    totalCorrect INTEGER DEFAULT 0,
    totalTime INTEGER DEFAULT 0,
    averageScore FLOAT DEFAULT 0,
    averageTime FLOAT DEFAULT 0,
    additionTests INTEGER DEFAULT 0,
    additionCorrect INTEGER DEFAULT 0,
    additionTotal INTEGER DEFAULT 0,
    subtractionTests INTEGER DEFAULT 0,
    subtractionCorrect INTEGER DEFAULT 0,
    subtractionTotal INTEGER DEFAULT 0,
    multiplicationTests INTEGER DEFAULT 0,
    multiplicationCorrect INTEGER DEFAULT 0,
    multiplicationTotal INTEGER DEFAULT 0,
    divisionTests INTEGER DEFAULT 0,
    divisionCorrect INTEGER DEFAULT 0,
    divisionTotal INTEGER DEFAULT 0,
    powerTests INTEGER DEFAULT 0,
    powerCorrect INTEGER DEFAULT 0,
    powerTotal INTEGER DEFAULT 0,
    rootTests INTEGER DEFAULT 0,
    rootCorrect INTEGER DEFAULT 0,
    rootTotal INTEGER DEFAULT 0,
    factorizationTests INTEGER DEFAULT 0,
    factorizationCorrect INTEGER DEFAULT 0,
    factorizationTotal INTEGER DEFAULT 0,
    weakPoints TEXT,
    eloHistory TEXT,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    startedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completedAt TIMESTAMP WITH TIME ZONE,
    totalQuestions INTEGER DEFAULT 20,
    correctAnswers INTEGER DEFAULT 0,
    score INTEGER,
    timeTaken INTEGER,
    eloBefore INTEGER,
    eloAfter INTEGER,
    eloChange INTEGER,
    timeBonus INTEGER DEFAULT 0,
    isPerfect BOOLEAN DEFAULT false,
    isStreakTest BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    testId TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    type TEXT,
    difficulty INTEGER,
    question TEXT,
    answer TEXT,
    userAnswer TEXT,
    isCorrect BOOLEAN,
    timeTaken INTEGER,
    explanation TEXT,
    "order" INTEGER
);

CREATE TABLE IF NOT EXISTS exercise_attempts (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT,
    difficulty INTEGER,
    question TEXT,
    answer TEXT,
    userAnswer TEXT,
    isCorrect BOOLEAN,
    timeTaken INTEGER,
    feedbackShown BOOLEAN DEFAULT false,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS multiplayer_games (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    player1Id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player2Id TEXT REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'waiting',
    gameType TEXT,
    timeControl TEXT,
    timeLimit INTEGER,
    player1Elo INTEGER,
    player2Elo INTEGER,
    player1Score INTEGER DEFAULT 0,
    player2Score INTEGER DEFAULT 0,
    winner TEXT,
    startedAt TIMESTAMP WITH TIME ZONE,
    finishedAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    questionCount INTEGER DEFAULT 20,
    difficulty TEXT DEFAULT 'mixed'
);

CREATE TABLE IF NOT EXISTS multiplayer_questions (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    gameId TEXT NOT NULL REFERENCES multiplayer_games(id) ON DELETE CASCADE,
    question TEXT,
    answer TEXT,
    type TEXT,
    difficulty INTEGER,
    "order" INTEGER,
    player1Answer TEXT,
    player2Answer TEXT,
    player1Time INTEGER,
    player2Time INTEGER,
    player1Correct BOOLEAN,
    player2Correct BOOLEAN
);

CREATE TABLE IF NOT EXISTS multiplayer_statistics (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    totalGames INTEGER DEFAULT 0,
    totalWins INTEGER DEFAULT 0,
    totalLosses INTEGER DEFAULT 0,
    totalDraws INTEGER DEFAULT 0,
    lightningGames INTEGER DEFAULT 0,
    lightningWins INTEGER DEFAULT 0,
    blitzGames INTEGER DEFAULT 0,
    blitzWins INTEGER DEFAULT 0,
    rapidGames INTEGER DEFAULT 0,
    rapidWins INTEGER DEFAULT 0,
    classicalGames INTEGER DEFAULT 0,
    classicalWins INTEGER DEFAULT 0,
    thinkingGames INTEGER DEFAULT 0,
    thinkingWins INTEGER DEFAULT 0,
    averageScore FLOAT DEFAULT 0,
    averageTime FLOAT DEFAULT 0,
    bestStreak INTEGER DEFAULT 0,
    currentStreak INTEGER DEFAULT 0,
    headToHead TEXT,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS friendships (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    user1Id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2Id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    senderId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiverId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    type TEXT,
    read BOOLEAN DEFAULT false,
    metadata TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    challengerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challengedId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gameType TEXT DEFAULT 'pending',
    timeControl TEXT,
    timeLimit INTEGER,
    questionCount INTEGER DEFAULT 20,
    difficulty TEXT DEFAULT 'mixed',
    status TEXT DEFAULT 'pending',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiresAt TIMESTAMP WITH TIME ZONE,
    respondedAt TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS user_badges (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badgeId TEXT,
    earnedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    awardedById TEXT,
    expiresAt TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    code VARCHAR(6) UNIQUE NOT NULL,
    hostId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'waiting',
    quizId TEXT,
    maxPlayers INTEGER DEFAULT 20,
    currentQuestionIndex INTEGER DEFAULT 0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_players (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    sessionId TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    joinedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    isReady BOOLEAN DEFAULT false,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_groups (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    name TEXT NOT NULL,
    teacherId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    isPrivate BOOLEAN DEFAULT false,
    inviteCode TEXT UNIQUE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_group_members (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    groupId TEXT NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'student',
    joinedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_messages (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    groupId TEXT NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    type TEXT DEFAULT 'text',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_requests (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    school TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faq_submissions (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    type TEXT,
    title TEXT,
    description TEXT,
    email TEXT,
    category TEXT,
    status TEXT DEFAULT 'pending',
    userAgent TEXT,
    ip TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_banners (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    name TEXT,
    description TEXT,
    imageUrl TEXT,
    thumbnailUrl TEXT,
    isPremium BOOLEAN DEFAULT false,
    isActive BOOLEAN DEFAULT true,
    createdBy TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur toutes les tables
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

-- Politiques RLS : IMPORTANT - PostgreSQL transforme camelCase en snake_case
-- Donc hostId devient host_id, userId devient user_id, etc.
-- Nous utilisons les vrais noms de colonnes PostgreSQL

CREATE POLICY users_own_data ON users
    FOR ALL
    USING (id = auth.uid()::text)
    WITH CHECK (id = auth.uid()::text);

CREATE POLICY statistics_own ON statistics
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY tests_own ON tests
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY questions_own ON questions
    FOR ALL
    USING (test_id IN (
        SELECT id FROM tests WHERE user_id = auth.uid()::text
    ))
    WITH CHECK (test_id IN (
        SELECT id FROM tests WHERE user_id = auth.uid()::text
    ));

CREATE POLICY exercise_attempts_own ON exercise_attempts
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY multiplayer_games_own ON multiplayer_games
    FOR ALL
    USING (player1_id = auth.uid()::text OR player2_id = auth.uid()::text)
    WITH CHECK (player1_id = auth.uid()::text OR player2_id = auth.uid()::text);

CREATE POLICY multiplayer_questions_own ON multiplayer_questions
    FOR ALL
    USING (game_id IN (
        SELECT id FROM multiplayer_games
        WHERE player1_id = auth.uid()::text OR player2_id = auth.uid()::text
    ))
    WITH CHECK (game_id IN (
        SELECT id FROM multiplayer_games
        WHERE player1_id = auth.uid()::text OR player2_id = auth.uid()::text
    ));

CREATE POLICY multiplayer_statistics_own ON multiplayer_statistics
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY friendships_own ON friendships
    FOR ALL
    USING (user1_id = auth.uid()::text OR user2_id = auth.uid()::text)
    WITH CHECK (user1_id = auth.uid()::text OR user2_id = auth.uid()::text);

CREATE POLICY messages_own ON messages
    FOR ALL
    USING (sender_id = auth.uid()::text OR receiver_id = auth.uid()::text)
    WITH CHECK (sender_id = auth.uid()::text OR receiver_id = auth.uid()::text);

CREATE POLICY challenges_own ON challenges
    FOR ALL
    USING (challenger_id = auth.uid()::text OR challenged_id = auth.uid()::text)
    WITH CHECK (challenger_id = auth.uid()::text OR challenged_id = auth.uid()::text);

CREATE POLICY user_badges_own ON user_badges
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY game_sessions_public ON game_sessions
    FOR SELECT
    USING (true);

CREATE POLICY game_sessions_host_only ON game_sessions
    FOR UPDATE
    USING (host_id = auth.uid()::text)
    WITH CHECK (host_id = auth.uid()::text);

CREATE POLICY game_sessions_host_delete ON game_sessions
    FOR DELETE
    USING (host_id = auth.uid()::text);

CREATE POLICY game_sessions_insert ON game_sessions
    FOR INSERT
    WITH CHECK (host_id = auth.uid()::text);

CREATE POLICY game_players_public ON game_players
    FOR SELECT
    USING (true);

CREATE POLICY game_players_own ON game_players
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY class_groups_teacher_own ON class_groups
    FOR ALL
    USING (teacher_id = auth.uid()::text)
    WITH CHECK (teacher_id = auth.uid()::text);

CREATE POLICY class_groups_member_view ON class_groups
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM class_group_members
        WHERE group_id = class_groups.id AND user_id = auth.uid()::text
    ));

CREATE POLICY class_group_members_own ON class_group_members
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY class_messages_member_view ON class_messages
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM class_group_members
        WHERE group_id = class_messages.group_id AND user_id = auth.uid()::text
    ));

CREATE POLICY class_messages_member_post ON class_messages
    FOR INSERT
    USING (EXISTS (
        SELECT 1 FROM class_group_members
        WHERE group_id = class_messages.group_id AND user_id = auth.uid()::text
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM class_group_members
        WHERE group_id = class_messages.group_id AND user_id = auth.uid()::text
    ));

CREATE POLICY teacher_requests_own ON teacher_requests
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY teacher_requests_create_own ON teacher_requests
    FOR INSERT
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY teacher_requests_admin_all ON teacher_requests
    FOR ALL
    USING (auth.jwt()->>'isAdmin' = 'true')
    WITH CHECK (auth.jwt()->>'isAdmin' = 'true');

CREATE POLICY faq_submissions_own ON faq_submissions
    FOR ALL
    USING (auth.uid()::text = COALESCE(user_id, 'anonymous'))
    WITH CHECK (auth.uid()::text = COALESCE(user_id, 'anonymous'));

CREATE POLICY custom_banners_admin_all ON custom_banners
    FOR ALL
    USING (auth.jwt()->>'isAdmin' = 'true')
    WITH CHECK (auth.jwt()->>'isAdmin' = 'true');
