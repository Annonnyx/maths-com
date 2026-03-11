# AUDIT COMPLET DES APIS ET TABLES
*Date: 11/03/2026*

## 📋 MÉTHODOLOGIE
- Scan de tous les fichiers TypeScript/JavaScript
- Identification des routes API et tables Prisma
- Analyse des doublons fonctionnels
- Standardisation vers l'API la plus utilisée

---

## 🗂️ ROUTES API TROUVÉES

### Authentification
- `/api/auth/[...nextauth]` - Authentification NextAuth principale
- `/api/auth/check` - Vérification session utilisateur
- `/api/auth/refresh` - Rafraîchissement token
- `/api/auth/register` - Inscription utilisateur
- `/api/auth/session-direct` - Session directe
- `/api/auth/session-test` - Test session

### Utilisateurs & Profils
- `/api/users` - Gestion utilisateurs (CRUD)
- `/api/users/[id]` - Profil utilisateur spécifique
- `/api/users/username/[username]/public` - Profil public utilisateur
- `/api/users/search` - Recherche utilisateurs
- `/api/users/onboarding-complete` - Finalisation onboarding
- `/api/profile` - Profil utilisateur (alternative)

### Statistiques & Performance
- `/api/stats/summary` - Résumé statistiques globales
- `/api/stats/elo-history` - Historique ELO
- `/api/students/stats` - Stats étudiants

### Jeux & Tests
- `/api/test` - Test solo
- `/api/tests` - Tests multiples
- `/api/tests/[id]/complete` - Finaliser test
- `/api/simple-test` - Test simplifié
- `/api/game/create` - Créer partie
- `/api/game/start` - Démarrer partie
- `/api/game/join` - Rejoindre partie
- `/api/game/answer` - Répondre question
- `/api/game/validate-code` - Valider code partie
- `/api/game/question/[sessionId]` - Question spécifique
- `/api/game/session/[sessionId]` - Session de jeu

### Multijoueur
- `/api/multiplayer` - Multijoueur principal
- `/api/multiplayer/history` - Historique multijoueur
- `/api/multiplayer/clean` - Nettoyage parties
- `/api/multiplayer/clear-all` - Vider toutes parties
- `/api/multiplayer/game/[id]` - Partie spécifique
- `/api/multiplayer/game/[id]/answer` - Réponse partie
- `/api/multiplayer/game/[id]/finish` - Finir partie
- `/api/multiplayer/game/[id]/result` - Résultat partie
- `/api/multiplayer/game/session/[sessionId]` - Session multijoueur
- `/api/multiplayer/game/session/player/[playerId]` - Joueur session
- `/api/multiplayer/join` - Rejoindre multijoueur
- `/api/multiplayer/lobby/[sessionId]` - Lobby multijoueur
- `/api/multiplayer/result/[id]` - Résultat multijoueur

### Groupes & Classes
- `/api/class-groups` - Groupes de classes
- `/api/class-groups/[id]` - Groupe spécifique
- `/api/class-groups/[id]/analytics` - Analytics groupe
- `/api/class-groups/join` - Rejoindre groupe
- `/api/class-groups/my-classes` - Mes classes
- `/api/class-groups/public` - Groupes publics
- `/api/class-assignments` - Devoirs de classe
- `/api/class-members` - Membres de classe
- `/api/class-messages` - Messages de classe
- `/api/class-requests` - Demandes de classe
- `/api/class-requests/[requestId]` - Demande spécifique
- `/api/class-join` - Rejoindre classe
- `/api/class-management` - Gestion classes
- `/api/class-management/[id]` - Classe spécifique
- `/api/class-management/create` - Créer classe
- `/api/classes` - Liste classes

### Social & Communication
- `/api/friends` - Amis
- `/api/messages` - Messages
- `/api/challenges` - Défis
- `/api/notifications` - Notifications
- `/api/social` - Social (alternative)
- `/api/presence` - Présence en ligne

### Assignments & Devoirs
- `/api/assignments/analytics` - Analytics devoirs
- `/api/assignments/share` - Partager devoir
- `/api/assignments/submit` - Soumettre devoir
- `/api/shared-assignment/[code]` - Devoir partagé
- `/api/take-assignment/[id]` - Faire devoir

### Badges & Récompenses
- `/api/badges` - Badges
- `/api/achievements/monthly` - Succès mensuels

### Admin & Modération
- `/api/admin` - Admin principal
- `/api/admin/force-logout` - Forcer déconnexion
- `/api/admin/banners` - Bannières admin
- `/api/admin/cleanup-badges` - Nettoyage badges
- `/api/admin/cleanup-old-games` - Nettoyage parties anciennes
- `/api/admin/delete-user` - Supprimer utilisateur
- `/api/admin/discord` - Admin Discord
- `/api/admin/faq-submissions` - FAQ admin
- `/api/admin/faq-submissions/[id]` - FAQ spécifique
- `/api/admin/give-banner` - Donner bannière
- `/api/admin/init-badges` - Initialiser badges
- `/api/admin/users` - Gestion utilisateurs admin
- `/api/admin/users/[userId]/username` - Username admin

### Tickets & Support
- `/api/tickets` - Tickets support
- `/api/tickets/create` - Créer ticket

### Discord
- `/api/discord/link` - Lien Discord
- `/api/discord/verify-code` - Vérifier code Discord

### Courses & Exercices
- `/api/courses/[id]` - Cours spécifique
- `/api/course-practice` - Exercices de cours
- `/api/exercises/attempts` - Tentatives exercices

### Sitemaps
- `/api/sitemap-com` - Sitemap .com
- `/api/sitemap-fr` - Sitemap .fr

### Divers
- `/api/debug` - Debug
- `/api/session-test` - Test session
- `/api/solo/history` - Historique solo
- `/api/student-profile/[id]` - Profil étudiant

---

## 🗄️ TABLES PRISMA TROUVÉES

### Utilisateurs
- `User` - Utilisateurs principaux
- `SoloStatistics` - Statistiques solo
- `MultiplayerStatistics` - Statistiques multijoueur

### Jeux & Sessions
- `SoloTest` - Tests solo
- `QuestionHistory` - Historique questions
- `MultiplayerGame` - Parties multijoueur
- `GameSession` - Sessions de jeu

### Social
- `Friendship` - Relations d'amitié
- `Challenge` - Défis
- `Message` - Messages
- `Notification` - Notifications

### Classes & Éducation
- `ClassGroup` - Groupes de classes
- `ClassMember` - Membres de classes
- `ClassAssignment` - Devoirs de classe
- `ClassMessage` - Messages de classe
- `ClassRequest` - Demandes de classe

### Badges & Récompenses
- `Badge` - Badges disponibles
- `UserBadge` - Badges utilisateur
- `Achievement` - Succès

### Assignments & Devoirs
- `Assignment` - Devoirs
- `AssignmentSubmission` - Soumissions devoirs
- `SharedAssignment` - Devoirs partagés

### Tickets & Support
- `Ticket` - Tickets support

### Discord
- `DiscordLink` - Liens Discord

### Divers
- `Banner` - Bannières
- `TeacherRequest` - Demandes professeur

---

## 🔍 DOUBLONS IDENTIFIÉS

### APIs avec fonctionnalités similaires :
1. **Profil utilisateur** : `/api/profile` vs `/api/users/[id]`
2. **Social** : `/api/social` vs `/api/friends` + `/api/messages` + `/api/challenges`
3. **Tests** : `/api/test` vs `/api/tests` vs `/api/simple-test`
4. **Multijoueur** : Plusieurs endpoints pour créer/joindre des parties
5. **Classes** : `/api/classes` vs `/api/class-groups` vs `/api/class-management`

### Tables potentiellement redondantes :
À analyser après scan complet...

---

## ⚡ ACTIONS REQUISES

1. **Scanner tous les fichiers** pour trouver les utilisations
2. **Identifier les doublons fonctionnels**
3. **Standardiser vers l'API la plus utilisée**
4. **Mettre à jour les références**

*En cours d'analyse...*
