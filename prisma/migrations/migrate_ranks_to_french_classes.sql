-- Migration pour convertir les rangs F-/F/F+/E-/E/E+/D-/D/D+/C-/C/C+/B-/B/B+/A-/A/A+/S-/S/S+
-- vers les classes françaises CP, CE1, CE2, CM1, CM2, 6e, 5e, 4e, 3e, 2de, 1re, Tle, Sup1, Sup2, Sup3, Pro

-- ========================================
-- ÉTAPE 1 : Ajout des nouveaux champs
-- ========================================

-- Ajouter les champs de classes françaises pour le mode solo
ALTER TABLE users 
ADD COLUMN solo_class VARCHAR(10) DEFAULT 'CP',
ADD COLUMN solo_best_class VARCHAR(10) DEFAULT 'CP';

-- Ajouter les champs de classes françaises pour le mode multiplayer
ALTER TABLE users 
ADD COLUMN multiplayer_class VARCHAR(10) DEFAULT 'CP',
ADD COLUMN multiplayer_best_class VARCHAR(10) DEFAULT 'CP';

-- ========================================
-- ÉTAPE 2 : Conversion des rangs vers classes françaises
-- ========================================

-- Fonction pour convertir un rang en classe française
CREATE OR REPLACE FUNCTION convert_rank_to_class(rank TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN CASE rank
        WHEN 'F-' THEN 'CP'
        WHEN 'F' THEN 'CP'
        WHEN 'F+' THEN 'CE1'
        WHEN 'E-' THEN 'CE1'
        WHEN 'E' THEN 'CE2'
        WHEN 'E+' THEN 'CM1'
        WHEN 'D-' THEN 'CM1'
        WHEN 'D' THEN 'CM2'
        WHEN 'D+' THEN '6e'
        WHEN 'C-' THEN '6e'
        WHEN 'C' THEN '5e'
        WHEN 'C+' THEN '4e'
        WHEN 'B-' THEN '4e'
        WHEN 'B' THEN '3e'
        WHEN 'B+' THEN '2de'
        WHEN 'A-' THEN '2de'
        WHEN 'A' THEN '1re'
        WHEN 'A+' THEN 'Tle'
        WHEN 'S-' THEN 'Sup1'
        WHEN 'S' THEN 'Sup2'
        WHEN 'S+' THEN 'Sup3'
        ELSE 'Pro'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Conversion des rangs solo actuels
UPDATE users 
SET solo_class = convert_rank_to_class(solo_rank_class),
    solo_best_class = convert_rank_to_class(solo_best_rank_class);

-- Conversion des rangs multiplayer actuels
UPDATE users 
SET multiplayer_class = convert_rank_to_class(multiplayer_rank_class),
    multiplayer_best_class = convert_rank_to_class(multiplayer_best_rank_class);

-- ========================================
-- ÉTAPE 3 : Mise à jour basée sur l'ELO (plus fiable)
-- ========================================

-- Fonction pour obtenir la classe française selon l'ELO
CREATE OR REPLACE FUNCTION get_class_from_elo(elo INTEGER) 
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN elo < 475 THEN 'CP'
        WHEN elo < 600 THEN 'CE1'
        WHEN elo < 725 THEN 'CE2'
        WHEN elo < 900 THEN 'CM1'
        WHEN elo < 1100 THEN 'CM2'
        WHEN elo < 1300 THEN '6e'
        WHEN elo < 1500 THEN '5e'
        WHEN elo < 1700 THEN '4e'
        WHEN elo < 1900 THEN '3e'
        WHEN elo < 2150 THEN '2de'
        WHEN elo < 2400 THEN '1re'
        WHEN elo < 2625 THEN 'Tle'
        WHEN elo < 2875 THEN 'Sup1'
        WHEN elo < 3250 THEN 'Sup2'
        WHEN elo < 3750 THEN 'Sup3'
        ELSE 'Pro'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Mettre à jour les classes en se basant sur l'ELO actuel (plus précis)
UPDATE users 
SET solo_class = get_class_from_elo(solo_elo),
    multiplayer_class = get_class_from_elo(multiplayer_elo);

-- Mettre à jour les meilleures classes en se basant sur le meilleur ELO
UPDATE users 
SET solo_best_class = get_class_from_elo(solo_best_elo),
    multiplayer_best_class = get_class_from_elo(multiplayer_best_elo);

-- ========================================
-- ÉTAPE 4 : Nettoyage des anciens champs (après validation)
-- ========================================

-- Commenter temporairement les anciens champs pour éviter les erreurs
-- ALTER TABLE auth.users DROP COLUMN solo_rank_class;
-- ALTER TABLE auth.users DROP COLUMN solo_best_rank_class;
-- ALTER TABLE auth.users DROP COLUMN multiplayer_rank_class;
-- ALTER TABLE auth.users DROP COLUMN multiplayer_best_rank_class;

-- ========================================
-- ÉTAPE 5 : Création d'index pour optimiser les performances
-- ========================================

-- Index pour les recherches fréquentes sur les classes
CREATE INDEX IF NOT EXISTS idx_users_solo_class ON users(solo_class);
CREATE INDEX IF NOT EXISTS idx_users_multiplayer_class ON users(multiplayer_class);
CREATE INDEX IF NOT EXISTS idx_users_solo_best_class ON users(solo_best_class);
CREATE INDEX IF NOT EXISTS idx_users_multiplayer_best_class ON users(multiplayer_best_class);

-- ========================================
-- ÉTAPE 6 : Validation et rapport
-- ========================================

-- Afficher un résumé de la migration
DO $$
DECLARE
    total_users INTEGER;
    converted_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM users;
    SELECT COUNT(*) INTO converted_users FROM users WHERE solo_class IS NOT NULL;
    
    RAISE NOTICE '=== MIGRATION RANGS → CLASSES FRANÇAISES ===';
    RAISE NOTICE 'Total utilisateurs: %', total_users;
    RAISE NOTICE 'Utilisateurs convertis: %', converted_users;
    RAISE NOTICE 'Taux de conversion: %', ROUND((converted_users::NUMERIC / total_users::NUMERIC) * 100, 2);
    RAISE NOTICE 'Classes disponibles: CP, CE1, CE2, CM1, CM2, 6e, 5e, 4e, 3e, 2de, 1re, Tle, Sup1, Sup2, Sup3, Pro';
    RAISE NOTICE 'Migration terminée avec succès !';
END $$;

-- Nettoyage des fonctions temporaires
DROP FUNCTION IF EXISTS convert_rank_to_class(TEXT);
DROP FUNCTION IF EXISTS get_class_from_elo(INTEGER);

-- ========================================
-- ÉTAPE 7 : Mise à jour des contraintes
-- ========================================

-- Ajouter des contraintes CHECK pour valider les classes
ALTER TABLE users 
ADD CONSTRAINT chk_solo_class CHECK (solo_class IN ('CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'));

ALTER TABLE users 
ADD CONSTRAINT chk_multiplayer_class CHECK (multiplayer_class IN ('CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'));

ALTER TABLE users 
ADD CONSTRAINT chk_solo_best_class CHECK (solo_best_class IN ('CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'));

ALTER TABLE users 
ADD CONSTRAINT chk_multiplayer_best_class CHECK (multiplayer_best_class IN ('CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'));

COMMIT;
