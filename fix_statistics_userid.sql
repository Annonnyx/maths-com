-- Supprimer et recréer la colonne userId avec les bonnes contraintes
ALTER TABLE statistics DROP COLUMN IF EXISTS "userId";
ALTER TABLE statistics ADD COLUMN "userId" TEXT NOT NULL;
ALTER TABLE statistics ADD CONSTRAINT statistics_userId_key UNIQUE ("userId");

-- Créer la foreign key vers users
ALTER TABLE statistics ADD CONSTRAINT statistics_userId_fkey 
FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
