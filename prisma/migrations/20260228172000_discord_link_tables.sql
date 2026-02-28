-- Create table for Discord link codes
CREATE TABLE link_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discord_user_id TEXT NOT NULL,
    code VARCHAR(6) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- Create index for faster lookups
CREATE INDEX idx_link_codes_code ON link_codes(code);
CREATE INDEX idx_link_codes_discord_user_id ON link_codes(discord_user_id);
CREATE INDEX idx_link_codes_expires_at ON link_codes(expires_at);

-- Create table for user Discord links
CREATE TABLE user_discord_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supabase_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    discord_user_id TEXT NOT NULL,
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(supabase_user_id),
    UNIQUE(discord_user_id)
);

-- Create indexes for user_discord_links
CREATE INDEX idx_user_discord_links_supabase_user_id ON user_discord_links(supabase_user_id);
CREATE INDEX idx_user_discord_links_discord_user_id ON user_discord_links(discord_user_id);

-- RLS policies for link_codes
ALTER TABLE link_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert link codes" ON link_codes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read link codes" ON link_codes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update link codes" ON link_codes
    FOR UPDATE USING (true);

-- RLS policies for user_discord_links
ALTER TABLE user_discord_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Discord links" ON user_discord_links
    FOR SELECT USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert their own Discord links" ON user_discord_links
    FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update their own Discord links" ON user_discord_links
    FOR UPDATE USING (auth.uid() = supabase_user_id);

-- Function to clean expired link codes
CREATE OR REPLACE FUNCTION clean_expired_link_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM link_codes 
    WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Optional: Schedule cleanup (if you have pg_cron installed)
-- SELECT cron.schedule('clean-expired-link-codes', '0 */6 * * *', 'SELECT clean_expired_link_codes();');
