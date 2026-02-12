# Changelog

## [0.2.1] - 2025-02-12

### ✨ Nouvelles fonctionnalités

#### Panel Admin (`/admin`)
- **Gestion complète des badges**
  - Création de badges personnalisés avec icône, couleur, description
  - Attribution manuelle de badges à n'importe quel utilisateur
  - Suppression des badges custom
  - Liste complète des badges organisés par catégorie (Rang, Succès, Spécial, Custom)
  - Nettoyage nucléaire : supprime tous les badges de rang et les recrée proprement
  
- **Synchronisation automatique des badges**
  - Bouton "Synchroniser tous les badges" pour mettre à jour les attributions
  - Attribution automatique des badges de rang selon la classe actuelle
  - Retrait automatique si l'utilisateur rétrograde
  - Condition : minimum 1 partie jouée pour recevoir un badge de rang

- **Badges Top 1**
  - `� Top 1 Solo Mondial` (vert) - attribué au joueur avec le plus haut Elo solo
  - `🔥 Top 1 Multi Mondial` (rouge) - attribué au joueur avec le plus haut Elo multijoueur
  - Mise à jour automatique lors de la synchronisation

- **Gestion des bannières personnalisées**
  - Upload de bannières avec vignettes
  - Activation/désactivation des bannières
  - Suppression des bannières
  - Marquage Premium/Gratuit

- **Liste des utilisateurs**
  - Affichage de tous les utilisateurs avec leurs stats
  - Export CSV des données utilisateurs
  - Classement Elo solo et multijoueur

- **Modification Elo**
  - Modification directe de l'Elo solo et multijoueur
  - Accès réservé à l'administrateur (noe.barneron@gmail.com)

#### Page Profil (`/profile`)
- **Onglet Bannière**
  - Choix entre dégradés prédéfinis et bannières personnalisées uploadées par l'admin
  - Sélection de jusqu'à 3 badges à afficher sur la bannière
  - Aperçu avec avatar, nom, rang et Elo sur la bannière custom
  - Bouton Sauvegarder (plus d'auto-save)
  - Aperçu en temps réel avec overlay des informations utilisateur

- **Onglet Paramètres fonctionnels**
  - Mode sombre (utilise `useTheme`)
  - Effets sonores (synchronisés avec `useUserPreferences`)
  - Animations activables/désactivables
  - Timer visible/masqué pendant les tests
  - Suppression de la section notifications email

- **Couronnes Top 1 sur l'avatar**
  - 👑 verte = Top 1 Solo Mondial
  - 👑 rouge = Top 1 Multi Mondial

- **Bouton Admin**
  - Icône couronne 👑 visible uniquement pour l'admin
  - Redirection directe vers `/admin`

### 🔧 Corrections
- Suppression de l'onglet Admin factice dans le profil (remplacé par un lien)
- Correction de l'auto-save qui rafraîchissait la page à chaque clic
- Synchronisation du `SoundProvider` avec les préférences utilisateur
- Ajout de `credentials: 'include'` sur toutes les requêtes API admin
- Correction des icônes de badges en double (S+, Expert A+)
- Correction de l'affichage des bannières custom dans le profil
- Correction erreur `_count.users` undefined dans l'admin

### 🎨 UI/UX
- Interface admin complète et fonctionnelle
- Groupement des badges par catégorie avec optgroups
- Indicateur "Modifications non sauvegardées" sur l'onglet Bannière
- Bouton Annuler pour réinitialiser les changements
- Overlay des informations utilisateur sur les bannières custom

---

## [0.2.0] - Versions précédentes
- Système de badges de rang (F- à S+)
- Système de badges d'accomplissements
- Classements solo et multijoueur
- Système Elo avec calcul de rang
- Tests chronométrés
- Mode multijoueur
- Cours pédagogiques
- Système d'amitié et messages
- Bannières personnalisées (admin)
