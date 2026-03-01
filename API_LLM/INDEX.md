# INDEX — Architecture complète de maths-app.com

## 📍 Localisation
- Page : /app/page.tsx
- Composants : /components/
- API routes : /app/api/

## 🗄️ Tables Supabase/Prisma utilisées
| Table | Opérations | Champs utilisés |
|-------|-----------|-----------------|
| users | SELECT, UPDATE, INSERT | id, email, solo_elo, multiplayer_elo, role, ... |
| solo_statistics | SELECT, UPDATE, INSERT | user_id, total_tests, current_streak, ... |
| multiplayer_statistics | SELECT, UPDATE, INSERT | user_id, total_games, total_wins, ... |
| badges | SELECT, INSERT | id, name, description, requirement_type, ... |
| user_badges | SELECT, INSERT | user_id, badge_id, earned_at, ... |

## 🔌 API Routes principales
| Route | Méthode | Paramètres | Retourne | Erreurs connues |
|-------|---------|------------|----------|-----------------|
| /api/profile | GET, PUT | userId | UserProfile | 500 si user null |
| /api/multiplayer | GET, POST | - | GameSession, Player[] | 400 si invalid game |
| /api/tests/[id]/complete | POST | testId, answers | TestResult | 404 si test not found |
| /api/leaderboard | GET | type, limit | LeaderboardEntry[] | 500 si db error |
| /api/auth/[...nextauth] | ALL | - | Session | 401 si unauthorized |

## 📦 Variables et Types principaux
```typescript
// Types principaux du projet
type User = {
  id: string
  email: string
  username: string
  soloElo: number           // ELO solo uniquement
  soloRankClass: string     // Classe solo (F-, F, E+, ..., S+)
  soloBestElo: number       // Meilleur ELO solo
  multiplayerElo: number    // ELO multi uniquement  
  multiplayerRankClass: string // Classe multi
  multiplayerBestElo: number // Meilleur ELO multi
  role: 'user' | 'admin' | 'teacher'
  hasCompletedOnboarding: boolean
}

type GameSession = {
  id: string
  player1Id: string
  player2Id?: string
  gameType: 'ranked_1v1' | 'casual_1v1' | 'group_quiz'
  timeControl: 'bullet' | 'blitz' | 'rapid'
  status: 'waiting' | 'playing' | 'finished'
  player1Score: number
  player2Score: number
}

type SoloTest = {
  id: string
  userId: string
  totalQuestions: number
  correctAnswers: number
  score: number
  timeTaken: number
  eloBefore: number
  eloAfter: number
}
```

## 🔗 Dépendances externes
- **Libs** : Next.js 14, React 18, TypeScript, Tailwind CSS, Prisma, NextAuth.js, Supabase, Discord.js
- **Providers requis** : SessionProvider, NotificationProvider, SupabaseProvider
- **Variables d'environnement** : 
  - `DATABASE_URL` (PostgreSQL Supabase)
  - `NEXTAUTH_SECRET` 
  - `NEXTAUTH_URL`
  - `DISCORD_BOT_TOKEN`
  - `DISCORD_CLIENT_ID`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## ⚠️ Erreurs connues et pièges à éviter
- ❌ **Ne jamais utiliser getSession() côté serveur** → utiliser getToken()
- ❌ **Ne jamais mélanger solo_elo et multiplayer_elo** dans les calculs
- ❌ **Ne jamais utiliser "Kahoot" (marque déposée)** → "Mode Groupe" ou "Partie de groupe"
- ❌ **Ne pas ajouter data-nscript sur le script AdSense**
- ❌ **Toujours vérifier que les Providers sont au bon niveau dans le layout**
- ❌ **Ne jamais créer une nouvelle table sans vérifier DATABASE.md**
- ❌ **Ne pas utiliser de champs deprecated (elo, statistics, test)** → utiliser solo_*, multiplayer_*

## 🔄 Interactions entre pages principales
- **Dashboard** ↔ **Profile** : stats utilisateur, ELO
- **Multiplayer** ↔ **Leaderboard** : classements ELO
- **Tests** ↔ **Profile** : historique, onboarding
- **Admin** ↔ **Toutes les pages** : gestion utilisateurs, badges
- **Discord** ↔ **Profile** : liaison compte Discord

## 📝 Notes importantes
- **Refactoring multijoueur terminé** : 3 modes unifiés en 1 interface
- **Séparation solo/multiplayer stricte** dans les champs et tables
- **Protection admin** via RLS policies et règles PostgreSQL
- **Système de badges** avec achievements mensuels
- **Bot Discord** pour notifications et gestion classes
- **OAuth NextAuth** avec Google et Discord
- **Temps réel** via Supabase Realtime pour le multiplayer

---

## 🏗️ Stack technique complet
- **Frontend** : Next.js 14 App Router, TypeScript, Tailwind CSS
- **Authentification** : NextAuth.js v4 avec OAuth (Google, Discord)
- **Base de données** : PostgreSQL via Supabase
- **ORM** : Prisma avec schéma unifié solo/multiplayer
- **Temps réel** : Supabase Realtime pour multiplayer
- **Bot Discord** : Discord.js v14 hébergé sur Railway
- **Déploiement** : Vercel (app) + Railway (bot)
- **Analytics** : Google AdSense, ads personnalisées

## 📋 Convention de nommage (OBLIGATOIRE)
- **Tables SQL** : snake_case (user_profiles, solo_tests, multiplayer_games...)
- **Champs TypeScript** : camelCase (soloElo, multiplayerElo, hasCompletedOnboarding...)
- **Préfixe "solo_"** pour tout ce qui est mode solo uniquement
- **Préfixe "multiplayer_"** pour tout ce qui est mode multijoueur uniquement
- **Pas de préfixe** pour les données communes (email, username, role...)

## 🔄 Séparation solo / multijoueur
### Champs solo dans users
- `soloElo`, `soloRankClass`, `soloBestElo`, `soloBestRankClass`
- `soloCurrentStreak`, `soloBestStreak`, `lastTestDate`

### Champs multiplayer dans users
- `multiplayerElo`, `multiplayerRankClass`, `multiplayerBestElo`, `multiplayerBestRankClass`
- `multiplayerCurrentStreak`, `multiplayerBestStreak`

### Tables dédiées
- **solo_statistics**, **solo_tests**, **solo_questions**
- **multiplayer_statistics**, **multiplayer_games**, **multiplayer_questions**

## 🗺️ Map des pages et leurs routes API
| Page | API routes utilisées |
|------|---------------------|
| /profile | /api/profile, /api/tests/[id]/complete |
| /dashboard | /api/profile, /api/achievements/monthly |
| /multiplayer | /api/multiplayer, /api/multiplayer/game/[id]/* |
| /leaderboard | /api/leaderboard |
| /tests | /api/tests/[id]/complete, /api/exercises/attempts |
| /admin | /api/admin/* |
| /friends | /api/friends |
| /messages | /api/messages |
| /notifications | /api/notifications |

## 🔐 Variables d'environnement requises
```env
# Base de données
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."

# Authentification  
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://maths-app.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."

# Bot Discord
DISCORD_BOT_TOKEN="..."
DISCORD_GUILD_ID="..."

# Analytics
GOOGLE_ADSENSE_CLIENT_ID="..."
```

## ❌ Erreurs globales à ne JAMAIS reproduire
- **Ne jamais utiliser getSession() côté serveur** → utiliser getToken()
- **Ne jamais mélanger données solo et multijoueur**
- **Ne jamais créer une nouvelle table sans vérifier DATABASE.md**
- **Ne jamais utiliser "Kahoot"** → "Mode Groupe"
- **Ne pas ajouter data-nscript sur le script AdSense**
- **Toujours vérifier que les Providers sont au bon niveau dans le layout**
- **Ne pas utiliser de champs deprecated** (elo, statistics, test)

## 🎯 RÈGLE D'OR pour les futures IA
**Avant de créer quoi que ce soit (table, variable, composant, API route), chercher d'abord dans les fichiers API_LLM/ si ça n'existe pas déjà.**

Ce dossier est LA référence absolue du projet. Il doit être consulté avant toute modification ou création.

---

## 📚 Structure complète des fichiers API_LLM

### Fichiers prioritaires (déjà créés)
1. **INDEX.md** ← Vue globale (ce fichier)
2. **DATABASE.md** ← Référence complète des tables
3. **AUTH.md** ← NextAuth, sessions, middleware

### Pages principales à documenter
4. **profile.md** ← Profil utilisateur, stats solo/multi
5. **dashboard.md** ← Tableau de bord, analytics
6. **multiplayer.md** ← Mode multijoueur unifié
7. **tests.md** ← Tests solo, onboarding
8. **leaderboard.md** ← Classements ELO
9. **courses.md** ← Cours et exercices
10. **admin.md** ← Interface admin

### Features secondaires
11. **notifications.md** ← Système de notifications
12. **discord-bot.md** ← Bot Discord Railway
13. **teacher.md** ← Interface professeurs
14. **parent.md** ← Interface parents
15. **settings.md** ← Paramètres utilisateur
16. **tickets.md** ← Support technique
17. **friends.md** ← Gestion amis
18. **messages.md** ← Messagerie interne
19. **onboarding.md** ← Processus d'intégration

### Fichiers techniques
20. **API_ROUTES.md** ← Référence de toutes les routes API
21. **COMPONENTS.md** ← Composants réutilisables
22. **MIDDLEWARE.md** ← Middleware et protections
23. **DEPLOYMENT.md** ← Déploiement et hébergement

---

**Ce dossier est LA référence pour toutes les futures IA et développeurs. Il doit être maintenu à jour et consulté avant toute modification.**
