# LISTE COMPLÈTE DES RENOMMAGES CODE

## RENOMMAGES PRISMA/TYPE

### User model
```typescript
// AVANT → APRÈS
elo → soloElo
rankClass → soloRankClass
bestElo → soloBestElo
bestRankClass → soloBestRankClass
currentStreak → soloCurrentStreak
bestStreak → soloBestStreak

// NOUVEAUX CHAMPS
multiplayerElo: Int @default(400)
multiplayerRankClass: String @default("F-")
multiplayerBestElo: Int @default(400)
multiplayerBestRankClass: String @default("F-")
```

### Models renommés
```typescript
Statistics → SoloStatistics
Test → SoloTest
Question → SoloQuestion

// Tables SQL correspondantes
statistics → solo_statistics
tests → solo_tests
questions → solo_questions
```

### MultiplayerStatistics streaks
```typescript
// AVANT → APRÈS
currentStreak → multiplayerCurrentStreak
bestStreak → multiplayerBestStreak
```

## FICHIERS À MODIFIER

### API Routes
```
src/app/api/
├── profile/route.ts (User fields)
├── leaderboard/route.ts (mode parameter)
├── users/route.ts (User fields)
├── statistics/route.ts → solo-statistics/route.ts
├── tests/route.ts → solo-tests/route.ts
├── multiplayer/route.ts (MultiplayerStatistics fields)
└── friends/route.ts (inchangé)
```

### Components
```
src/components/
├── Profile.tsx (User fields + mode toggle)
├── Dashboard.tsx (User fields)
├── Leaderboard.tsx (mode filter)
├── MultiplayerGame.tsx (multiplayerElo)
└── PlayerBanner.tsx (mode-specific elo)
```

### Hooks
```
src/hooks/
├── useUserProfile.ts (User fields)
├── useMultiplayer.ts (multiplayerElo)
├── useLeaderboard.ts (mode parameter)
└── useStatistics.ts → useSoloStatistics.ts
```

### Types
```
src/types/
├── index.ts (User interface)
├── leaderboard.ts (LeaderboardEntry with mode)
└── multiplayer.ts (Multiplayer interfaces)
```

### Lib
```
src/lib/
├── elo.ts (fonctions pour solo et multiplayer)
├── multiplayer-elo.ts (inchangé)
└── achievements.ts (vérifier les références)
```

## RENOMMAGES SPÉCIFIQUES

### Profile.tsx
```typescript
// AVANT
user.elo
user.rankClass
user.currentStreak
user.bestStreak

// APRÈS (avec mode toggle)
const [statsMode, setStatsMode] = useState<'solo' | 'multiplayer'>('solo');

user.soloElo / user.multiplayerElo
user.soloRankClass / user.multiplayerRankClass
user.soloCurrentStreak / user.multiplayerCurrentStreak
user.soloBestStreak / user.multiplayerBestStreak
```

### Leaderboard.tsx
```typescript
// AVANT
/api/leaderboard

// APRÈS
/api/leaderboard?mode=solo&timeFrame=all
/api/leaderboard?mode=multiplayer&timeFrame=all
```

### Dashboard.tsx
```typescript
// AVANT
user.elo
user.rankClass

// APRÈS
user.soloElo
user.soloRankClass
```

### Multiplayer pages
```typescript
// AVANT
user.elo (dans les composants multiplayer)

// APRÈS
user.multiplayerElo
user.multiplayerRankClass
```

### API Responses
```typescript
// Profile API response
{
  user: {
    soloElo: 1200,
    soloRankClass: "B",
    multiplayerElo: 950,
    multiplayerRankClass: "C+",
    // ...
  }
}

// Leaderboard API response
{
  mode: "solo" | "multiplayer",
  leaderboard: [...],
  userRank: 42
}
```

## IMPORTS À METTRE À JOUR

### Prisma imports
```typescript
// AVANT
import { User, Statistics, Test } from '@/lib/prisma'

// APRÈS
import { User, SoloStatistics, SoloTest } from '@/lib/prisma'
```

### Type imports
```typescript
// AVANT
import { User, Statistics } from '@/types'

// APRÈS
import { User, SoloStatistics } from '@/types'
```

## VALIDATIONS À FAIRE

1. **Database migration** : Exécuter migration_script.sql
2. **Prisma generation** : `npx prisma generate`
3. **Type checking** : `npm run type-check`
4. **API testing** : Tester toutes les routes modifiées
5. **Frontend testing** : Vérifier tous les composants
6. **ELO consistency** : Vérifier que les ELO sont corrects après migration

## ORDRE DES OPÉRATIONS

1. Backup de la base de données
2. Exécuter le script SQL de migration
3. Mettre à jour schema.prisma
4. Regénérer Prisma client
5. Mettre à jour les types TypeScript
6. Modifier les API routes
7. Modifier les composants frontend
8. Tester toutes les fonctionnalités
9. Nettoyer les anciens champs (optionnel)

## RISQUES ET MITIGATIONS

- **Perte de données** : Backup avant migration
- **Régression** : Testing complet après chaque étape
- **Performance** : Index créés dans le script SQL
- **Compatibilité** : Maintenir les anciens champs pendant la transition
