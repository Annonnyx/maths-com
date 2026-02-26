-- ============================================================
-- MIGRATION SQL COMPLÈTE - À COPIER/COLLER DANS SUPABASE SQL EDITOR
-- ============================================================
-- Ce script corrige tous les problèmes et ajoute les fonctionnalités manquantes
-- Exécutez-le dans l'éditeur SQL de Supabase (Database > SQL Editor)

-- ============================================================
-- 1. TABLE CUSTOM_BANNERS (pour l'admin panel - corrige l'erreur 500)
-- ============================================================

-- Créer la table custom_banners si elle n'existe pas
CREATE TABLE IF NOT EXISTS "custom_banners" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  imageUrl TEXT NOT NULL,
  thumbnailUrl TEXT,
  isPremium BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  createdBy TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches rapides sur custom_banners
CREATE INDEX IF NOT EXISTS "idx_custom_banners_created_by" ON "custom_banners"("createdBy");
CREATE INDEX IF NOT EXISTS "idx_custom_banners_is_active" ON "custom_banners"("isActive") WHERE "isActive" = true;

-- ============================================================
-- 2. COLONNES OPTIONNELLES POUR LE SYSTÈME DE CLASSES
-- ============================================================

-- Ajouter la colonne pour désactiver la géométrie (optionnel mais recommandé)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "disable_geometry" BOOLEAN DEFAULT false;

-- Ajouter une colonne pour stocker la classe préférée
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferred_class" VARCHAR(10);

-- ============================================================
-- 3. CORRECTIONS DE BUGS ET NETTOYAGE
-- ============================================================

-- Assurer que tous les utilisateurs ont un lastSeenAt valide
UPDATE "users" 
SET "lastSeenAt" = CURRENT_TIMESTAMP 
WHERE "lastSeenAt" IS NULL;

-- Nettoyer les statuts "en ligne" obsolètes (utilisateurs inactifs depuis plus de 5 minutes)
UPDATE "users" 
SET "isOnline" = false 
WHERE "isOnline" = true 
AND "lastSeenAt" < CURRENT_TIMESTAMP - INTERVAL '5 minutes';

-- Réinitialiser les valeurs NULL de disable_geometry
UPDATE "users" SET "disable_geometry" = false WHERE "disable_geometry" IS NULL;

-- ============================================================
-- 4. INDEX DE PERFORMANCE
-- ============================================================

-- Index sur elo pour les requêtes de classement
CREATE INDEX IF NOT EXISTS "idx_users_elo" ON "users"(elo DESC);

-- Index sur rankClass pour les filtres
CREATE INDEX IF NOT EXISTS "idx_users_rank_class" ON "users"("rankClass");

-- Index sur lastSeenAt pour le nettoyage des présences
CREATE INDEX IF NOT EXISTS "idx_users_last_seen" ON "users"("lastSeenAt");

-- Index sur isOnline pour les requêtes de présence
CREATE INDEX IF NOT EXISTS "idx_users_is_online" ON "users"("isOnline") WHERE "isOnline" = true;

-- ============================================================
-- 5. TABLE DE RÉFÉRENCE POUR LES CLASSES (optionnel mais utile)
-- ============================================================

CREATE TABLE IF NOT EXISTS "class_reference" (
  class_name VARCHAR(10) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  age_range VARCHAR(20),
  cycle VARCHAR(20),
  min_elo INTEGER NOT NULL,
  max_elo INTEGER NOT NULL,
  color VARCHAR(7) DEFAULT '#000000',
  icon VARCHAR(10) DEFAULT '📚'
);

-- Insérer les données de référence des classes françaises
INSERT INTO "class_reference" (class_name, full_name, age_range, cycle, min_elo, max_elo, color, icon) VALUES
('CP', 'Cours Préparatoire', '6-7 ans', 'primaire', 0, 549, '#4ade80', '🌱'),
('CE1', 'Cours Élémentaire 1', '7-8 ans', 'primaire', 550, 649, '#22d3ee', '🌿'),
('CE2', 'Cours Élémentaire 2', '8-9 ans', 'primaire', 650, 799, '#38bdf8', '🍃'),
('CM1', 'Cours Moyen 1', '9-10 ans', 'primaire', 800, 999, '#60a5fa', '🌳'),
('CM2', 'Cours Moyen 2', '10-11 ans', 'primaire', 1000, 1199, '#818cf8', '🌲'),
('6e', 'Sixième', '11-12 ans', 'college', 1200, 1399, '#a78bfa', '📚'),
('5e', 'Cinquième', '12-13 ans', 'college', 1400, 1599, '#c084fc', '📖'),
('4e', 'Quatrième', '13-14 ans', 'college', 1600, 1799, '#e879f9', '📐'),
('3e', 'Troisième', '14-15 ans', 'college', 1800, 1999, '#f472b6', '🎓'),
('2de', 'Seconde', '15-16 ans', 'lycee', 2000, 2299, '#fb7185', '🎯'),
('1re', 'Première', '16-17 ans', 'lycee', 2300, 2499, '#fda4af', '🏆'),
('Tle', 'Terminale', '17-18 ans', 'lycee', 2500, 2749, '#fcd34d', '👑'),
('Sup1', 'Supérieur 1', '18+ ans', 'superieur', 2750, 2999, '#fbbf24', '🔬'),
('Sup2', 'Supérieur 2', '19+ ans', 'superieur', 3000, 3499, '#f59e0b', '⚗️'),
('Sup3', 'Supérieur 3', '20+ ans', 'superieur', 3500, 3999, '#d97706', '🔭'),
('Pro', 'Expert', 'Expert', 'pro', 4000, 999999, '#dc2626', '⭐')
ON CONFLICT (class_name) DO NOTHING;

-- ============================================================
-- 6. VUE POUR FACILITER LES REQUÊTES (optionnel)
-- ============================================================

CREATE OR REPLACE VIEW "user_classes" AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.elo,
  u."rankClass",
  u."multiplayerElo",
  u."multiplayerRankClass",
  CASE 
    WHEN u.elo >= 4000 THEN 'Pro'
    WHEN u.elo >= 3500 THEN 'Sup3'
    WHEN u.elo >= 3000 THEN 'Sup2'
    WHEN u.elo >= 2750 THEN 'Sup1'
    WHEN u.elo >= 2500 THEN 'Tle'
    WHEN u.elo >= 2300 THEN '1re'
    WHEN u.elo >= 2000 THEN '2de'
    WHEN u.elo >= 1800 THEN '3e'
    WHEN u.elo >= 1600 THEN '4e'
    WHEN u.elo >= 1400 THEN '5e'
    WHEN u.elo >= 1200 THEN '6e'
    WHEN u.elo >= 1000 THEN 'CM2'
    WHEN u.elo >= 800 THEN 'CM1'
    WHEN u.elo >= 650 THEN 'CE2'
    WHEN u.elo >= 550 THEN 'CE1'
    ELSE 'CP'
  END as current_class,
  u."disable_geometry"
FROM "users" u;

-- ============================================================
-- 7. VÉRIFICATION POST-MIGRATION (à exécuter pour vérifier)
-- ============================================================

-- Compter les utilisateurs par classe actuelle
-- SELECT current_class, COUNT(*) as count FROM user_classes GROUP BY current_class ORDER BY count DESC;

-- Vérifier que la table custom_banners existe
-- SELECT * FROM "custom_banners" LIMIT 1;

-- Vérifier les colonnes ajoutées
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('disable_geometry', 'preferred_class');

-- ============================================================
-- MIGRATION TERMINÉE
-- ============================================================
-- Redéployez l'application après avoir exécuté ce script
