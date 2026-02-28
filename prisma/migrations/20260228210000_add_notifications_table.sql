-- Création de la table centrale de notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'challenge', 'message', 'class_request', 'class_accepted', 'teacher_request_approved', 'discord_linked')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sender_id TEXT,
    sender_name TEXT,
    sender_avatar_url TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Activer RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY notifications_own ON notifications
    FOR ALL
    USING (user_id = auth.uid()::text)
    WITH CHECK (user_id = auth.uid()::text);

-- Politique pour les notifications système (sender_id = NULL)
CREATE POLICY notifications_system ON notifications
    FOR ALL
    USING (user_id = auth.uid()::text OR (sender_id IS NULL AND user_id = auth.uid()::text))
    WITH CHECK (user_id = auth.uid()::text OR (sender_id IS NULL AND user_id = auth.uid()::text));
