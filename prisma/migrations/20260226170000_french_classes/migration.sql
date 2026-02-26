-- Migration SQL pour le système de classes françaises
-- Date: 2026-02-26
-- Note: Cette migration est OPTIONNELLE car le système de classes fonctionne entièrement avec les données existantes

-- ============================================================
-- OPTION 1: Migration minimale (recommandée)
-- Aucune modification nécessaire - le système utilise l'ELO existant
-- ============================================================

-- ============================================================
-- OPTION 2: Migration avec suivi de progression (optionnelle)
-- Décommentez si vous souhaitez stocker explicitement la classe actuelle
-- ============================================================

/*
-- Ajouter une colonne pour stocker la classe actuelle (optionnel)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "current_class" VARCHAR(10) DEFAULT 'CP';

-- Ajouter une colonne pour suivre la dernière promotion
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_class_promotion_at" TIMESTAMP;

-- Créer une table pour l'historique des promotions de classe
CREATE TABLE IF NOT EXISTS "class_promotions" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  old_class VARCHAR(10) NOT NULL,
  new_class VARCHAR(10) NOT NULL,
  elo_at_promotion INTEGER NOT NULL,
  promoted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS "idx_class_promotions_user_id" ON "class_promotions"(user_id);
CREATE INDEX IF NOT EXISTS "idx_class_promotions_promoted_at" ON "class_promotions"(promoted_at);
*/

-- ============================================================
-- OPTION 3: Migration avec préférences utilisateur (optionnelle)
-- Décommentez si vous souhaitez stocker les préférences de classes
-- ============================================================

/*
-- Ajouter une colonne pour stocker la classe préférée pour l'entraînement
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferred_class" VARCHAR(10);

-- Ajouter une colonne pour désactiver la géométrie
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "disable_geometry" BOOLEAN DEFAULT false;

-- Ajouter une colonne pour les classes favorites (JSON array)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "favorite_classes" TEXT DEFAULT '[]';
*/

-- ============================================================
-- CORRECTIONS DE BUGS
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

-- ============================================================
-- INDEX DE PERFORMANCE
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
-- DONNÉES DE RÉFÉRENCE (optionnel)
-- ============================================================

-- Créer une table de référence pour les classes (si besoin de requêtes complexes)
/*
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

-- Insérer les données de référence
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
*/

-- ============================================================
-- VUES POUR FACILITER LES REQUÊTES
-- ============================================================

-- Vue pour obtenir la classe actuelle des utilisateurs
/*
CREATE OR REPLACE VIEW "user_classes" AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.elo,
  u."rankClass",
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
  END as current_class
FROM "users" u;
*/

-- ============================================================
-- PROCÉDURES STOCKÉES (optionnel - PostgreSQL)
-- ============================================================

-- Fonction pour mettre à jour la classe automatiquement (si colonne current_class existe)
/*
CREATE OR REPLACE FUNCTION update_user_class()
RETURNS TRIGGER AS $$
BEGIN
  NEW.current_class := CASE 
    WHEN NEW.elo >= 4000 THEN 'Pro'
    WHEN NEW.elo >= 3500 THEN 'Sup3'
    WHEN NEW.elo >= 3000 THEN 'Sup2'
    WHEN NEW.elo >= 2750 THEN 'Sup1'
    WHEN NEW.elo >= 2500 THEN 'Tle'
    WHEN NEW.elo >= 2300 THEN '1re'
    WHEN NEW.elo >= 2000 THEN '2de'
    WHEN NEW.elo >= 1800 THEN '3e'
    WHEN NEW.elo >= 1600 THEN '4e'
    WHEN NEW.elo >= 1400 THEN '5e'
    WHEN NEW.elo >= 1200 THEN '6e'
    WHEN NEW.elo >= 1000 THEN 'CM2'
    WHEN NEW.elo >= 800 THEN 'CM1'
    WHEN NEW.elo >= 650 THEN 'CE2'
    WHEN NEW.elo >= 550 THEN 'CE1'
    ELSE 'CP'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mise à jour automatique de la classe
-- CREATE TRIGGER trigger_update_user_class
-- BEFORE INSERT OR UPDATE OF elo ON "users"
-- FOR EACH ROW
-- EXECUTE FUNCTION update_user_class();
*/

-- ============================================================
-- VÉRIFICATION POST-MIGRATION
-- ============================================================

-- Compter les utilisateurs par classe actuelle (via ELO)
SELECT 
  CASE 
    WHEN elo >= 4000 THEN 'Pro'
    WHEN elo >= 3500 THEN 'Sup3'
    WHEN elo >= 3000 THEN 'Sup2'
    WHEN elo >= 2750 THEN 'Sup1'
    WHEN elo >= 2500 THEN 'Tle'
    WHEN elo >= 2300 THEN '1re'
    WHEN elo >= 2000 THEN '2de'
    WHEN elo >= 1800 THEN '3e'
    WHEN elo >= 1600 THEN '4e'
    WHEN elo >= 1400 THEN '5e'
    WHEN elo >= 1200 THEN '6e'
    WHEN elo >= 1000 THEN 'CM2'
    WHEN elo >= 800 THEN 'CM1'
    WHEN elo >= 650 THEN 'CE2'
    WHEN elo >= 550 THEN 'CE1'
    ELSE 'CP'
  END as class,
  COUNT(*) as user_count,
  MIN(elo) as min_elo,
  MAX(elo) as max_elo,
  AVG(elo)::INTEGER as avg_elo
FROM "users"
GROUP BY 
  CASE 
    WHEN elo >= 4000 THEN 'Pro'
    WHEN elo >= 3500 THEN 'Sup3'
    WHEN elo >= 3000 THEN 'Sup2'
    WHEN elo >= 2750 THEN 'Sup1'
    WHEN elo >= 2500 THEN 'Tle'
    WHEN elo >= 2300 THEN '1re'
    WHEN elo >= 2000 THEN '2de'
    WHEN elo >= 1800 THEN '3e'
    WHEN elo >= 1600 THEN '4e'
    WHEN elo >= 1400 THEN '5e'
    WHEN elo >= 1200 THEN '6e'
    WHEN elo >= 1000 THEN 'CM2'
    WHEN elo >= 800 THEN 'CM1'
    WHEN elo >= 650 THEN 'CE2'
    WHEN elo >= 550 THEN 'CE1'
    ELSE 'CP'
  END
ORDER BY MIN(elo);
