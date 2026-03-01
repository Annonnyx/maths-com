-- Dernières colonnes manquantes pour le modèle User Prisma
ALTER TABLE users ADD COLUMN IF NOT EXISTS "bestStreak" INTEGER DEFAULT 0;

-- Vérifier que tout est là
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN (
    'id', 'email', 'username', 'password', 'createdAt', 'updatedAt', 
    'displayName', 'avatarUrl', 'classe', 'birthYear', 'bannerUrl', 
    'selectedBadgeIds', 'customBannerId', 'isAdmin', 'isTeacher', 
    'school', 'subject', 'acceptJoinRequests', 'elo', 'rankClass', 
    'bestElo', 'bestRankClass', 'hasCompletedOnboarding', 'currentStreak', 
    'bestStreak', 'lastTestDate', 'isOnline', 'lastSeenAt', 'discordId', 
    'discordUsername', 'discordLinkedAt', 'discordLinkCode'
)
ORDER BY column_name;
