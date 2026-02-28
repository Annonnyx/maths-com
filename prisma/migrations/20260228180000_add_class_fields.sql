-- Migration pour ajouter les champs de classe scolaire
-- Ajout des colonnes classe et birthYear à la table users

-- Vérifier si les colonnes existent déjà avant de les ajouter
DO $$ 
BEGIN
    -- Ajouter la colonne birthYear si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'birthYear'
    ) THEN
        ALTER TABLE users ADD COLUMN "birthYear" INTEGER;
    END IF;

    -- Ajouter la colonne classe si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'classe'
    ) THEN
        ALTER TABLE users ADD COLUMN "classe" TEXT;
    END IF;
END $$;

-- Créer un index sur le champ classe pour des performances optimales
CREATE INDEX IF NOT EXISTS "idx_users_classe" ON "users"("classe");

-- Créer un index sur le champ birthYear pour des performances optimales
CREATE INDEX IF NOT EXISTS "idx_users_birthYear" ON "users"("birthYear");

COMMENT ON COLUMN users."classe" IS 'Classe scolaire calculée (CP, CE1, CE2, CM1, CM2, 6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Terminale)';
COMMENT ON COLUMN users."birthYear" IS 'Année de naissance pour calculer la classe automatiquement';
