-- Migration ultra-simple : Activer RLS avec politiques basiques
-- Cette migration suppose que les tables existent déjà (créées par Prisma)
-- Utilise des politiques RLS simples qui fonctionnent avec n'importe quelle structure

-- Activer RLS sur toutes les tables existantes
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

-- Créer les politiques RLS les plus simples possibles
-- Utiliser des politiques qui ne dépendent pas des noms de colonnes exacts

-- Pour la table users
CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY users_update_own ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY users_insert_own ON users
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- Pour toutes les autres tables, utiliser des politiques basées sur l'ID d'enregistrement
-- Ces politiques supposent que chaque enregistrement a un ID qui correspond à l'utilisateur

CREATE POLICY statistics_own ON statistics
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY tests_own ON tests
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY questions_own ON questions
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY exercise_attempts_own ON exercise_attempts
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY multiplayer_games_own ON multiplayer_games
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY multiplayer_questions_own ON multiplayer_questions
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY multiplayer_statistics_own ON multiplayer_statistics
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY friendships_own ON friendships
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY messages_own ON messages
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY challenges_own ON challenges
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY user_badges_own ON user_badges
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Pour les tables de jeu, permettre l'accès public en lecture
CREATE POLICY game_sessions_public ON game_sessions
    FOR SELECT
    USING (true);

CREATE POLICY game_sessions_own ON game_sessions
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY game_players_public ON game_players
    FOR SELECT
    USING (true);

CREATE POLICY game_players_own ON game_players
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY class_groups_own ON class_groups
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY class_group_members_own ON class_group_members
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY class_messages_own ON class_messages
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY teacher_requests_own ON teacher_requests
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY faq_submissions_own ON faq_submissions
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY custom_banners_admin_all ON custom_banners
    FOR ALL
    USING (auth.jwt()->>'isAdmin' = 'true')
    WITH CHECK (auth.jwt()->>'isAdmin' = 'true');
