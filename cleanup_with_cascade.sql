-- Nettoyer avec CASCADE pour supprimer les dépendances RLS

-- Friendships : supprimer avec CASCADE (politiques RLS)
ALTER TABLE friendships DROP COLUMN IF EXISTS user1id CASCADE;
ALTER TABLE friendships DROP COLUMN IF EXISTS user2id CASCADE;
ALTER TABLE friendships DROP COLUMN IF EXISTS createdat CASCADE;
ALTER TABLE friendships DROP COLUMN IF EXISTS updatedat CASCADE;

-- Statistics : supprimer snake_case avec CASCADE
ALTER TABLE statistics DROP COLUMN IF EXISTS userid CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS totaltests CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS totalquestions CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS totalcorrect CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS totaltime CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS averagescore CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS averagetime CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS additiontests CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS additioncorrect CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS additiontotal CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS subtractiontests CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS subtractioncorrect CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS subtractiontotal CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS multiplicationtests CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS multiplicationcorrect CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS multiplicationtotal CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS divisiontests CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS divisioncorrect CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS divisiontotal CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS powertests CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS powercorrect CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS powertotal CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS roottests CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS rootcorrect CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS roottotal CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS factorizationtests CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS factorizationcorrect CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS factorizationtotal CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS weakpoints CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS elohistory CASCADE;
ALTER TABLE statistics DROP COLUMN IF EXISTS updatedat CASCADE;

-- Teacher_requests : supprimer snake_case avec CASCADE
ALTER TABLE teacher_requests DROP COLUMN IF EXISTS userid CASCADE;
ALTER TABLE teacher_requests DROP COLUMN IF EXISTS createdat CASCADE;
ALTER TABLE teacher_requests DROP COLUMN IF EXISTS updatedat CASCADE;

-- Multiplayer_games : supprimer snake_case
ALTER TABLE multiplayer_games DROP COLUMN IF EXISTS gametype CASCADE;
ALTER TABLE multiplayer_games DROP COLUMN IF EXISTS timecontrol CASCADE;
ALTER TABLE multiplayer_games DROP COLUMN IF EXISTS questioncount CASCADE;
ALTER TABLE multiplayer_games DROP COLUMN IF EXISTS difficulty CASCADE;

SELECT 'Nettoyage CASCADE terminé - RLS supprimé aussi' as status;
