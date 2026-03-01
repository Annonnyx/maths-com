-- ============================================
-- SCRIPT 2: RESET DES MEMBRES (SAUF ADMIN)
-- ============================================
-- ⚠️ SCRIPT IRRÉVERSIBLE - À CONFIRMER AVANT EXÉCUTION

-- ÉTAPE 1: Vérification du compte admin
-- Affiche le compte admin pour confirmation avant le reset
SELECT 
  id,
  email, 
  username, 
  role,
  solo_elo,
  multiplayer_elo
FROM users 
WHERE role = 'admin' OR role = 'ADMIN'
ORDER BY created_at ASC;

-- ⚠️ CONFIRMATION REQUISE:
-- Vérifiez l'ID du compte admin ci-dessus avant de continuer
-- Le script ne modifiera PAS les comptes avec role = 'admin'

-- ============================================
-- ÉTAPE 2: Reset des membres SAUF admin
-- ============================================

-- Reset des statistiques solo
UPDATE users 
SET 
  solo_elo = 100,
  solo_rank_class = 'F-',
  solo_best_elo = 100,
  solo_best_rank_class = 'F-',
  solo_current_streak = 0,
  solo_best_streak = 0,
  has_completed_onboarding = false
WHERE role != 'admin';

-- Reset des statistiques multijoueur
UPDATE users 
SET 
  multiplayer_elo = 400,
  multiplayer_rank_class = 'F-',
  multiplayer_best_elo = 400,
  multiplayer_best_rank_class = 'F-',
  multiplayer_current_streak = 0,
  multiplayer_best_streak = 0
WHERE role != 'admin';

-- Suppression de l'historique des tests (sauf admin)
DELETE FROM solo_tests 
WHERE user_id NOT IN (
  SELECT id FROM users WHERE role = 'admin'
);

-- Suppression de l'historique des parties multijoueur (sauf admin)
DELETE FROM multiplayer_games
WHERE player1_id NOT IN (SELECT id FROM users WHERE role = 'admin')
AND player2_id NOT IN (SELECT id FROM users WHERE role = 'admin');

-- Suppression des statistiques solo (sauf admin)
DELETE FROM solo_statistics
WHERE user_id NOT IN (
  SELECT id FROM users WHERE role = 'admin'
);

-- Suppression des statistiques multijoueur (sauf admin)
DELETE FROM multiplayer_statistics
WHERE user_id NOT IN (
  SELECT id FROM users WHERE role = 'admin'
);

-- Réinitialisation de l'onboarding pour tous
UPDATE users 
SET has_completed_onboarding = false
WHERE role != 'admin';

-- ============================================
-- ÉTAPE 3: Vérification post-reset
-- ============================================

-- Confirmation post-reset
SELECT 
  role,
  COUNT(*) as nb_users,
  AVG(solo_elo) as elo_moyen_solo,
  AVG(multiplayer_elo) as elo_moyen_multiplayer,
  COUNT(CASE WHEN solo_elo = 100 THEN 1 END) as users_resets_solo,
  COUNT(CASE WHEN multiplayer_elo = 400 THEN 1 END) as users_resets_multiplayer,
  COUNT(CASE WHEN has_completed_onboarding = false THEN 1 END) as users_onboarding_reset
FROM users 
GROUP BY role;

-- ============================================
-- RÉSUMÉ DES OPÉRATIONS EFFECTUÉES
-- ============================================

-- Ce script a effectué les opérations suivantes:
-- ✅ Reset des stats solo pour tous les utilisateurs sauf admin
-- ✅ Reset des stats multiplayer pour tous les utilisateurs sauf admin  
-- ✅ Suppression de l'historique des tests solo
-- ✅ Suppression de l'historique des parties multiplayer
-- ✅ Suppression des statistiques solo et multiplayer
-- ✅ Réinitialisation de l'onboarding pour tous

-- ⚠️ IMPORTANT: Les comptes admin sont préservés avec leurs données actuelles
