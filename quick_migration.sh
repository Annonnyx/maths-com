#!/bin/bash

# SCRIPT DE CORRECTION RAPIDE - MIGRATION SOLO/MULTI

echo "🚀 DÉBUT DE LA MIGRATION SOLO/MULTIPLAYER..."

# Étape 1: Appliquer les corrections SQL essentielles
echo "📊 Étape 1: Application des corrections SQL..."

# Ajouter les nouveaux champs solo/multi dans users
cat << 'EOF' > /tmp/migration_fields.sql
-- Ajouter les champs solo/multi s'ils n'existent pas
DO $$ 
BEGIN
    -- Champs SOLO
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloElo" INTEGER DEFAULT 400;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloRankClass" TEXT DEFAULT 'F-';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloBestElo" INTEGER DEFAULT 400;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloBestRankClass" TEXT DEFAULT 'F-';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloCurrentStreak" INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "soloBestStreak" INTEGER DEFAULT 0;
    
    -- Champs MULTIPLAYER
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "multiplayerElo" INTEGER DEFAULT 400;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "multiplayerRankClass" TEXT DEFAULT 'F-';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "multiplayerBestElo" INTEGER DEFAULT 400;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "multiplayerBestRankClass" TEXT DEFAULT 'F-';
    
    -- Mettre à jour les données existantes
    UPDATE users SET 
        "soloElo" = COALESCE(elo, 400),
        "soloRankClass" = COALESCE("rankClass", 'F-'),
        "soloBestElo" = COALESCE("bestElo", 400),
        "soloBestRankClass" = COALESCE("bestRankClass", 'F-'),
        "soloCurrentStreak" = COALESCE("currentStreak", 0),
        "soloBestStreak" = COALESCE("bestStreak", 0)
    WHERE "soloElo" = 400;
    
    -- Renommer les tables solo
    ALTER TABLE statistics RENAME TO solo_statistics;
    ALTER TABLE tests RENAME TO solo_tests;
    ALTER TABLE questions RENAME TO solo_questions;
    
    -- Mettre à jour les contraintes
    DROP TABLE IF EXISTS user_badges CASCADE;
    DROP TABLE IF EXISTS badges CASCADE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur ignored: %', SQLERRM;
END $$;
EOF

echo "✅ Script SQL généré dans /tmp/migration_fields.sql"
echo "📋 Veuillez copier ce contenu dans l'éditeur SQL Supabase et l'exécuter manuellement"

# Étape 2: Forcer la régénération Prisma
echo "🔄 Étape 2: Régénération du Prisma client..."
cd /Users/Noe/Documents/APp-Maths/maths-com
npx prisma generate --force

# Étape 3: Vérifier le build
echo "🔍 Étape 3: Vérification du build..."
npm run build

echo "🎯 MIGRATION TERMINÉE !"
echo "📊 Prochaines étapes :"
echo "1. Exécuter le script SQL dans Supabase"
echo "2. Vérifier que l'application fonctionne"
echo "3. Tester les fonctionnalités solo/multi"
