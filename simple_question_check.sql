-- Simple PostgreSQL-compatible SQL to verify question storage
-- Run this in your Supabase dashboard

-- 1. Check what question-related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%question%' 
   OR table_name LIKE '%kahoot%'
   OR table_name LIKE '%assignment%'
ORDER BY table_name;

-- 2. Check sample questions from kahoot_questions
SELECT 
    question,
    answer,
    type,
    created_at::date as created_date
FROM kahoot_questions 
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

-- 4. Count total questions
SELECT 
    'kahoot_questions' as table_name,
    COUNT(*) as total_count
FROM kahoot_questions
UNION ALL
SELECT 
    'assignment_questions' as table_name,
    COUNT(*) as total_count
FROM assignment_questions;
