-- Script de nettoyage de la base de données
-- Garde les utilisateurs et la configuration système, mais reset toute la progression

-- 1. Reset la progression des utilisateurs (ELO, niveaux, streaks)
UPDATE users SET
  elo = 400,
  rankClass = 'F-',
  bestElo = 400,
  bestRankClass = 'F-',
  multiplayerElo = 400,
  multiplayerRankClass = 'F-',
  bestMultiplayerElo = 400,
  bestMultiplayerRankClass = 'F-',
  additionLevel = 1,
  subtractionLevel = 0,
  multiplicationLevel = 0,
  divisionLevel = 0,
  powerLevel = 0,
  rootLevel = 0,
  factorizationLevel = 0,
  currentStreak = 0,
  bestStreak = 0,  
  lastTestDate = NULL,
  multiplayerGames = 0,
  multiplayerWins = 0,
  multiplayerLosses = 0,
  hasCompletedOnboarding = false;

-- 2. Supprimer tous les badges attribués aux utilisateurs
DELETE FROM "UserBadge";

-- 3. Supprimer tout l'historique des tests
DELETE FROM "Test";

-- 4. Supprimer toutes les questions des tests
DELETE FROM "Question";

-- 5. Supprimer toutes les tentatives d'exercices
DELETE FROM "ExerciseAttempt";

-- 6. Supprimer toutes les parties multijoueurs
DELETE FROM "MultiplayerGame";

-- 7. Reset les statistiques générales
UPDATE "Statistics" SET
  totalTests = 0,
  totalQuestions = 0,
  totalCorrect = 0,
  totalTime = 0,
  averageScore = 0,
  averageTime = 0,
  additionTests = 0,
  subtractionTests = 0,
  multiplicationTests = 0,
  divisionTests = 0,
  powerTests = 0,
  rootTests = 0,
  factorizationTests = 0,
  geometryTests = 0,
  deltaTests = 0,
  quadraticTests = 0,
  lastTestDate = NULL;

-- 8. Reset les statistiques multijoueurs
UPDATE "MultiplayerStatistics" SET
  totalGames = 0,
  totalWins = 0,
  totalLosses = 0,
  totalScore = 0,
  averageScore = 0,
  bestScore = 0,
  currentStreak = 0,
  bestStreak = 0,
  lastGameDate = NULL;

-- 9. Supprimer tous les messages (optionnel - décommentez si vous voulez)
-- DELETE FROM "Message";

-- 10. Supprimer tous les défis (optionnel - décommentez si vous voulez)
-- DELETE FROM "Challenge";

-- 11. Supprimer toutes les amitiés (optionnel - décommentez si vous voulez recommencer de zéro)
-- DELETE FROM "Friendship";

-- Note: Les tables suivantes sont conservées intactes :
-- - users (comptes utilisateur gardés, progression reset)
-- - badges (définitions des badges)
-- - courses (contenu des cours)
-- - custom_banners (bannières personnalisées)
