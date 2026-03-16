-- Diagnostic SQL to find what tables actually exist in your database
-- Run this in your Supabase dashboard

-- 1. List ALL tables in your database
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Look specifically for any question-related tables
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name LIKE '%question%' 
   OR table_name LIKE '%game%'
   OR table_name LIKE '%assignment%'
   AND table_schema = 'public'
ORDER BY table_name, column_name;

-- 3. Check if there are any tables with similar names
SELECT table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (
    table_name LIKE '%question%' 
    OR table_name LIKE '%game%' 
    OR table_name LIKE '%assignment%'
    OR table_name LIKE '%session%'
    OR table_name LIKE '%test%'
  )
ORDER BY table_name;
