-- Migration pour corriger le type de user_id dans game_players
-- Le problème : user_id est de type text au lieu de uuid

DO $$ 
BEGIN
    -- Vérifier si la table game_players existe et si user_id est de type text
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'game_players'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_players' AND column_name = 'user_id' AND data_type = 'text'
    ) THEN
        -- Créer une nouvelle colonne user_id_uuid avec le bon type
        ALTER TABLE game_players ADD COLUMN user_id_uuid UUID;
        
        -- Copier les données de user_id vers user_id_uuid
        UPDATE game_players 
        SET user_id_uuid = CASE 
            WHEN user_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' 
            THEN user_id::uuid 
            ELSE NULL 
        END;
        
        -- Supprimer l'ancienne colonne user_id
        ALTER TABLE game_players DROP COLUMN user_id;
        
        -- Renommer user_id_uuid en user_id
        ALTER TABLE game_players RENAME COLUMN user_id_uuid TO user_id;
        
        -- Recréer l'index sur user_id
        CREATE INDEX IF NOT EXISTS "idx_game_players_user_id" ON "game_players"("user_id");
        
        -- Recréer la contrainte foreign key
        ALTER TABLE game_players ADD CONSTRAINT "fk_game_players_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        
        RAISE NOTICE 'user_id column type corrected from text to uuid';
    END IF;
END $$;

-- Commentaire sur la migration
COMMENT ON COLUMN game_players."user_id" IS 'UUID de l utilisateur (corrigé de text vers uuid)';
