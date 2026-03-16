-- SQL Query to verify question storage mechanism in Supabase
-- This will help us understand if questions are generated algorithmically or stored in memory

-- 1. Check if there are any pre-stored question templates
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('solo_questions', 'multiplayer_questions', 'kahoot_questions', 'assignment_questions')
    AND column_name IN ('question', 'answer', 'type', 'difficulty')
ORDER BY table_name, column_name;

-- 2. Check sample data from solo_questions to see if questions are stored or generated
SELECT 
    id,
    type,
    difficulty,
    question,
    answer,
    explanation,
    created_at::date as created_date
FROM solo_questions 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if there are any question patterns or templates stored
SELECT 
    type,
    difficulty,
    COUNT(*) as question_count,
    COUNT(DISTINCT question) as unique_questions,
    COUNT(DISTINCT LEFT(question, 20)) as unique_patterns
FROM solo_questions 
GROUP BY type, difficulty
ORDER BY type, difficulty;

-- 4. Verify if questions contain algorithmic patterns (like variables, placeholders)
SELECT 
    question,
    CASE 
        WHEN question LIKE '%?%' THEN 'Contains placeholder'
        WHEN question LIKE '%{%' THEN 'Contains template'
        WHEN question LIKE '%x%' THEN 'Contains variable'
        ELSE 'Static question'
    END as question_type
FROM solo_questions 
LIMIT 10;

-- 5. Check multiplayer questions structure
SELECT 
    id,
    type,
    difficulty,
    question,
    answer,
    created_at::date as created_date
FROM multiplayer_questions 
ORDER BY created_at DESC 
LIMIT 3;

-- 6. Count total questions by type to understand storage scale
SELECT 
    'solo_questions' as table_name,
    COUNT(*) as total_count
FROM solo_questions
UNION ALL
SELECT 
    'multiplayer_questions' as table_name,
    COUNT(*) as total_count
FROM multiplayer_questions
UNION ALL
SELECT 
    'kahoot_questions' as table_name,
    COUNT(*) as total_count
FROM kahoot_questions;
