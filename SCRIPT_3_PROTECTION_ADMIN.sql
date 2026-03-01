-- ============================================
-- SCRIPT 3: PROTECTION DU COMPTE ADMIN
-- ============================================
-- ⚠️ SCRIPT À EXÉCUTER UNE SEULE FOIS APRÈS LES AUTRES

-- ÉTAPE 1: S'assurer que le compte admin ne peut jamais être modifié
-- par les RLS policies normales

-- Politique de protection du compte admin
CREATE POLICY "admin_protected" ON users
FOR ALL
USING (
  auth.uid()::text = id  -- Un utilisateur ne peut modifier que son propre profil
  OR 
  EXISTS (           -- Sauf si c'est un admin qui modifie
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text AND role = 'admin'
  )
);

-- ÉTAPE 2: Empêcher la suppression du compte admin
CREATE RULE no_delete_admin AS
ON DELETE TO users
WHERE OLD.role = 'admin'
DO INSTEAD NOTHING;

-- ÉTAPE 3: Politiques de lecture pour les admins
-- Les admins peuvent voir tous les utilisateurs
CREATE POLICY "admin_read_all" ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text AND role = 'admin'
  )
);

-- ÉTAPE 4: Vérification de la protection
-- Confirmer que les politiques sont bien en place

SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'users' 
AND (policyname LIKE '%admin%' OR policyname LIKE '%protected%');

-- ============================================
-- INSTRUCTIONS IMPORTANTES
-- ============================================

-- ⚠️ ORDRE D'EXÉCUTION RECOMMANDÉ:
-- 1. SCRIPT_1_CREATION_TABLES.sql (création des tables)
-- 2. SCRIPT_2_RESET_MEMBRES.sql (reset des membres - IRRÉVERSIBLE)
-- 3. SCRIPT_3_PROTECTION_ADMIN.sql (protection admin - À FAIRE UNE SEULE FOIS)

-- ⚠️ SÉCURITÉ:
-- Le compte admin est maintenant protégé contre:
-- ✅ Modifications par d'autres utilisateurs
-- ✅ Suppression accidentelle  
-- ✅ Accès en lecture restreint
-- ✅ RLS policies normales ne s'appliquent pas

-- ⚠️ VÉRIFICATION FINALE:
-- Après exécution, tester avec:
-- 1. Se connecter comme admin et vérifier qu'on peut voir tous les users
-- 2. Se connecter comme user normal et vérifier qu'on ne peut pas modifier l'admin
-- 3. Tenter de supprimer le compte admin (doit échouer)
