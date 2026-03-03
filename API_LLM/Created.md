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

## 03/03/2026 - 17:15
📁 **Fichier créé** : `src/lib/cookies-consent.ts`
📝 **Description** : Utilitaire de gestion du consentement des cookies conforme CNIL/RGPD
🔧 **Fonctionnalité** : Gère la lecture/écriture du cookie de consentement, helpers pour vérifier l'autorisation

## 03/03/2026 - 17:16
📁 **Fichier créé** : `src/components/CookieBanner.tsx`
📝 **Description** : Composant de bandeau de cookies avec vue simple/détaillée et animations
🔧 **Fonctionnalité** : Affiche le bandeau de consentement, permet le choix granulaire des cookies

## 03/03/2026 - 17:17
📁 **Fichier créé** : `src/components/AdSense.tsx`
📝 **Description** : Wrapper AdSense avec chargement conditionnel selon consentement
🔧 **Fonctionnalité** : Charge les scripts publicitaires uniquement si l'utilisateur a donné son consentement

## 03/03/2026 - 17:18
📁 **Fichier créé** : `src/hooks/useCookieConsent.ts`
📝 **Description** : Hook React pour gérer l'état du consentement des cookies
🔧 **Fonctionnalité** : Synchronise le consentement entre onglets, dispatch les événements de mise à jour

## 03/03/2026 - 17:20
📁 **Fichier mis à jour** : `src/app/cookies/page.tsx`
📝 **Description** : Page de gestion des préférences cookies avec interface complète
🔧 **Fonctionnalité** : Permet de modifier les préférences de cookies à tout moment

## 03/03/2026 - 17:25
📁 **Fichier mis à jour** : `src/app/layout.tsx`
📝 **Description** : Intégration du CookieBanner dans le layout racine
🔧 **Fonctionnalité** : Affiche le bandeau de cookies sur toutes les pages

## 03/03/2026 - 17:30
📁 **Fichier mis à jour** : `src/components/Footer.tsx`
📝 **Description** : Ajout des liens juridiques et de gestion des cookies
🔧 **Fonctionnalité** : Navigation vers les pages légales et gestion des cookies

## 03/03/2026 - 18:45
📁 **Fichier créé** : `src/components/ToggleSwitch.tsx`
📝 **Description** : Composant toggle switch réutilisable avec styling cohérent
🔧 **Fonctionnalité** : Bouton toggle moderne avec animations et accessibilité

## 03/03/2026 - 18:50
📁 **Fichier mis à jour** : `src/middleware.ts`
📝 **Description** : Correction du middleware pour autoriser l'accès aux pages publiques
🔧 **Fonctionnalité** : Permet l'accès à l'accueil et pages légales sans authentification

## 03/03/2026 - 19:15
📁 **Fichier créé** : `src/components/AgeVerificationModal.tsx`
📝 **Description** : Modal de vérification d'âge pour connexions OAuth (non utilisé finalement)
🔧 **Fonctionnalité** : Modal moderne pour certification d'âge obligatoire

## 03/03/2026 - 19:20
📁 **Fichier mis à jour** : `src/app/register/page.tsx`
📝 **Description** : Ajout de la certification d'âge obligatoire dans le formulaire d'inscription
🔧 **Fonctionnalité** : Checkbox obligatoire pour certifier avoir plus de 15 ans

## 03/03/2026 - 19:25
📁 **Fichier mis à jour** : `src/app/mentions-legales/page.tsx`
📝 **Description** : Correction des erreurs de syntaxe JSX dans les mentions légales
🔧 **Fonctionnalité** : Page légale fonctionnelle avec structure JSX valide

## 03/03/2026 - 19:30
📁 **Fichier mis à jour** : `next.config.js`
📝 **Description** : Remplacement de images.domains déprécié par images.remotePatterns
🔧 **Fonctionnalité** : Configuration Next.js conforme à la version 16.1.6