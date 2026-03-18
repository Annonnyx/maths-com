-- Ajouter la colonne role dans profiles si elle n'existe pas déjà
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(10) DEFAULT 'student' 
CHECK (role IN ('student', 'teacher', 'admin', 'parent'));

-- Créer la table des liens parent-enfant
CREATE TABLE IF NOT EXISTS parent_child_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(parent_id, child_id)
);

-- Créer la table des codes d'invitation parent
CREATE TABLE IF NOT EXISTS parent_invite_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    code VARCHAR(8) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_parent_child_links_parent_id ON parent_child_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_links_child_id ON parent_child_links(child_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_links_active ON parent_child_links(is_active);
CREATE INDEX IF NOT EXISTS idx_parent_invite_codes_code ON parent_invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_parent_invite_codes_child_id ON parent_invite_codes(child_id);
