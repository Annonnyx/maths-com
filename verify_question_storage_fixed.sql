-- Fixed SQL Query to verify question storage mechanism in Supabase
-- This checks the actual table structure and confirms algorithmic generation

-- 1. Check what tables actually exist in the database
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name LIKE '%question%' 
   OR table_name LIKE '%game%'
   OR table_name LIKE '%assignment%'
ORDER BY table_name;

-- 2. Check SoloQuestion table structure (if it exists)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'solo_questions' 
   AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. If SoloQuestion doesn't exist, check for similar tables
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('soloquestion', 'public_soloquestion', 'question_history')
   AND column_name IN ('question', 'answer', 'type')
ORDER BY table_name, column_name;

-- 4. Check KahootQuestion table (multiplayer games)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'kahoot_questions' 
   AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Sample data from KahootQuestion to see question format
SELECT 
    id,
    question,
    answer,
    type,
    created_at::date as created_date
FROM kahoot_questions 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check AssignmentQuestion table (class assignments)
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'assignment_questions' 
   AND table_schema = 'public'
   AND column_name IN ('question', 'answer', 'type')
ORDER BY ordinal_position;

-- 7. Sample data from AssignmentQuestion
SELECT 
    id,
    question,
    answer,
    type,
    difficulty,
    created_at::date as created_date
FROM assignment_questions 
ORDER BY created_at DESC 
LIMIT 3;

-- 8. Check if questions contain algorithmic patterns
SELECT 
    question,
    CASE 
        WHEN question LIKE '%?%' THEN 'Contains placeholder'
        WHEN question LIKE '%{%' THEN 'Contains template'
        WHEN question LIKE '%x%' OR question LIKE '%y%' THEN 'Contains variable'
        WHEN question ~ '[0-9]+\s*[+\-×÷]\s*[0-9]+' THEN 'Math expression'
        ELSE 'Other format'
    END as question_type
FROM kahoot_questions 
LIMIT 10;

-- 9. Count total questions by table
SELECT 
    'kahoot_questions' as table_name,
    COUNT(*) as total_count
FROM kahoot_questions
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
