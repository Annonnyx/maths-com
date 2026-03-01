-- Diagnostic complet : vérifier quelles colonnes manquent vraiment
SELECT 
    'users' as table_name,
    'id, email, username, password, createdAt, updatedAt, displayName, avatarUrl, classe, birthYear, bannerUrl, selectedBadgeIds, customBannerId, isAdmin, isTeacher, school, subject, acceptJoinRequests, elo, rankClass, bestElo, bestRankClass, hasCompletedOnboarding, currentStreak, bestStreak, lastTestDate, isOnline, lastSeenAt, discordId, discordUsername, discordLinkedAt, discordLinkCode' as required_columns
UNION ALL
SELECT 
    'statistics' as table_name,
    'id, userId, totalTests, totalQuestions, totalCorrect, totalTime, averageScore, averageTime, additionTests, additionCorrect, additionTotal, subtractionTests, subtractionCorrect, subtractionTotal, multiplicationTests, multiplicationCorrect, multiplicationTotal, divisionTests, divisionCorrect, divisionTotal, powerTests, powerCorrect, powerTotal, rootTests, rootCorrect, rootTotal, factorizationTests, factorizationCorrect, factorizationTotal, weakPoints, eloHistory, updatedAt' as required_columns
UNION ALL
SELECT 
    'friendships' as table_name,
    'id, user1Id, user2Id, status, createdAt, updatedAt' as required_columns
UNION ALL
SELECT 
    'multiplayer_games' as table_name,
    'id, player1Id, player2Id, status, gametype, timecontrol, timelimit, player1elo, player2elo, player1score, player2score, winner, startedat, finishedat, createdat, questioncount, difficulty' as required_columns
UNION ALL
SELECT 
    'teacher_requests' as table_name,
    'id, userId, name, email, school, subject, message, status, createdAt, updatedAt' as required_columns;

-- Vérifier les colonnes existantes
SELECT 
    table_name,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as existing_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'statistics', 'friendships', 'multiplayer_games', 'teacher_requests')
GROUP BY table_name
ORDER BY table_name;
