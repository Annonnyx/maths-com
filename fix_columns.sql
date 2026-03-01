-- Ajouter les colonnes manquantes restantes
ALTER TABLE users ADD COLUMN IF NOT EXISTS "currentStreak" INTEGER DEFAULT 0;
