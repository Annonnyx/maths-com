-- Final verification of question storage in the correct Supabase database
-- Run this in your Supabase dashboard

-- 1. Check structure of the main questions table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'questions' 
   AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Sample data from questions table
SELECT 
    question,
    answer,
    type,
    difficulty,
    created_at::date as created_date
FROM questions 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check multiplayer questions structure
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'multiplayer_questions' 
   AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Sample multiplayer questions
SELECT 
    question,
    answer,
    type,
    difficulty,
    created_at::date as created_date
FROM multiplayer_questions 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Count total questions
SELECT 
    'questions' as table_name,
    COUNT(*) as total_count
FROM questions
UNION ALL
SELECT 
    'multiplayer_questions' as table_name,
    COUNT(*) as total_count
FROM multiplayer_questions;

-- 6. Check if questions contain algorithmic patterns
SELECT 
    question,
    CASE 
        WHEN question LIKE '%?%' THEN 'Contains placeholder'
        WHEN question LIKE '%{%' THEN 'Contains template'
        WHEN question LIKE '%x%' OR question LIKE '%y%' THEN 'Contains variable'
        WHEN question ~ '[0-9]+\s*[+\-×÷]\s*[0-9]+' THEN 'Math expression'
        ELSE 'Other format'
    END as question_type
FROM questions 
LIMIT 10;
