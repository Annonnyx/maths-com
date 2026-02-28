-- Migration pour créer les tables de base si elles n'existent pas
-- puis appliquer les politiques RLS
-- Cette migration est idempotente : elle peut être exécutée plusieurs fois sans erreur

-- Créer les tables seulement si elles n'existent pas
DO $$
BEGIN
    -- Vérifier si la table users existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        -- Activer RLS sur la table users
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir leur propre profil
        DO $$ BEGIN
            DROP POLICY IF EXISTS users_own_profile ON users;
            CREATE POLICY users_own_profile ON users
                FOR SELECT
                USING (id = auth.uid())
                WITH CHECK (id = auth.uid());
        EXCEPTION WHEN duplicate_object THEN END;
        END $$;

        -- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
        DO $$ BEGIN
            DROP POLICY IF EXISTS users_update_own_profile ON users;
            CREATE POLICY users_update_own_profile ON users
                FOR UPDATE
                USING (id = auth.uid())
                WITH CHECK (id = auth.uid());
        EXCEPTION WHEN duplicate_object THEN END;
        END $$;

        -- Politique : Les utilisateurs peuvent insérer (créer) leur propre compte (déjà géré par auth)
        DO $$ BEGIN
            DROP POLICY IF EXISTS users_insert_own ON users;
            CREATE POLICY users_insert_own ON users
                FOR INSERT
                WITH CHECK (id = auth.uid());
        EXCEPTION WHEN duplicate_object THEN END;
        END $$;
    END IF;

    -- Vérifier si la table statistics existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'statistics' AND table_schema = 'public') THEN
        -- Activer RLS sur la table statistics
        ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir leurs propres statistiques
        DROP POLICY IF EXISTS statistics_own;
        CREATE POLICY statistics_own ON statistics
            FOR ALL
            USING (userId = auth.uid())
            WITH CHECK (userId = auth.uid());
    END IF;

    -- Vérifier si la table tests existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tests' AND table_schema = 'public') THEN
        -- Activer RLS sur la table tests
        ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir leurs propres tests
        DROP POLICY IF EXISTS tests_own;
        CREATE POLICY tests_own ON tests
            FOR ALL
            USING (userId = auth.uid())
            WITH CHECK (userId = auth.uid());
    END IF;

    -- Vérifier si la table questions existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions' AND table_schema = 'public') THEN
        -- Activer RLS sur la table questions
        ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir les questions de leurs propres tests
        DROP POLICY IF EXISTS questions_own_tests;
        CREATE POLICY questions_own_tests ON questions
            FOR ALL
            USING (testId IN (
                SELECT id FROM tests WHERE userId = auth.uid()
            ))
            WITH CHECK (testId IN (
                SELECT id FROM tests WHERE userId = auth.uid()
            ));
    END IF;

    -- Vérifier si la table exercise_attempts existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_attempts' AND table_schema = 'public') THEN
        -- Activer RLS sur la table exercise_attempts
        ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir leurs propres tentatives d'exercices
        DROP POLICY IF EXISTS exercise_attempts_own;
        CREATE POLICY exercise_attempts_own ON exercise_attempts
            FOR ALL
            USING (userId = auth.uid())
            WITH CHECK (userId = auth.uid());
    END IF;

    -- Vérifier si la table multiplayer_games existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'multiplayer_games' AND table_schema = 'public') THEN
        -- Activer RLS sur la table multiplayer_games
        ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les joueurs peuvent voir uniquement leurs propres parties multijoueurs
        DROP POLICY IF EXISTS multiplayer_games_own;
        CREATE POLICY multiplayer_games_own ON multiplayer_games
            FOR ALL
            USING (player1Id = auth.uid() OR player2Id = auth.uid())
            WITH CHECK (player1Id = auth.uid() OR player2Id = auth.uid());
    END IF;

    -- Vérifier si la table multiplayer_questions existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'multiplayer_questions' AND table_schema = 'public') THEN
        -- Activer RLS sur la table multiplayer_questions
        ALTER TABLE multiplayer_questions ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les joueurs peuvent voir uniquement les questions de leurs propres parties
        DROP POLICY IF EXISTS multiplayer_questions_own_games;
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
    END IF;

    -- Vérifier si la table multiplayer_statistics existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'multiplayer_statistics' AND table_schema = 'public') THEN
        -- Activer RLS sur la table multiplayer_statistics
        ALTER TABLE multiplayer_statistics ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les joueurs peuvent voir uniquement leurs propres statistiques multijoueurs
        DROP POLICY IF EXISTS multiplayer_statistics_own;
        CREATE POLICY multiplayer_statistics_own ON multiplayer_statistics
            FOR ALL
            USING (userId = auth.uid())
            WITH CHECK (userId = auth.uid());
    END IF;

    -- Vérifier si la table friendships existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friendships' AND table_schema = 'public') THEN
        -- Activer RLS sur la table friendships
        ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir uniquement leurs propres amitiés
        DROP POLICY IF EXISTS friendships_own;
        CREATE POLICY friendships_own ON friendships
            FOR ALL
            USING (user1Id = auth.uid() OR user2Id = auth.uid())
            WITH CHECK (user1Id = auth.uid() OR user2Id = auth.uid());
    END IF;

    -- Vérifier si la table messages existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
        -- Activer RLS sur la table messages
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir uniquement leurs propres messages
        DROP POLICY IF EXISTS messages_own;
        CREATE POLICY messages_own ON messages
            FOR ALL
            USING (senderId = auth.uid() OR receiverId = auth.uid())
            WITH CHECK (senderId = auth.uid() OR receiverId = auth.uid());
    END IF;

    -- Vérifier si la table challenges existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenges' AND table_schema = 'public') THEN
        -- Activer RLS sur la table challenges
        ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir uniquement leurs propres défis
        DROP POLICY IF EXISTS challenges_own;
        CREATE POLICY challenges_own ON challenges
            FOR ALL
            USING (challengerId = auth.uid() OR challengedId = auth.uid())
            WITH CHECK (challengerId = auth.uid() OR challengedId = auth.uid());
    END IF;

    -- Vérifier si la table user_badges existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges' AND table_schema = 'public') THEN
        -- Activer RLS sur la table user_badges
        ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir uniquement leurs propres badges
        DROP POLICY IF EXISTS user_badges_own;
        CREATE POLICY user_badges_own ON user_badges
            FOR ALL
            USING (userId = auth.uid())
            WITH CHECK (userId = auth.uid());
    END IF;

    -- Vérifier si la table game_sessions existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_sessions' AND table_schema = 'public') THEN
        -- Activer RLS sur la table game_sessions
        ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Tout le monde peut voir les sessions de jeu (pour rejoindre)
        DROP POLICY IF EXISTS game_sessions_public;
        CREATE POLICY game_sessions_public ON game_sessions
            FOR SELECT
            USING (true)
            WITH CHECK (true);

        -- Politique : Seul l'hôte peut modifier sa session
        DROP POLICY IF EXISTS game_sessions_host_only;
        CREATE POLICY game_sessions_host_only ON game_sessions
            FOR UPDATE
            USING (hostId = auth.uid())
            WITH CHECK (hostId = auth.uid());

        -- Politique : Seul l'hôte peut supprimer sa session
        DROP POLICY IF EXISTS game_sessions_host_delete;
        CREATE POLICY game_sessions_host_delete ON game_sessions
            FOR DELETE
            USING (hostId = auth.uid())
            WITH CHECK (hostId = auth.uid());
    END IF;

    -- Vérifier si la table game_players existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_players' AND table_schema = 'public') THEN
        -- Activer RLS sur la table game_players
        ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Tout le monde peut voir les participants aux sessions de jeu
        DROP POLICY IF EXISTS game_players_public;
        CREATE POLICY game_players_public ON game_players
            FOR SELECT
            USING (true)
            WITH CHECK (true);

        -- Politique : Les joueurs peuvent voir uniquement leurs propres participations
        DROP POLICY IF EXISTS game_players_own;
        CREATE POLICY game_players_own ON game_players
            FOR ALL
            USING (userId = auth.uid())
            WITH CHECK (userId = auth.uid());
    END IF;

    -- Vérifier si la table class_groups existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'class_groups' AND table_schema = 'public') THEN
        -- Activer RLS sur la table class_groups
        ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Seuls les professeurs peuvent gérer leurs propres classes
        DROP POLICY IF EXISTS class_groups_teacher_own;
        CREATE POLICY class_groups_teacher_own ON class_groups
            FOR ALL
            USING (teacherId = auth.uid())
            WITH CHECK (teacherId = auth.uid());

        -- Politique : Les membres peuvent voir les classes où ils sont inscrits
        DROP POLICY IF EXISTS class_groups_member_view;
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
    END IF;

    -- Vérifier si la table class_group_members existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'class_group_members' AND table_schema = 'public') THEN
        -- Activer RLS sur la table class_group_members
        ALTER TABLE class_group_members ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les membres peuvent gérer uniquement leurs propres participations
        DROP POLICY IF EXISTS class_group_members_own;
        CREATE POLICY class_group_members_own ON class_group_members
            FOR ALL
            USING (userId = auth.uid())
            WITH CHECK (userId = auth.uid());
    END IF;

    -- Vérifier si la table class_messages existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'class_messages' AND table_schema = 'public') THEN
        -- Activer RLS sur la table class_messages
        ALTER TABLE class_messages ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les membres peuvent voir uniquement les messages de leurs classes
        DROP POLICY IF EXISTS class_messages_member_view;
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

        -- Politique : Les membres peuvent poster uniquement dans leurs classes
        DROP POLICY IF EXISTS class_messages_member_post;
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
    END IF;

    -- Vérifier si la table teacher_requests existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_requests' AND table_schema = 'public') THEN
        -- Activer RLS sur la table teacher_requests
        ALTER TABLE teacher_requests ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir uniquement leurs propres demandes professeur
        DROP POLICY IF EXISTS teacher_requests_own;
        CREATE POLICY teacher_requests_own ON teacher_requests
            FOR ALL
            USING (userId = auth.uid())
            WITH CHECK (userId = auth.uid());

        -- Politique : Les utilisateurs peuvent créer uniquement leurs propres demandes professeur
        DROP POLICY IF EXISTS teacher_requests_create_own;
        CREATE POLICY teacher_requests_create_own ON teacher_requests
            FOR INSERT
            WITH CHECK (userId = auth.uid());

        -- Politique : Les admins peuvent gérer toutes les demandes professeur
        DROP POLICY IF EXISTS teacher_requests_admin_all;
        CREATE POLICY teacher_requests_admin_all ON teacher_requests
            FOR ALL
            USING (auth.jwt()->>>>'isAdmin' = 'true')
            WITH CHECK (auth.jwt()->>>>'isAdmin' = 'true');
    END IF;

    -- Vérifier si la table faq_submissions existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faq_submissions' AND table_schema = 'public') THEN
        -- Activer RLS sur la table faq_submissions
        ALTER TABLE faq_submissions ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Les utilisateurs peuvent voir uniquement leurs propres soumissions FAQ
        DROP POLICY IF EXISTS faq_submissions_own;
        CREATE POLICY faq_submissions_own ON faq_submissions
            FOR ALL
            USING (auth.uid() = COALESCE(userId, 'anonymous'))
            WITH CHECK (auth.uid() = COALESCE(userId, 'anonymous'));
    END IF;

    -- Vérifier si la table custom_banners existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'custom_banners' AND table_schema = 'public') THEN
        -- Activer RLS sur la table custom_banners
        ALTER TABLE custom_banners ENABLE ROW LEVEL SECURITY;
        
        -- Politique : Seuls les admins peuvent gérer les bannières personnalisées
        DROP POLICY IF EXISTS custom_banners_admin_all;
        CREATE POLICY custom_banners_admin_all ON custom_banners
            FOR ALL
            USING (auth.jwt()->>>>'isAdmin' = 'true')
            WITH CHECK (auth.jwt()->>>>'isAdmin' = 'true');
    END IF;

END $$;

-- Commentaires sur les politiques (format standard)
COMMENT ON POLICY users_own_profile ON users IS 'Permet aux utilisateurs de voir uniquement leurs propres profils';
COMMENT ON POLICY users_update_own_profile ON users IS 'Permet aux utilisateurs de modifier uniquement leurs propres profils';
COMMENT ON POLICY users_insert_own ON users IS 'Permet aux utilisateurs de creer uniquement leurs propres comptes';
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
