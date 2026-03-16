-- Comprehensive table check for all schemas in Supabase
-- Run this in your Supabase dashboard

-- 1. Check all schemas
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- 2. Check all tables across all schemas
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY table_schema, table_name;

-- 3. Specifically look for question tables in any schema
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name IN ('question', 'answer', 'type')
ORDER BY table_schema, table_name, column_name;
