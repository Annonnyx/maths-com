# API_ROUTES — Documentation complète des routes API

## 📋 Table des matières
- [Authentification](#authentification)
- [Profil utilisateur](#profil-utilisateur)
- [Mode Solo](#mode-solo)
- [Mode Multijoueur](#mode-multijoueur)
- [Défis](#défis)
- [Classes](#classes)
- [Amis](#amis)
- [Messages et Notifications](#messages-et-notifications)
- [Badges et Succès](#badges-et-succès)
- [Leaderboard](#leaderboard)
- [Administration](#administration)
- [Support](#support)

---

## 🔐 Authentification

### `/api/auth/[...nextauth]`
**Méthodes**: `GET`, `POST`, `PUT`, `DELETE`
**Description**: Gestion complète de l'authentification NextAuth

#### Endpoints disponibles:
- `GET /api/auth/signin` - Page de connexion
- `POST /api/auth/signin` - Traitement connexion
- `GET /api/auth/signup` - Page d'inscription
- `POST /api/auth/signup` - Traitement inscription
- `GET /api/auth/signout` - Déconnexion
- `GET /api/auth/session` - Session actuelle
- `GET /api/auth/providers` - Providers OAuth disponibles

#### Paramètres:
```typescript
// POST /api/auth/signin
{
  email: string;
  password?: string;
  provider?: 'google' | 'discord';
  callbackUrl?: string;
}
```

#### Réponses:
```typescript
// Succès
{
  success: true;
  user: {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin' | 'teacher';
  };
  session: {
    expires: string;
    user: User;
  };
}

// Erreur
{
  success: false;
  error: string;
  code: 'INVALID_CREDENTIALS' | 'EMAIL_EXISTS' | 'WEAK_PASSWORD';
}
```

#### Erreurs communes:
- `401` : Non authentifié
- `400` : Données invalides
- `500` : Erreur serveur

---

## 👤 Profil utilisateur

### `/api/profile`
**Méthodes**: `GET`, `PUT`
**Description**: Gestion du profil utilisateur

#### GET /api/profile
**Paramètres**:
- `userId` (optionnel) : ID de l'utilisateur à récupérer (défaut: utilisateur connecté)

**Réponse**:
```typescript
{
  user: {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    soloElo: number;
    soloRankClass: string;
    soloBestElo: number;
    soloCurrentStreak: number;
    soloBestStreak: number;
    multiplayerElo: number;
    multiplayerRankClass: string;
    multiplayerBestElo: number;
    multiplayerCurrentStreak: number;
    multiplayerBestStreak: number;
    role: 'user' | 'admin' | 'teacher';
    hasCompletedOnboarding: boolean;
    isTeacher: boolean;
    isOnline: boolean;
    lastSeenAt: string;
  };
  statistics?: {
    solo: SoloStatistics;
    multiplayer: MultiplayerStatistics;
  };
  recentGames?: GameSession[];
  recentTests?: SoloTest[];
}
```

#### PUT /api/profile
**Paramètres**:
```typescript
{
  displayName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  selectedBadgeIds?: string[];
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
    sound: boolean;
  };
}
```

**Réponse**:
```typescript
{
  success: true;
  user: User;
}
```

#### Erreurs communes:
- `401` : Non authentifié
- `400` : Données invalides
- `500` : Erreur serveur

---

## 🎯 Mode Solo

### `/api/solo/history`
**Méthodes**: `GET`
**Description**: Historique des tests solo

#### Paramètres:
- `limit` (optionnel) : Nombre de résultats (défaut: 20)
- `offset` (optionnel) : Pagination (défaut: 0)
- `difficulty` (optionnel) : Filtrer par difficulté
- `gameType` (optionnel) : Filtrer par type de jeu

**Réponse**:
```typescript
{
  tests: SoloTest[];
  total: number;
  hasMore: boolean;
}
```

### `/api/solo/start`
**Méthodes**: `POST`
**Description**: Démarrer un nouveau test solo

#### Paramètres:
```typescript
{
  gameType: 'ranked' | 'casual' | 'training';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number; // 10, 20, 30
  timeLimit?: number; // en secondes
}
```

**Réponse**:
```typescript
{
  testId: string;
  questions: SoloQuestion[];
  timeLimit: number;
  startedAt: string;
}
```

### `/api/solo/complete/[testId]`
**Méthodes**: `POST`
**Description**: Compléter un test solo

#### Paramètres:
```typescript
{
  answers: Array<{
    questionId: string;
    answer: string | number;
    timeTaken: number; // en millisecondes
  }>;
  timeTaken: number; // total en millisecondes
}
```

**Réponse**:
```typescript
{
  success: true;
  result: {
    testId: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number;
    eloBefore: number;
    eloAfter: number;
    isPerfect: boolean;
    isStreakTest: boolean;
    questions: SoloQuestion[];
  };
}
```

---

## 🎮 Mode Multijoueur

### `/api/multiplayer`
**Méthodes**: `GET`, `POST`
**Description**: Gestion des sessions multijoueurs

#### GET /api/multiplayer
**Paramètres**:
- `status` (optionnel) : Filtrer par statut ('waiting', 'playing', 'finished')
- `gameType` (optionnel) : Filtrer par type
- `limit` (optionnel) : Nombre de résultats

**Réponse**:
```typescript
{
  games: GameSession[];
  total: number;
}
```

#### POST /api/multiplayer
**Paramètres**:
```typescript
{
  gameType: 'ranked_1v1' | 'casual_1v1' | 'group_quiz';
  timeControl: 'bullet' | 'blitz' | 'rapid';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  isPrivate?: boolean;
  maxPlayers?: number; // pour group_quiz
}
```

**Réponse**:
```typescript
{
  success: true;
  game: GameSession;
  playerCode: string; // code pour rejoindre
}
```

### `/api/multiplayer/join/[gameId]`
**Méthodes**: `POST`
**Description**: Rejoindre une partie multijoueur

#### Paramètres:
```typescript
{
  playerCode?: string; // pour parties privées
}
```

**Réponse**:
```typescript
{
  success: true;
  game: GameSession;
  playerId: string;
}
```

### `/api/multiplayer/game/[gameId]/start`
**Méthodes**: `POST`
**Description**: Démarrer une partie multijoueur

**Réponse**:
```typescript
{
  success: true;
  game: GameSession;
  questions: MultiplayerQuestion[];
}
```

### `/api/multiplayer/game/[gameId]/question/[roundNumber]`
**Méthodes**: `GET`, `POST`
**Description**: Gestion des questions d'une partie

#### GET /api/multiplayer/game/[gameId]/question/[roundNumber]
**Réponse**:
```typescript
{
  question: MultiplayerQuestion;
  timeLimit: number;
  roundNumber: number;
}
```

#### POST /api/multiplayer/game/[gameId]/question/[roundNumber]
**Paramètres**:
```typescript
{
  answer: string | number;
  timeTaken: number;
}
```

**Réponse**:
```typescript
{
  success: true;
  isCorrect: boolean;
  correctAnswer: string | number;
  explanation?: string;
}
```

### `/api/multiplayer/game/[gameId]/finish`
**Méthodes**: `POST`
**Description**: Terminer une partie multijoueur

**Réponse**:
```typescript
{
  success: true;
  result: {
    gameId: string;
    winner: User;
    finalScores: {
      player1: number;
      player2?: number;
    };
    eloChanges: {
      player1: {
        before: number;
        after: number;
        change: number;
      };
      player2?: {
        before: number;
        after: number;
        change: number;
      };
    };
    questions: MultiplayerQuestion[];
  };
}
```

---

## ⚔️ Défis

### `/api/challenges`
**Méthodes**: `GET`, `POST`
**Description**: Gestion des défis entre joueurs

#### GET /api/challenges
**Paramètres**:
- `type` (optionnel) : 'sent' | 'received' | 'all'
- `status` (optionnel) : 'pending' | 'accepted' | 'declined' | 'expired'

**Réponse**:
```typescript
{
  challenges: Challenge[];
  total: number;
}
```

#### POST /api/challenges
**Paramètres**:
```typescript
{
  challengedId: string;
  gameType: 'ranked' | 'casual';
  timeControl: 'bullet' | 'blitz' | 'rapid';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  timeLimit?: number; // en heures, défaut: 24
}
```

**Réponse**:
```typescript
{
  success: true;
  challenge: Challenge;
  notificationSent: boolean;
}
```

### `/api/challenges/[challengeId]/respond`
**Méthodes**: `POST`
**Description**: Répondre à un défi

#### Paramètres**:
```typescript
{
  response: 'accept' | 'decline';
}
```

**Réponse**:
```typescript
{
  success: true;
  challenge: Challenge;
  gameCreated?: GameSession; // si accepté
}
```

---

## 🏫 Classes

### `/api/class-groups`
**Méthodes**: `GET`, `POST`
**Description**: Gestion des groupes de classes

#### GET /api/class-groups
**Paramètres**:
- `type` (optionnel) : 'my' | 'public' | 'all'
- `teacherId` (optionnel) : Filtrer par professeur

**Réponse**:
```typescript
{
  groups: ClassGroup[];
  total: number;
}
```

#### POST /api/class-groups
**Paramètres**:
```typescript
{
  name: string;
  description?: string;
  isPrivate: boolean;
  maxStudents?: number;
  joinCode?: string; // généré automatiquement si non fourni
}
```

**Réponse**:
```typescript
{
  success: true;
  group: ClassGroup;
  joinCode: string;
}
```

### `/api/class-groups/[groupId]`
**Méthodes**: `GET`, `PUT`, `DELETE`
**Description**: Gestion d'un groupe de classe spécifique

#### GET /api/class-groups/[groupId]
**Réponse**:
```typescript
{
  group: ClassGroup;
  members: ClassGroupMember[];
  statistics: {
    totalStudents: number;
    averageScore: number;
    totalTests: number;
  };
}
```

#### PUT /api/class-groups/[groupId]
**Paramètres**:
```typescript
{
  name?: string;
  description?: string;
  isPrivate?: boolean;
  maxStudents?: number;
}
```

#### DELETE /api/class-groups/[groupId]
**Réponse**:
```typescript
{
  success: true;
  message: 'Group deleted successfully';
}
```

### `/api/class-groups/join`
**Méthodes**: `POST`
**Description**: Rejoindre un groupe de classe

#### Paramètres**:
```typescript
{
  code: string; // code d'invitation
}
```

**Réponse**:
```typescript
{
  success: true;
  group: ClassGroup;
  member: ClassGroupMember;
}
```

### `/api/class-groups/[groupId]/members`
**Méthodes**: `GET`, `POST`, `DELETE`
**Description**: Gestion des membres d'une classe

#### GET /api/class-groups/[groupId]/members
**Réponse**:
```typescript
{
  members: ClassGroupMember[];
  total: number;
}
```

#### POST /api/class-groups/[groupId]/members
**Paramètres**:
```typescript
{
  userId: string;
  role: 'student' | 'assistant';
}
```

#### DELETE /api/class-groups/[groupId]/members/[memberId]
**Réponse**:
```typescript
{
  success: true;
  message: 'Member removed successfully';
}
```

---

## 👥 Amis

### `/api/friends`
**Méthodes**: `GET`, `POST`, `DELETE`
**Description**: Gestion des amis

#### GET /api/friends
**Paramètres**:
- `status` (optionnel) : 'pending' | 'accepted' | 'all'

**Réponse**:
```typescript
{
  friends: Friend[];
  pendingRequests: FriendRequest[];
  total: number;
}
```

#### POST /api/friends
**Paramètres**:
```typescript
{
  friendId: string;
  action: 'request' | 'accept' | 'decline' | 'remove';
}
```

**Réponse**:
```typescript
{
  success: true;
  friend?: Friend;
  message: string;
}
```

#### DELETE /api/friends/[friendId]
**Réponse**:
```typescript
{
  success: true;
  message: 'Friend removed successfully';
}
```

---

## 💬 Messages et Notifications

### `/api/messages`
**Méthodes**: `GET`, `POST`, `PUT`, `DELETE`
**Description**: Gestion des messages et notifications

#### GET /api/messages
**Paramètres**:
- `type` (optionnel) : 'message' | 'notification' | 'all'
- `status` (optionnel) : 'read' | 'unread' | 'all'
- `limit` (optionnel) : Nombre de résultats
- `offset` (optionnel) : Pagination

**Réponse**:
```typescript
{
  messages: Message[];
  unreadCount: number;
  total: number;
}
```

#### POST /api/messages
**Paramètres**:
```typescript
{
  receiverId: string;
  content: string;
  type: 'message' | 'notification';
  metadata?: Record<string, any>;
}
```

**Réponse**:
```typescript
{
  success: true;
  message: Message;
}
```

### `/api/notifications`
**Méthodes**: `GET`, `PUT`, `DELETE`
**Description**: Gestion des notifications

#### GET /api/notifications
**Réponse**:
```typescript
{
  notifications: Notification[];
  unreadCount: number;
}
```

#### PUT /api/notifications/read
**Paramètres**:
```typescript
{
  notificationIds: string[]; // vide = toutes
}
```

**Réponse**:
```typescript
{
  success: true;
  updatedCount: number;
}
```

#### DELETE /api/notifications
**Paramètres**:
```typescript
{
  notificationIds: string[]; // vide = toutes
}
```

**Réponse**:
```typescript
{
  success: true;
  deletedCount: number;
}
```

---

## 🏆 Badges et Succès

### `/api/badges`
**Méthodes**: `GET`, `POST`
**Description**: Gestion des badges

#### GET /api/badges
**Paramètres**:
- `userId` (optionnel) : ID utilisateur pour ses badges
- `category` (optionnel) : Filtrer par catégorie
- `active` (optionnel) : Badges actifs seulement

**Réponse**:
```typescript
{
  badges: Badge[];
  userBadges?: UserBadge[];
  total: number;
}
```

#### POST /api/badges
**Paramètres**:
```typescript
{
  name: string;
  description: string;
  category: string;
  requirementType: 'score' | 'streak' | 'games' | 'custom';
  requirementValue: number;
  isActive: boolean;
}
```

**Réponse**:
```typescript
{
  success: true;
  badge: Badge;
}
```

### `/api/badges/award`
**Méthodes**: `POST`
**Description**: Attribuer un badge à un utilisateur (admin)

#### Paramètres**:
```typescript
{
  userId: string;
  badgeId: string;
  expiresAt?: string; // optionnel
}
```

**Réponse**:
```typescript
{
  success: true;
  userBadge: UserBadge;
}
```

---

## 📊 Leaderboard

### `/api/leaderboard`
**Méthodes**: `GET`
**Description**: Classements ELO

#### Paramètres**:
- `type` (optionnel) : 'solo' | 'multiplayer' (défaut: 'solo')
- `limit` (optionnel) : Nombre de résultats (défaut: 50)
- `offset` (optionnel) : Pagination
- `friendsOnly` (optionnel) : Voir seulement les amis
- `timeframe` (optionnel) : 'all' | 'month' | 'week'

**Réponse**:
```typescript
{
  leaderboard: LeaderboardEntry[];
  userRank?: number; // rang de l'utilisateur connecté
  total: number;
  timeframe: string;
}
```

#### Type LeaderboardEntry:
```typescript
{
  rank: number;
  user: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  elo: number;
  rankClass: string;
  statistics: {
    totalGames?: number;
    winRate?: number;
    averageScore?: number;
  };
}
```

---

## 🛠️ Administration

### `/api/admin/users`
**Méthodes**: `GET`, `POST`, `PUT`, `DELETE`
**Description**: Gestion des utilisateurs (admin)

#### GET /api/admin/users
**Paramètres**:
- `role` (optionnel) : Filtrer par rôle
- `search` (optionnel) : Recherche par username/email
- `limit` (optionnel) : Nombre de résultats

**Réponse**:
```typescript
{
  users: User[];
  total: number;
}
```

#### POST /api/admin/users
**Paramètres**:
```typescript
{
  email: string;
  username: string;
  role: 'user' | 'admin' | 'teacher';
  isTeacher?: boolean;
}
```

### `/api/admin/badges`
**Méthodes**: `GET`, `POST`, `PUT`, `DELETE`
**Description**: Gestion des badges (admin)

### `/api/admin/teacher-requests`
**Méthodes**: `GET`, `PUT`
**Description**: Gestion des demandes professeur

#### GET /api/admin/teacher-requests
**Réponse**:
```typescript
{
  requests: TeacherRequest[];
  total: number;
  pending: number;
}
```

#### PUT /api/admin/teacher-requests/[requestId]
**Paramètres**:
```typescript
{
  status: 'approved' | 'rejected';
  adminNote?: string;
}
```

---

## 🎫 Support

### `/api/tickets`
**Méthodes**: `GET`, `POST`, `PUT`
**Description**: Gestion des tickets de support

#### GET /api/tickets
**Paramètres**:
- `status` (optionnel) : 'open' | 'in_progress' | 'resolved' | 'closed'
- `priority` (optionnel) : 'low' | 'medium' | 'high' | 'urgent'
- `category` (optionnel) : Catégorie du ticket

**Réponse**:
```typescript
{
  tickets: Ticket[];
  total: number;
  openCount: number;
}
```

#### POST /api/tickets
**Paramètres**:
```typescript
{
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'account' | 'other';
  priority: 'low' | 'medium' | 'high';
  attachments?: string[]; // URLs des fichiers
}
```

**Réponse**:
```typescript
{
  success: true;
  ticket: Ticket;
  ticketNumber: string; // format: TICKET-YYYY-XXXX
}
```

### `/api/tickets/[ticketId]/respond`
**Méthodes**: `POST`
**Description**: Répondre à un ticket

#### Paramètres**:
```typescript
{
  message: string;
  attachments?: string[];
  isInternal?: boolean; // visible seulement pour le support
}
```

---

## 📝 Conventions d'API

### Format des réponses
Toutes les réponses suivent ce format :
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  total?: number; // pour les listes
  hasMore?: boolean; // pour la pagination
}
```

### Codes d'erreur standards
- `200` : Succès
- `201` : Créé avec succès
- `400` : Données invalides
- `401` : Non authentifié
- `403` : Accès refusé
- `404` : Ressource non trouvée
- `409` : Conflit
- `429` : Trop de requêtes
- `500` : Erreur serveur interne

### Pagination
Les routes qui retournent des listes utilisent :
- `limit` : Nombre d'éléments par page (défaut: 20, max: 100)
- `offset` : Nombre d'éléments à sauter (défaut: 0)

### Authentification
La plupart des routes nécessitent une authentification via :
- **Cookie de session NextAuth** (préféré)
- **Header Authorization** : `Bearer <token>`

### Rate Limiting
- **Routes publiques** : 100 requêtes/minute/IP
- **Routes authentifiées** : 1000 requêtes/minute/utilisateur
- **Routes sensibles** : 100 requêtes/minute/utilisateur

---

**Cette documentation est maintenue à jour avec chaque modification de l'API.**