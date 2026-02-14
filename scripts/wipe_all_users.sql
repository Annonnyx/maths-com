-- Script SQL complet pour supprimer TOUS les users et leurs données liées
-- Ordre : tables enfants vers tables parents (respect des FK)
-- 1. Tables liées aux tests/questions
DELETE FROM questions;
DELETE FROM tests;

-- 2. Tentatives d'exercices
DELETE FROM exercise_attempts;

-- 3. Statistiques
DELETE FROM statistics;
DELETE FROM multiplayer_statistics;

-- 4. Badges utilisateurs
DELETE FROM user_badges;

-- 5. Relations sociales
DELETE FROM friendships;
DELETE FROM messages;

-- 6. Multiplayer
DELETE FROM multiplayer_questions;
DELETE FROM multiplayer_games;

-- 7. Challenges (celle qui manquait !)
DELETE FROM challenges;

-- 8. Bannières custom (créées par des users)
DELETE FROM custom_banners;

-- 9. Enfin, les users
DELETE FROM users;

-- 10. Activation RLS sur les tables principales (optionnel mais recommandé)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE _prisma_migrations ENABLE ROW LEVEL SECURITY;

-- Pas besoin de créer des policies pour l'instant (vous utilisez Prisma côté serveur)
-- Mais RLS bloque par défaut tout accès via PostgREST/API Supabase publique
