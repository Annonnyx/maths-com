-- Ajouter les colonnes manquantes à la table QuestionHistory
-- À exécuter sur Supabase SQL Editor

-- Vérifier si la table existe d'abord
DO $$
BEGIN
    -- Ajouter time_spent si manquant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QuestionHistory' AND column_name = 'time_spent') THEN
        ALTER TABLE "QuestionHistory" ADD COLUMN time_spent INTEGER DEFAULT 0;
    END IF;

    -- Ajouter difficulty si manquant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QuestionHistory' AND column_name = 'difficulty') THEN
        ALTER TABLE "QuestionHistory" ADD COLUMN difficulty TEXT DEFAULT 'mixed';
    END IF;

    -- Ajouter subject si manquant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QuestionHistory' AND column_name = 'subject') THEN
        ALTER TABLE "QuestionHistory" ADD COLUMN subject TEXT DEFAULT 'maths';
    END IF;

    -- Ajouter type si manquant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QuestionHistory' AND column_name = 'type') THEN
        ALTER TABLE "QuestionHistory" ADD COLUMN type TEXT DEFAULT 'calculation';
    END IF;

    -- Ajouter eloAtMoment si manquant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'QuestionHistory' AND column_name = 'eloAtMoment') THEN
        ALTER TABLE "QuestionHistory" ADD COLUMN eloAtMoment INTEGER DEFAULT 0;
    END IF;
END $$;
