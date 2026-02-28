-- Migration pour le système de jeu multijoueur style Kahoot
-- Création des tables game_sessions et game_players

-- Vérifier si les tables existent déjà avant de les créer
DO $$ 
BEGIN
    -- Créer la table game_sessions si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'game_sessions'
    ) THEN
        CREATE TABLE "game_sessions" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR(6) UNIQUE NOT NULL,
            host_id UUID NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
            quiz_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            max_players INTEGER DEFAULT 20,
            current_question_index INTEGER DEFAULT 0,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Créer les index
        CREATE INDEX "idx_game_sessions_code" ON "game_sessions"("code");
        CREATE INDEX "idx_game_sessions_host_id" ON "game_sessions"("host_id");
        CREATE INDEX "idx_game_sessions_status" ON "game_sessions"("status");
    END IF;

    -- Créer la table game_players si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'game_players'
    ) THEN
        CREATE TABLE "game_players" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id UUID NOT NULL,
            user_id UUID NOT NULL,
            score INTEGER DEFAULT 0,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_ready BOOLEAN DEFAULT FALSE,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Créer les index
        CREATE INDEX "idx_game_players_session_id" ON "game_players"("session_id");
        CREATE INDEX "idx_game_players_user_id" ON "game_players"("user_id");
        CREATE INDEX "idx_game_players_score" ON "game_players"("score");
        
        -- Créer les contraintes foreign key
        ALTER TABLE "game_players" ADD CONSTRAINT "fk_game_players_session_id" 
            FOREIGN KEY ("session_id") REFERENCES "game_sessions"("id") ON DELETE CASCADE;
        
        ALTER TABLE "game_players" ADD CONSTRAINT "fk_game_players_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;

    -- Ajouter les contraintes foreign key pour game_sessions
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'game_sessions'
    ) THEN
        ALTER TABLE "game_sessions" ADD CONSTRAINT "fk_game_sessions_host_id" 
            FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE;
        
        ALTER TABLE "game_sessions" ADD CONSTRAINT "fk_game_sessions_quiz_id" 
            FOREIGN KEY ("quiz_id") REFERENCES "tests"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux deux tables
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON "game_sessions";
CREATE TRIGGER update_game_sessions_updated_at 
    BEFORE UPDATE ON "game_sessions" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_players_updated_at ON "game_players";
CREATE TRIGGER update_game_players_updated_at 
    BEFORE UPDATE ON "game_players" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur les tables
COMMENT ON TABLE "game_sessions" IS 'Sessions de jeu multijoueur style Kahoot';
COMMENT ON TABLE "game_players" IS 'Joueurs dans les sessions de jeu multijoueur';

COMMENT ON COLUMN "game_sessions"."code" IS 'Code unique à 6 caractères pour rejoindre la partie';
COMMENT ON COLUMN "game_sessions"."status" IS 'Statut de la session: waiting, active, finished';
COMMENT ON COLUMN "game_sessions"."max_players" IS 'Nombre maximum de joueurs autorisés';
COMMENT ON COLUMN "game_sessions"."current_question_index" IS 'Index de la question en cours';

COMMENT ON COLUMN "game_players"."score" IS 'Score du joueur dans la session';
COMMENT ON COLUMN "game_players"."is_ready" IS 'Le joueur est prêt à commencer';
