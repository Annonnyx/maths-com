-- SQL Migration to rename Kahoot tables to appropriate maths application names
-- Run this in your Supabase dashboard

-- 1. Rename KahootQuestion table to GameQuestion (more appropriate)
ALTER TABLE kahoot_questions RENAME TO game_questions;

-- 2. Update any foreign key references if needed
-- (This will be handled by Prisma migrate)

-- 3. Verify the rename worked
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%question%' 
   OR table_name LIKE '%game%'
ORDER BY table_name;

-- 4. Check sample data from the renamed table
SELECT 
    question,
    answer,
    type,
    created_at::date as created_date
FROM game_questions 
ORDER BY created_at DESC 
LIMIT 5;
