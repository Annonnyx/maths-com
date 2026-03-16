-- Simple command to see ALL tables in your Supabase database
-- Run this in your Supabase dashboard

SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
