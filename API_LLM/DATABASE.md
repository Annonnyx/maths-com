# DATABASE — Référence complète des tables

## 📍 Localisation
- Page : Référence base de données
- Schéma : /prisma/schema.prisma
- Migration : /migration_unified_multiplayer.sql

## 🗄️ Tables communes (solo + multi)

### users
| Description | Table principale des utilisateurs avec champs solo et multi |
|-------------|-----------------------------------------------------------|
| Champs clés | id, email, username, soloElo, multiplayerElo, role, hasCompletedOnboarding |
| Relations | soloStatistics, multiplayerStatistics, soloTests, userBadges, friendships, messages |

### badges
| Description | Badges/achievements que les utilisateurs peuvent débloquer |
|-------------|----------------------------------------------------------|
| Champs clés | id, name, description, icon, category, requirementType, requirementValue |
| Relations | userBadges |

### user_badges
| Description | Association entre utilisateurs et badges (badges obtenus) |
|-------------|----------------------------------------------------------|
| Champs clés | userId, badgeId, earnedAt, awardedById, expiresAt |
| Relations | users, badges |

### custom_banners
| Description | Bannières personnalisées créées par les utilisateurs |
|-------------|----------------------------------------------------|
| Champs clés | id, name, imageUrl, creatorId, isPublic, createdAt |
| Relations | users (creator), users (customBannerId) |

### friendships
| Description | Relations d'amitié entre utilisateurs |
|-------------|--------------------------------------|
| Champs clés | user1Id, user2Id, status, requestedAt, acceptedAt |
| Relations | users (user1), users (user2) |

### messages
| Description | Messagerie interne entre utilisateurs |
|-------------|---------------------------------------|
| Champs clés | senderId, receiverId, content, readAt, createdAt |
| Relations | users (sender), users (receiver) |

### challenges
| Description | Défis entre utilisateurs pour le multijoueur |
|-------------|--------------------------------------------|
| Champs clés | challengerId, challengedId, gameType, status, createdAt |
| Relations | users (challenger), users (challenged) |

### notifications
| Description | Notifications système pour les utilisateurs |
|-------------|--------------------------------------------|
| Champs clés | userId, type, title, message, read, createdAt |
| Relations | users |

### tickets
| Description | Tickets de support technique |
|-------------|------------------------------|
| Champs clés | userId, title, content, status, priority, createdAt |
| Relations | users |

### class_groups
| Description | Groupes de classes pour les professeurs |
|-------------|----------------------------------------|
| Champs clés | id, name, description, teacherId, joinCode, createdAt |
| Relations | users (teacher), classJoinRequests |

### class_join_requests
| Description | Demandes pour rejoindre des groupes de classes |
|-------------|-----------------------------------------------|
| Champs clés | userId, classGroupId, status, requestedAt, processedAt |
| Relations | users, classGroups |

### teacher_requests
| Description | Demandes pour devenir professeur |
|-------------|---------------------------------|
| Champs clés | userId, school, subject, status, createdAt |
| Relations | users |

---

## 🗄️ Tables solo uniquement

### solo_statistics
| Description | Statistiques agrégées du mode solo |
|-------------|-------------------------------------|
| Champs clés | userId, totalTests, totalCorrect, avgTimePerQuestion, currentStreak, bestStreak |
| Relations | users |

### solo_tests
| Description | Historique des tests solo complétés |
|-------------|--------------------------------------|
| Champs clés | userId, totalQuestions, correctAnswers, score, timeTaken, eloBefore, eloAfter |
| Relations | users, soloQuestions |

### solo_questions
| Description | Questions individuelles des tests solo |
|-------------|----------------------------------------|
| Champs clés | testId, question, answer, type, difficulty, orderIndex, userAnswer, isCorrect |
| Relations | soloTests |

### exercise_attempts
| Description | Tentatives d'exercices pratiques |
|-------------|-----------------------------------|
| Champs clés | userId, exerciseId, attempts, bestScore, lastAttemptAt |
| Relations | users |

### question_history
| Description | Historique des questions répondues par l'utilisateur |
|-------------|---------------------------------------------------|
| Champs clés | userId, question, answer, isCorrect, responseTime, category |
| Relations | users |

---

## 🗄️ Tables multijoueur uniquement

### multiplayer_statistics
| Description | Statistiques agrégées du mode multijoueur |
|-------------|------------------------------------------|
| Champs clés | userId, totalGames, totalWins, totalLosses, currentStreak, bestStreak |
| Relations | users |

### multiplayer_games
| Description | Parties multijoueur (tous modes unifiés) |
|-------------|------------------------------------------|
| Champs clés | player1Id, player2Id, gameType, timeControl, status, player1Score, player2Score |
| Relations | users (player1), users (player2), multiplayerQuestions |

### multiplayer_questions
| Description | Questions des parties multijoueur |
|-------------|-----------------------------------|
| Champs clés | gameId, question, answer, type, difficulty, orderIndex |
| Relations | multiplayerGames |

---

## 🔗 Relations entre tables

### Relations principales
```
users (1) → (1) solo_statistics
users (1) → (1) multiplayer_statistics  
users (1) → (*) solo_tests
users (1) → (*) multiplayer_games (player1 ou player2)
users (1) → (*) user_badges
users (1) → (*) friendships
users (1) → (*) messages
users (1) → (*) notifications
users (1) → (*) tickets

solo_tests (1) → (*) solo_questions
multiplayer_games (1) → (*) multiplayer_questions
badges (1) → (*) user_badges
class_groups (1) → (*) class_join_requests
```

### Relations many-to-many
```
users ↔ users (friendships)
users ↔ users (messages)  
users ↔ users (challenges)
```

---

## 🔐 Politiques RLS actives

### users
- **users_own_data** : `auth.uid()::text = id`
- **admin_protected** : Protection admin avec permissions étendues
- **admin_read_all** : Lecture complète pour les admins

### solo_statistics, solo_tests, solo_questions
- **solo_*_own_data** : `auth.uid()::text = user_id`

### multiplayer_statistics, multiplayer_games, multiplayer_questions  
- **multiplayer_*_own_data** : `auth.uid()::text = user_id` ou `auth.uid()::text = player1_id/player2_id`

### badges
- **badges_public_read** : Lecture publique pour tous

### user_badges
- **user_badges_own_data** : `auth.uid()::text = user_id`

---

## 📊 Index créés pour les performances

### Index users
- `idx_users_solo_elo` : `users(solo_elo)`
- `idx_users_multiplayer_elo` : `users(multiplayer_elo)`
- `idx_users_email` : `users(email)`
- `idx_users_username` : `users(username)`
- `idx_users_role` : `users(role)`

### Index solo
- `idx_solo_statistics_user_id` : `solo_statistics(user_id)`
- `idx_solo_tests_user_id` : `solo_tests(user_id)`

### Index multiplayer
- `idx_multiplayer_statistics_user_id` : `multiplayer_statistics(user_id)`
- `idx_multiplayer_games_player1` : `multiplayer_games(player1_id)`
- `idx_multiplayer_games_player2` : `multiplayer_games(player2_id)`
- `idx_multiplayer_games_status` : `multiplayer_games(status)`

### Index communs
- `idx_user_badges_user_id` : `user_badges(user_id)`
- `idx_user_badges_badge_id` : `user_badges(badge_id)`

---

## ⚠️ Champs deprecated (NE PLUS UTILISER)

### Anciens champs remplacés
- `elo` → `soloElo` ou `multiplayerElo`
- `rankClass` → `soloRankClass` ou `multiplayerRankClass`
- `bestElo` → `soloBestElo` ou `multiplayerBestElo`
- `bestRankClass` → `soloBestRankClass` ou `multiplayerBestRankClass`
- `currentStreak` → `soloCurrentStreak` ou `multiplayerCurrentStreak`
- `bestStreak` → `soloBestStreak` ou `multiplayerBestStreak`

### Anciennes tables renommées
- `statistics` → `solo_statistics`
- `tests` → `solo_tests`
- `questions` → `solo_questions`

---

## 🔄 Conventions de nommage strictes

### Préfixes obligatoires
- **solo_** : Tout ce qui concerne uniquement le mode solo
- **multiplayer_** : Tout ce qui concerne uniquement le mode multijoueur
- **Pas de préfixe** : Données communes à tous les modes

### Format des noms
- **Tables SQL** : snake_case (ex: `solo_statistics`)
- **Champs TypeScript** : camelCase (ex: `soloElo`)
- **IDs** : `id` pour clé primaire, `userId` pour clé étrangère

---

## 📝 Notes importantes

### Refactoring multijoueur
- **3 modes unifiés** : ranked 1v1, casual 1v1, group quiz
- **Table unique** `multiplayer_games` avec champ `gameType`
- **Time controls** : bullet (1min), blitz (3min), rapid (5min)

### Séparation solo/multiplayer
- **Champs séparés** dans la table `users` pour éviter toute confusion
- **Tables dédiées** pour les statistiques et l'historique
- **ELO indépendants** : soloElo ≠ multiplayerElo

### Performance
- **Index optimisés** pour les requêtes fréquentes (leaderboards, recherche)
- **RLS policies** efficaces avec les bons index
- **Relations bien définies** pour éviter les N+1 queries

### Sécurité
- **Protection admin** complète via RLS + règles PostgreSQL
- **Isolation des données** par utilisateur
- **Pas d'accès direct** aux tables sans authentification

---

**Cette documentation est LA référence absolue pour la base de données. Toute modification doit être répercutée ici.**
