-- Migration fix for existing Discord link tables
-- This file handles the case where tables already exist

-- Check if link_codes table exists and has the correct structure
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'link_codes' AND column_name = 'used'
    ) THEN
        ALTER TABLE link_codes ADD COLUMN used BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Create indexes if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'link_codes' AND indexname = 'idx_link_codes_code'
    ) THEN
        CREATE INDEX idx_link_codes_code ON link_codes(code);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'link_codes' AND indexname = 'idx_link_codes_discord_user_id'
    ) THEN
        CREATE INDEX idx_link_codes_discord_user_id ON link_codes(discord_user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'link_codes' AND indexname = 'idx_link_codes_expires_at'
    ) THEN
        CREATE INDEX idx_link_codes_expires_at ON link_codes(expires_at);
    END IF;
END $$;

-- Check if user_discord_links table exists and has the correct structure
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_discord_links' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE user_discord_links ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Create indexes if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_discord_links' AND indexname = 'idx_user_discord_links_supabase_user_id'
    ) THEN
        CREATE INDEX idx_user_discord_links_supabase_user_id ON user_discord_links(supabase_user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_discord_links' AND indexname = 'idx_user_discord_links_discord_user_id'
    ) THEN
        CREATE INDEX idx_user_discord_links_discord_user_id ON user_discord_links(discord_user_id);
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE link_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discord_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can insert link codes" ON link_codes;
DROP POLICY IF EXISTS "Anyone can read link codes" ON link_codes;
DROP POLICY IF EXISTS "Anyone can update link codes" ON link_codes;

DROP POLICY IF EXISTS "Users can view their own Discord links" ON user_discord_links;
DROP POLICY IF EXISTS "Users can insert their own Discord links" ON user_discord_links;
DROP POLICY IF EXISTS "Users can update their own Discord links" ON user_discord_links;

-- Recreate policies
CREATE POLICY "Anyone can insert link codes" ON link_codes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read link codes" ON link_codes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update link codes" ON link_codes
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own Discord links" ON user_discord_links
    FOR SELECT USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert their own Discord links" ON user_discord_links
    FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update their own Discord links" ON user_discord_links
    FOR UPDATE USING (auth.uid() = supabase_user_id);

-- Create cleanup function if it doesn't exist
CREATE OR REPLACE FUNCTION clean_expired_link_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM link_codes 
    WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;
