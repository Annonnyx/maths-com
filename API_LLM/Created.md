# Règle pour l'IA - Création de fichiers

## 📋 PROCÉDURE OBLIGATOIRE

Avant de créer un nouveau fichier, l'IA DOIT :

1. **Vérifier si le fichier existe déjà** avec `find_by_name` ou `read_file`
2. **Ajouter une entrée dans ce fichier** avec le format :
   ```
   ## [DATE] - [HEURE]
   📁 **Fichier créé** : `src/app/chemin/du/fichier.tsx`
   📝 **Description** : [Courte description du fichier et de son utilité]
   🔧 **Fonctionnalité** : [À quelle fonctionnalité ça correspond]
   ```

3. **Seulement après** procéder à la création du fichier

## 📝 HISTORIQUE DES CRÉATIONS

*(Cette section sera remplie par l'IA à chaque création)*

## 02/03/2026 - 20:57
📁 **Fichier créé** : `src/app/onboarding/test/page.tsx`
📝 **Description** : Page de test de positionnement adaptatif pour les nouveaux utilisateurs
🔧 **Fonctionnalité** : Test d'onboarding qui évalue le niveau de l'utilisateur et définit sa classe scolaire et ELO initiaux

## 02/03/2026 - 20:58
📁 **Fichier créé** : `src/app/api/users/onboarding-complete/route.ts`
📝 **Description** : API endpoint pour sauvegarder les résultats du test d'onboarding
🔧 **Fonctionnalité** : Met à jour l'ELO, la classe et le statut d'onboarding de l'utilisateur