-- Vérifier et ajouter userId à la table statistics si manquant
ALTER TABLE statistics ADD COLUMN IF NOT EXISTS "userId" TEXT UNIQUE;

-- Créer l'index unique si nécessaire
CREATE UNIQUE INDEX IF NOT EXISTS statistics_userId_key ON statistics("userId");
