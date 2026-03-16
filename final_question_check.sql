-- Final SQL to verify question storage (no kahoot references)
-- Run this in your Supabase dashboard

-- 1. Check what question-related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%question%' 
   OR table_name LIKE '%game%'
   OR table_name LIKE '%assignment%'
ORDER BY table_name;

-- 2. Check sample questions from game_questions (renamed from kahoot_questions)
SELECT 
    question,
    answer,
    type,
    difficulty,
    created_at::date as created_date
FROM game_questions 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check sample questions from assignment_questions  
SELECT 
    question,
    answer,
    type,
    difficulty,
    created_at::date as created_date
FROM assignment_questions 
ORDER BY created_at DESC 
LIMIT 3;

-- 4. Check multiplayer questions
SELECT 
    question,
    answer,
    type,
    difficulty,
    created_at::date as created_date
FROM multiplayer_questions 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Count total questions by table
SELECT 
    'game_questions' as table_name,
    COUNT(*) as total_count
FROM game_questions
UNION ALL
SELECT 
    'assignment_questions' as table_name,
    COUNT(*) as total_count
FROM assignment_questions
UNION ALL
SELECT 
    'multiplayer_questions' as table_name,
    COUNT(*) as total_count
FROM multiplayer_questions;
