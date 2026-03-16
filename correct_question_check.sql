-- Corrected SQL to check actual table names (no kahoot references)
-- Run this in your Supabase dashboard

-- 1. Check what question-related tables actually exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%question%' 
   OR table_name LIKE '%game%'
   OR table_name LIKE '%assignment%'
   OR table_name LIKE '%session%'
ORDER BY table_name;

-- 2. Check if there's a game_sessions table
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'game_sessions' 
   AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check for any table that stores questions with different naming
SELECT table_name, column_name
FROM information_schema.columns 
WHERE column_name IN ('question', 'answer', 'type', 'difficulty')
ORDER BY table_name, column_name;

-- 4. Sample data from whatever question table exists
-- This will show the actual table names that exist
SELECT 
    'Checking available tables...' as status;
