-- Ajout du système de demande pour rejoindre une classe

-- Table pour les demandes d'adhésion à une classe
CREATE TABLE IF NOT EXISTS class_join_requests (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    student_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'refused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_class_join_requests_student_id ON class_join_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_class_join_requests_teacher_id ON class_join_requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_join_requests_status ON class_join_requests(status);

-- Ajout de la colonne accept_join_requests dans la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS accept_join_requests BOOLEAN DEFAULT true;

-- Activer RLS sur la nouvelle table
ALTER TABLE class_join_requests ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour class_join_requests
CREATE POLICY class_join_requests_own ON class_join_requests
    FOR ALL
    USING (student_id = auth.uid()::text OR teacher_id = auth.uid()::text)
    WITH CHECK (student_id = auth.uid()::text OR teacher_id = auth.uid()::text);

-- Politique pour que les professeurs puissent voir les demandes pour leur classe
CREATE POLICY class_join_requests_teacher_view ON class_join_requests
    FOR SELECT
    USING (teacher_id = auth.uid()::text);

-- Politique pour que les étudiants puissent voir leurs propres demandes
CREATE POLICY class_join_requests_student_view ON class_join_requests
    FOR SELECT
    USING (student_id = auth.uid()::text);

-- Politique pour que les étudiants puissent créer des demandes
CREATE POLICY class_join_requests_student_insert ON class_join_requests
    FOR INSERT
    WITH CHECK (student_id = auth.uid()::text);

-- Politique pour que les professeurs puissent mettre à jour les demandes
CREATE POLICY class_join_requests_teacher_update ON class_join_requests
    FOR UPDATE
    USING (teacher_id = auth.uid()::text)
    WITH CHECK (teacher_id = auth.uid()::text);

-- Politique pour que les professeurs puissent supprimer les demandes
CREATE POLICY class_join_requests_teacher_delete ON class_join_requests
    FOR DELETE
    USING (teacher_id = auth.uid()::text);
