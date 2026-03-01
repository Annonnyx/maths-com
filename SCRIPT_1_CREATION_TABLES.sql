-- ============================================
-- SCRIPT 1: CRÉATION DES TABLES MANQUANTES
-- ============================================
-- Ce script est idempotent et peut être exécuté plusieurs fois

-- ============================================
-- TABLE USERS (si elle n'existe pas)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (encode(gen_random_bytes(16), 'hex')),
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Profile (COMMUN)
  display_name TEXT,
  avatar_url TEXT,
  classe TEXT, -- Classe scolaire calculée (CP, CE1, CE2, CM1, CM2, 6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Terminale)
  birth_year INTEGER, -- Année de naissance pour calculer la classe
  
  -- Banner customization (COMMUN)
  banner_url TEXT, -- URL de la bannière personnalisée
  selected_badge_ids TEXT, -- JSON array of up to 3 badge IDs to display on banner
  custom_banner_id TEXT, -- Reference to custom banner if using one
  
  -- Admin flags (COMMUN)
  is_admin BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user',
  
  -- Teacher information (COMMUN)
  is_teacher BOOLEAN DEFAULT FALSE,
  school TEXT,
  subject TEXT,
  accept_join_requests BOOLEAN DEFAULT TRUE,
  
  -- SOLO Ranking System
  solo_elo INTEGER DEFAULT 400,
  solo_rank_class TEXT DEFAULT 'F-',
  solo_best_elo INTEGER DEFAULT 400,
  solo_best_rank_class TEXT DEFAULT 'F-',
  solo_current_streak INTEGER DEFAULT 0,
  solo_best_streak INTEGER DEFAULT 0,
  last_test_date TIMESTAMP WITH TIME ZONE,
  
  -- MULTIPLAYER Ranking System
  multiplayer_elo INTEGER DEFAULT 400,
  multiplayer_rank_class TEXT DEFAULT 'F-',
  multiplayer_best_elo INTEGER DEFAULT 400,
  multiplayer_best_rank_class TEXT DEFAULT 'F-',
  multiplayer_current_streak INTEGER DEFAULT 0,
  multiplayer_best_streak INTEGER DEFAULT 0,
  
  -- Onboarding
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLES COMMUNES
-- ============================================

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY DEFAULT (encode(gen_random_bytes(16), 'hex')),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  category TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY DEFAULT (encode(gen_random_bytes(16), 'hex')),
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  awarded_by_id TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  FOREIGN KEY (awarded_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABLES SOLO
-- ============================================

CREATE TABLE IF NOT EXISTS solo_statistics (
  id TEXT PRIMARY KEY DEFAULT (encode(gen_random_bytes(16), 'hex')),
  user_id TEXT NOT NULL UNIQUE,
  total_tests INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  avg_time_per_question REAL DEFAULT 0,
  accuracy_rate REAL DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_test_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS solo_tests (
  id TEXT PRIMARY KEY DEFAULT (encode(gen_random_bytes(16), 'hex')),
  user_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  elo_before INTEGER DEFAULT 400,
  elo_after INTEGER DEFAULT 400,
  elo_change INTEGER DEFAULT 0,
  time_bonus INTEGER DEFAULT 0,
  is_perfect BOOLEAN DEFAULT FALSE,
  is_streak_test BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS solo_questions (
  id TEXT PRIMARY KEY DEFAULT (encode(gen_random_bytes(16), 'hex')),
  test_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  type TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (test_id) REFERENCES solo_tests(id) ON DELETE CASCADE
);

-- ============================================
-- TABLES MULTIJOUEUR
-- ============================================

CREATE TABLE IF NOT EXISTS multiplayer_statistics (
  id TEXT PRIMARY KEY DEFAULT (encode(gen_random_bytes(16), 'hex')),
  user_id TEXT NOT NULL UNIQUE,
  total_games INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_draws INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  bullet_1v1_wins INTEGER DEFAULT 0,
  bullet_3v3_wins INTEGER DEFAULT 0,
  bullet_5v5_wins INTEGER DEFAULT 0,
  blitz_1v1_wins INTEGER DEFAULT 0,
  blitz_3v3_wins INTEGER DEFAULT 0,
  blitz_5v5_wins INTEGER DEFAULT 0,
  rapid_1v1_wins INTEGER DEFAULT 0,
  rapid_3v3_wins INTEGER DEFAULT 0,
  rapid_5v5_wins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS multiplayer_games (
  id TEXT PRIMARY KEY DEFAULT (encode(gen_random_bytes(16), 'hex')),
  player1_id TEXT NOT NULL,
  player2_id TEXT,
  player1_elo INTEGER DEFAULT 400,
  player2_elo INTEGER DEFAULT 400,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting',
  game_type TEXT NOT NULL,
  time_control TEXT NOT NULL,
  time_limit INTEGER NOT NULL,
  question_count INTEGER DEFAULT 20,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS multiplayer_questions (
  id TEXT PRIMARY KEY DEFAULT (encode(gen_random_bytes(16), 'hex')),
  game_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  type TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (game_id) REFERENCES multiplayer_games(id) ON DELETE CASCADE
);

-- ============================================
-- INDEX
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_solo_elo ON users(solo_elo);
CREATE INDEX IF NOT EXISTS idx_users_multiplayer_elo ON users(multiplayer_elo);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_solo_statistics_user_id ON solo_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_statistics_user_id ON multiplayer_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_solo_tests_user_id ON solo_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_player1 ON multiplayer_games(player1_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_player2 ON multiplayer_games(player2_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_status ON multiplayer_games(status);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE solo_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE solo_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE solo_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne peuvent voir que leurs propres données
CREATE POLICY "users_own_data" ON users
  FOR ALL
  USING (auth.uid()::text = id);

CREATE POLICY "solo_statistics_own_data" ON solo_statistics
  FOR ALL
  USING (auth.uid()::text = user_id);

CREATE POLICY "solo_tests_own_data" ON solo_tests
  FOR ALL
  USING (auth.uid()::text = user_id);

CREATE POLICY "solo_questions_own_data" ON solo_questions
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM solo_tests st 
    WHERE st.id = solo_questions.test_id AND st.user_id = auth.uid()::text
  ));

CREATE POLICY "multiplayer_statistics_own_data" ON multiplayer_statistics
  FOR ALL
  USING (auth.uid()::text = user_id);

CREATE POLICY "multiplayer_games_own_data" ON multiplayer_games
  FOR ALL
  USING (
    auth.uid()::text = player1_id OR auth.uid()::text = player2_id
  );

CREATE POLICY "multiplayer_questions_own_data" ON multiplayer_questions
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM multiplayer_games mg 
    WHERE mg.id = multiplayer_questions.game_id 
    AND (mg.player1_id = auth.uid()::text OR mg.player2_id = auth.uid()::text)
  ));

CREATE POLICY "user_badges_own_data" ON user_badges
  FOR ALL
  USING (auth.uid()::text = user_id);

CREATE POLICY "badges_public_read" ON badges
  FOR SELECT
  USING (true);

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Les badges par défaut seront créés via l'application
-- Pour éviter les erreurs de syntaxe INSERT, l'insertion est désactivée ici

-- Insérer quelques badges par défaut (optionnel - via application)
-- INSERT INTO badges (id, name, description, icon, color, category, requirement_type, requirement_value)
-- VALUES 
--   ('first-win', 'Première victoire', 'Gagnez votre première partie', '🏆', 'achievement', 'wins', 1),
--   ('streak-5', 'Série de 5', 'Gagnez 5 parties d''affilée', '🔥', 'achievement', 'streak', 5),
--   ('perfect-game', 'Jeu parfait', 'Score 100% en une partie', '⭐', 'achievement', 'accuracy', 100)
-- ON CONFLICT (id) DO NOTHING;
