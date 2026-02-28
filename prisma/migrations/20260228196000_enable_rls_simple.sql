-- Migration simple pour activer RLS sur les tables existantes
-- Cette migration suppose que les tables existent déjà (créées par Prisma)

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

-- Créer les politiques RLS de base
CREATE POLICY users_own_profile ON users
    FOR SELECT
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY users_update_own_profile ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY statistics_own ON statistics
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

CREATE POLICY tests_own ON tests
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

CREATE POLICY questions_own_tests ON questions
    FOR ALL
    USING (testId IN (
        SELECT id FROM tests WHERE userId = auth.uid()
    ))
    WITH CHECK (testId IN (
        SELECT id FROM tests WHERE userId = auth.uid()
    ));

CREATE POLICY exercise_attempts_own ON exercise_attempts
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

CREATE POLICY multiplayer_games_own ON multiplayer_games
    FOR ALL
    USING (player1Id = auth.uid() OR player2Id = auth.uid())
    WITH CHECK (player1Id = auth.uid() OR player2Id = auth.uid());

CREATE POLICY multiplayer_questions_own_games ON multiplayer_questions
    FOR ALL
    USING (gameId IN (
        SELECT id FROM multiplayer_games 
        WHERE player1Id = auth.uid() OR player2Id = auth.uid()
    ))
    WITH CHECK (gameId IN (
        SELECT id FROM multiplayer_games 
        WHERE player1Id = auth.uid() OR player2Id = auth.uid()
    ));

CREATE POLICY multiplayer_statistics_own ON multiplayer_statistics
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

CREATE POLICY friendships_own ON friendships
    FOR ALL
    USING (user1Id = auth.uid() OR user2Id = auth.uid())
    WITH CHECK (user1Id = auth.uid() OR user2Id = auth.uid());

CREATE POLICY messages_own ON messages
    FOR ALL
    USING (senderId = auth.uid() OR receiverId = auth.uid())
    WITH CHECK (senderId = auth.uid() OR receiverId = auth.uid());

CREATE POLICY challenges_own ON challenges
    FOR ALL
    USING (challengerId = auth.uid() OR challengedId = auth.uid())
    WITH CHECK (challengerId = auth.uid() OR challengedId = auth.uid());

CREATE POLICY user_badges_own ON user_badges
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

CREATE POLICY game_sessions_public ON game_sessions
    FOR SELECT
    USING (true)
    WITH CHECK (true);

CREATE POLICY game_sessions_host_only ON game_sessions
    FOR UPDATE
    USING (hostId = auth.uid())
    WITH CHECK (hostId = auth.uid());

CREATE POLICY game_sessions_host_delete ON game_sessions
    FOR DELETE
    USING (hostId = auth.uid())
    WITH CHECK (hostId = auth.uid());

CREATE POLICY game_players_public ON game_players
    FOR SELECT
    USING (true)
    WITH CHECK (true);

CREATE POLICY game_players_own ON game_players
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

CREATE POLICY class_groups_teacher_own ON class_groups
    FOR ALL
    USING (teacherId = auth.uid())
    WITH CHECK (teacherId = auth.uid());

CREATE POLICY class_groups_member_view ON class_groups
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM class_group_members 
        WHERE groupId = class_groups.id AND userId = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM class_group_members 
        WHERE groupId = class_groups.id AND userId = auth.uid()
    ));

CREATE POLICY class_group_members_own ON class_group_members
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

CREATE POLICY class_messages_member_view ON class_messages
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM class_group_members 
        WHERE groupId = class_messages.groupId AND userId = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM class_group_members 
        WHERE groupId = class_messages.groupId AND userId = auth.uid()
    ));

CREATE POLICY class_messages_member_post ON class_messages
    FOR INSERT
    USING (EXISTS (
        SELECT 1 FROM class_group_members 
        WHERE groupId = class_messages.groupId AND userId = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM class_group_members 
        WHERE groupId = class_messages.groupId AND userId = auth.uid()
    ));

CREATE POLICY teacher_requests_own ON teacher_requests
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

CREATE POLICY teacher_requests_create_own ON teacher_requests
    FOR INSERT
    WITH CHECK (userId = auth.uid());

CREATE POLICY teacher_requests_admin_all ON teacher_requests
    FOR ALL
    USING (auth.jwt()->>'isAdmin' = 'true')
    WITH CHECK (auth.jwt()->>'isAdmin' = 'true');

CREATE POLICY faq_submissions_own ON faq_submissions
    FOR ALL
    USING (auth.uid() = COALESCE(userId, 'anonymous'))
    WITH CHECK (auth.uid() = COALESCE(userId, 'anonymous'));

CREATE POLICY custom_banners_admin_all ON custom_banners
    FOR ALL
    USING (auth.jwt()->>'isAdmin' = 'true')
    WITH CHECK (auth.jwt()->>'isAdmin' = 'true');
