-- Migration pour ajouter des politiques RLS de base sur les tables publiques
-- Ces politiques assurent que les utilisateurs ne peuvent accéder qu'à leurs propres données

-- Activer RLS sur la table users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "users_own_profile" ON users
    FOR SELECT
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "users_update_own_profile" ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Politique : Les utilisateurs peuvent insérer (créer) leur propre compte (déjà géré par auth)
CREATE POLICY "users_insert_own" ON users
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- Activer RLS sur la table statistics
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres statistiques
CREATE POLICY "statistics_own" ON statistics
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

-- Activer RLS sur la table tests
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres tests
CREATE POLICY "tests_own" ON tests
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

-- Activer RLS sur la table questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les questions de leurs propres tests
CREATE POLICY "questions_own_tests" ON questions
    FOR ALL
    USING (testId IN (
        SELECT id FROM tests WHERE userId = auth.uid()
    ))
    WITH CHECK (testId IN (
        SELECT id FROM tests WHERE userId = auth.uid()
    ));

-- Activer RLS sur la table exercise_attempts
ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres tentatives d'exercices
CREATE POLICY "exercise_attempts_own" ON exercise_attempts
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

-- Activer RLS sur la table multiplayer_games
ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;

-- Politique : Les joueurs peuvent voir leurs propres parties multijoueurs
CREATE POLICY "multiplayer_games_own" ON multiplayer_games
    FOR ALL
    USING (player1Id = auth.uid() OR player2Id = auth.uid())
    WITH CHECK (player1Id = auth.uid() OR player2Id = auth.uid());

-- Activer RLS sur la table multiplayer_questions
ALTER TABLE multiplayer_questions ENABLE ROW LEVEL SECURITY;

-- Politique : Les joueurs peuvent voir les questions de leurs propres parties
CREATE POLICY "multiplayer_questions_own_games" ON multiplayer_questions
    FOR ALL
    USING (gameId IN (
        SELECT id FROM multiplayer_games 
        WHERE player1Id = auth.uid() OR player2Id = auth.uid()
    ))
    WITH CHECK (gameId IN (
        SELECT id FROM multiplayer_games 
        WHERE player1Id = auth.uid() OR player2Id = auth.uid()
    ));

-- Activer RLS sur la table multiplayer_statistics
ALTER TABLE multiplayer_statistics ENABLE ROW LEVEL SECURITY;

-- Politique : Les joueurs peuvent voir leurs propres statistiques multijoueurs
CREATE POLICY "multiplayer_statistics_own" ON multiplayer_statistics
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

-- Activer RLS sur la table friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres amitiés
CREATE POLICY "friendships_own" ON friendships
    FOR ALL
    USING (user1Id = auth.uid() OR user2Id = auth.uid())
    WITH CHECK (user1Id = auth.uid() OR user2Id = auth.uid());

-- Activer RLS sur la table messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres messages
CREATE POLICY "messages_own" ON messages
    FOR ALL
    USING (senderId = auth.uid() OR receiverId = auth.uid())
    WITH CHECK (senderId = auth.uid() OR receiverId = auth.uid());

-- Activer RLS sur la table challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres défis
CREATE POLICY "challenges_own" ON challenges
    FOR ALL
    USING (challengerId = auth.uid() OR challengedId = auth.uid())
    WITH CHECK (challengerId = auth.uid() OR challengedId = auth.uid());

-- Activer RLS sur la table user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres badges
CREATE POLICY "user_badges_own" ON user_badges
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

-- Activer RLS sur la table game_sessions (Kahoot)
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les sessions de jeu
CREATE POLICY "game_sessions_public" ON game_sessions
    FOR SELECT
    USING (true)  -- Les sessions sont publiques pour rejoindre
    WITH CHECK (true);

-- Politique : Seul l'hôte peut modifier sa session
CREATE POLICY "game_sessions_host_only" ON game_sessions
    FOR UPDATE
    USING (hostId = auth.uid())
    WITH CHECK (hostId = auth.uid());

-- Politique : Seul l'hôte peut supprimer sa session
CREATE POLICY "game_sessions_host_delete" ON game_sessions
    FOR DELETE
    USING (hostId = auth.uid())
    WITH CHECK (hostId = auth.uid());

-- Activer RLS sur la table game_players (Kahoot)
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- Politique : Les joueurs peuvent voir les participants des sessions
CREATE POLICY "game_players_public" ON game_players
    FOR SELECT
    USING (true)  -- Les participants sont visibles publiquement dans une session
    WITH CHECK (true);

-- Politique : Les joueurs peuvent voir leurs propres participations
CREATE POLICY "game_players_own" ON game_players
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

-- Activer RLS sur la table class_groups
ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;

-- Politique : Les professeurs peuvent voir leurs propres classes
CREATE POLICY "class_groups_teacher_own" ON class_groups
    FOR ALL
    USING (teacherId = auth.uid())
    WITH CHECK (teacherId = auth.uid());

-- Politique : Les membres peuvent voir les classes où ils sont membres
CREATE POLICY "class_groups_member_view" ON class_groups
    FOR SELECT
    USING (id IN (
        SELECT groupId FROM class_group_members 
        WHERE userId = auth.uid()
    ))
    WITH CHECK (id IN (
        SELECT groupId FROM class_group_members 
        WHERE userId = auth.uid()
    ));

-- Activer RLS sur la table class_group_members
ALTER TABLE class_group_members ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres participations aux classes
CREATE POLICY "class_group_members_own" ON class_group_members
    FOR ALL
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

-- Activer RLS sur la table class_messages
ALTER TABLE class_messages ENABLE ROW LEVEL SECURITY;

-- Politique : Les membres peuvent voir les messages de leurs classes
CREATE POLICY "class_messages_member_view" ON class_messages
    FOR SELECT
    USING (groupId IN (
        SELECT groupId FROM class_group_members 
        WHERE userId = auth.uid()
    ))
    WITH CHECK (groupId IN (
        SELECT groupId FROM class_group_members 
        WHERE userId = auth.uid()
    ));

-- Politique : Les membres peuvent envoyer des messages dans leurs classes
CREATE POLICY "class_messages_member_post" ON class_messages
    FOR INSERT
    WITH CHECK (groupId IN (
        SELECT groupId FROM class_group_members 
        WHERE userId = auth.uid()
    ));

-- Activer RLS sur la table teacher_requests
ALTER TABLE teacher_requests ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres demandes professeur
CREATE POLICY "teacher_requests_own" ON teacher_requests
    FOR SELECT
    USING (userId = auth.uid())
    WITH CHECK (userId = auth.uid());

-- Politique : Les utilisateurs peuvent créer leurs propres demandes
CREATE POLICY "teacher_requests_create_own" ON teacher_requests
    FOR INSERT
    WITH CHECK (userId = auth.uid());

-- Politique : Les admins peuvent voir toutes les demandes
CREATE POLICY "teacher_requests_admin_all" ON teacher_requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND isAdmin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND isAdmin = true
        )
    );

-- Activer RLS sur la table faq_submissions
ALTER TABLE faq_submissions ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres soumissions FAQ
CREATE POLICY "faq_submissions_own" ON faq_submissions
    FOR ALL
    USING (true)  -- Les soumissions sont généralement anonymes mais on garde la trace
    WITH CHECK (true);

-- Activer RLS sur la table custom_banners
ALTER TABLE custom_banners ENABLE ROW LEVEL SECURITY;

-- Politique : Les admins peuvent gérer les bannières personnalisées
CREATE POLICY "custom_banners_admin_all" ON custom_banners
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND isAdmin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND isAdmin = true
        )
    );

-- Commentaires sur les politiques
COMMENT ON POLICY users_own_profile ON users IS 'Permet aux utilisateurs de voir uniquement leurs propres profils';
COMMENT ON POLICY users_update_own_profile ON users IS 'Permet aux utilisateurs de modifier uniquement leurs propres profils';
COMMENT ON POLICY statistics_own ON statistics IS 'Permet aux utilisateurs de voir uniquement leurs propres statistiques';
COMMENT ON POLICY tests_own ON tests IS 'Permet aux utilisateurs de voir uniquement leurs propres tests';
COMMENT ON POLICY questions_own_tests ON questions IS 'Permet aux utilisateurs de voir uniquement les questions de leurs propres tests';
COMMENT ON POLICY exercise_attempts_own ON exercise_attempts IS 'Permet aux utilisateurs de voir uniquement leurs propres tentatives d''exercices';
COMMENT ON POLICY multiplayer_games_own ON multiplayer_games IS 'Permet aux joueurs de voir uniquement leurs propres parties multijoueurs';
COMMENT ON POLICY multiplayer_questions_own_games ON multiplayer_questions IS 'Permet aux joueurs de voir uniquement les questions de leurs propres parties';
COMMENT ON POLICY multiplayer_statistics_own ON multiplayer_statistics IS 'Permet aux joueurs de voir uniquement leurs propres statistiques multijoueurs';
COMMENT ON POLICY friendships_own ON friendships IS 'Permet aux utilisateurs de voir uniquement leurs propres amities';
COMMENT ON POLICY messages_own ON messages IS 'Permet aux utilisateurs de voir uniquement leurs propres messages';
COMMENT ON POLICY challenges_own ON challenges IS 'Permet aux utilisateurs de voir uniquement leurs propres defis';
COMMENT ON POLICY user_badges_own ON user_badges IS 'Permet aux utilisateurs de voir uniquement leurs propres badges';
COMMENT ON POLICY game_sessions_public ON game_sessions IS 'Permet a tous de voir les sessions de jeu (pour rejoindre)';
COMMENT ON POLICY game_sessions_host_only ON game_sessions IS 'Permet uniquement a l''hote de modifier sa session';
COMMENT ON POLICY game_sessions_host_delete ON game_sessions IS 'Permet uniquement a l''hote de supprimer sa session';
COMMENT ON POLICY game_players_public ON game_players IS 'Permet a tous de voir les participants aux sessions de jeu';
COMMENT ON POLICY game_players_own ON game_players IS 'Permet aux joueurs de voir uniquement leurs propres participations';
COMMENT ON POLICY class_groups_teacher_own ON class_groups IS 'Permet aux professeurs de gerer uniquement leurs propres classes';
COMMENT ON POLICY class_groups_member_view ON class_groups IS 'Permet aux membres de voir uniquement les classes ou ils sont inscrits';
COMMENT ON POLICY class_group_members_own ON class_group_members IS 'Permet aux membres de gerer uniquement leurs propres participations';
COMMENT ON POLICY class_messages_member_view ON class_messages IS 'Permet aux membres de voir uniquement les messages de leurs classes';
COMMENT ON POLICY class_messages_member_post ON class_messages IS 'Permet aux membres d''envoyer des messages uniquement dans leurs classes';
COMMENT ON POLICY teacher_requests_own ON teacher_requests IS 'Permet aux utilisateurs de voir uniquement leurs propres demandes professeur';
COMMENT ON POLICY teacher_requests_create_own ON teacher_requests IS 'Permet aux utilisateurs de creer uniquement leurs propres demandes professeur';
COMMENT ON POLICY teacher_requests_admin_all ON teacher_requests IS 'Permet aux admins de gerer toutes les demandes professeur';
COMMENT ON POLICY faq_submissions_own ON faq_submissions IS 'Permet aux utilisateurs de voir uniquement leurs propres soumissions FAQ';
COMMENT ON POLICY custom_banners_admin_all ON custom_banners IS 'Permet aux admins de gerer toutes les bannieres personnelles';
