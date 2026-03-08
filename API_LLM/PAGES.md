# PAGES — Documentation des pages principales

## 📋 Table des matières
- [Dashboard](#dashboard)
- [Profil](#profil)
- [Multijoueur](#multijoueur)
- [Tests Solo](#tests-solo)
- [Leaderboard](#leaderboard)
- [Classes](#classes)
- [Amis](#amis)
- [Messages](#messages)
- [Notifications](#notifications)
- [Administration](#administration)

---

## 🏠 Dashboard

**Chemin**: `/app/dashboard/page.tsx`
**Description**: Tableau de bord principal avec aperçu des statistiques et activités

### Fonctionnalités principales
- **Statistiques en temps réel** : ELO solo/multi, streaks, progression
- **Activité récente** : Derniers tests, scores, badges obtenus
- **Accès rapide** : Liens vers les fonctionnalités principales
- **Classes** : Vue d'ensemble des classes de l'utilisateur
- **Objectifs** : Points à améliorer et recommandations

### API routes utilisées
- `GET /api/profile` - Profil et statistiques
- `GET /api/achievements/monthly` - Succès mensuels
- `GET /api/solo/history` - Historique récent
- `GET /api/class-groups/my-classes` - Classes de l'utilisateur

### Composants principaux
```tsx
// Statistiques principales
<StatsOverview 
  soloElo={profile.user.soloElo}
  multiplayerElo={profile.user.multiplayerElo}
  soloStreak={profile.user.soloCurrentStreak}
  multiplayerStreak={profile.user.multiplayerCurrentStreak}
/>

// Activité récente
<RecentActivity 
  recentTests={profile.recentTests}
  recentGames={profile.recentGames}
/>

// Classes
<ClassesSection 
  classes={userClasses}
  onJoinClass={handleJoinClass}
/>

// Points à améliorer
<WeakPoints 
  weaknesses={analyzeWeaknesses(profile.statistics)}
  onPractice={handlePractice}
/>
```

### État et hooks
```tsx
const { profile, loading, error } = useUserProfile();
const [showOnboarding, setShowOnboarding] = useState(false);

// Vérifier si l'onboarding est nécessaire
useEffect(() => {
  if (profile && !profile.user.hasCompletedOnboarding) {
    setShowOnboarding(true);
  }
}, [profile]);
```

### Responsive design
- **Mobile** : Layout vertical, cartes empilées
- **Tablet** : Grid 2 colonnes
- **Desktop** : Grid 3-4 colonnes avec sidebar

---

## 👤 Profil

**Chemin**: `/app/profile/page.tsx`
**Description**: Page de profil utilisateur avec statistiques détaillées

### Fonctionnalités principales
- **Informations personnelles** : Nom, email, avatar, bannière
- **Statistiques détaillées** : Graphiques, progression, historique
- **Badges** : Badges obtenus et à débloquer
- **Paramètres** : Préférences, confidentialité
- **Liaison Discord** : Connexion compte Discord

### API routes utilisées
- `GET /api/profile` - Profil complet
- `PUT /api/profile` - Mise à jour profil
- `GET /api/badges` - Badges utilisateur
- `GET /api/solo/history` - Historique détaillé
- `GET /api/multiplayer/history` - Historique multijoueur

### Composants principaux
```tsx
// Header du profil
<ProfileHeader 
  user={profile.user}
  onEdit={handleEditProfile}
  onBannerChange={handleBannerChange}
/>

// Statistiques
<StatisticsTabs 
  soloStats={profile.statistics.solo}
  multiplayerStats={profile.statistics.multiplayer}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Badges
<BadgesGrid 
  badges={userBadges}
  availableBadges={availableBadges}
  onBadgeClick={handleBadgeClick}
/>

// Paramètres
<SettingsForm 
  user={profile.user}
  onSave={handleSaveSettings}
/>
```

### Gestion de l'état
```tsx
const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'banner' | 'settings'>('overview');
const [isEditing, setIsEditing] = useState(false);
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
```

---

## 🎮 Multijoueur

**Chemin**: `/app/multiplayer/page.tsx`
**Description**: Page principale du mode multijoueur

### Fonctionnalités principales
- **Lobby** : Liste des parties disponibles
- **Création de partie** : Configuration et lancement
- **Recherche** : Filtrage par type, difficulté, amis
- **Invitations** : Défis en attente
- **Historique** : Parties récentes et résultats

### API routes utilisées
- `GET /api/multiplayer` - Parties disponibles
- `POST /api/multiplayer` - Créer partie
- `POST /api/multiplayer/join/[gameId]` - Rejoindre partie
- `GET /api/challenges` - Défis en attente
- `GET /api/multiplayer/history` - Historique

### Composants principaux
```tsx
// Lobby principal
<GameLobby 
  games={availableGames}
  onCreateGame={handleCreateGame}
  onJoinGame={handleJoinGame}
  filters={gameFilters}
  onFilterChange={setGameFilters}
/>

// Modal de création
<CreateGameModal 
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onCreate={handleCreateSubmit}
/>

// Défis
<ChallengesSection 
  challenges={pendingChallenges}
  onAccept={handleAcceptChallenge}
  onDecline={handleDeclineChallenge}
/>
```

### État temps réel
```tsx
const { subscribe, unsubscribe } = useRealtime();

useEffect(() => {
  // S'abonner aux mises à jour du lobby
  const unsubscribeLobby = subscribe('lobby:update', (payload) => {
    updateAvailableGames(payload.games);
  });

  // S'abonner aux invitations
  const unsubscribeChallenges = subscribe('challenge:new', (payload) => {
    addPendingChallenge(payload.challenge);
  });

  return () => {
    unsubscribeLobby();
    unsubscribeChallenges();
  };
}, [subscribe, unsubscribe]);
```

---

## 📝 Tests Solo

**Chemin**: `/app/practice/page.tsx`
**Description**: Page d'entraînement et tests solo

### Fonctionnalités principales
- **Configuration du test** : Difficulté, nombre de questions, temps
- **Mode entraînement** : Sans pression, avec corrections
- **Mode classé** : Impact sur l'ELO
- **Historique détaillé** : Tous les tests avec analyse
- **Progression** : Graphiques et tendances

### API routes utilisées
- `POST /api/solo/start` - Démarrer test
- `POST /api/solo/complete/[testId]` - Compléter test
- `GET /api/solo/history` - Historique
- `GET /api/exercises/attempts` - Tentatives d'exercices

### Composants principaux
```tsx
// Configuration du test
<TestConfiguration 
  config={testConfig}
  onConfigChange={setTestConfig}
  onStart={handleStartTest}
/>

// Interface de test
<TestInterface 
  test={currentTest}
  currentQuestion={currentQuestion}
  onAnswer={handleAnswer}
  onTimeUp={handleTimeUp}
/>

// Résultats
<TestResults 
  results={testResults}
  onRetry={handleRetry}
  onReviewErrors={handleReviewErrors}
/>
```

### Gestion du timer
```tsx
const [timeRemaining, setTimeRemaining] = useState(testConfig.timeLimit);
const [isPaused, setIsPaused] = useState(false);

useEffect(() => {
  if (timeRemaining <= 0) {
    handleTimeUp();
    return;
  }

  const timer = setInterval(() => {
    if (!isPaused) {
      setTimeRemaining(prev => prev - 1);
    }
  }, 1000);

  return () => clearInterval(timer);
}, [timeRemaining, isPaused]);
```

---

## 🏆 Leaderboard

**Chemin**: `/app/leaderboard/page.tsx`
**Description**: Classements ELO et statistiques

### Fonctionnalités principales
- **Classements solo** : Global et par classe
- **Classements multijoueur** : Global et par mode
- **Filtres** : Période, amis, classe
- **Recherche** : Par nom d'utilisateur
- **Statistiques personnelles** : Position et progression

### API routes utilisées
- `GET /api/leaderboard` - Classements
- `GET /api/leaderboard/user/[userId]` - Stats utilisateur
- `GET /api/leaderboard/classes` - Classements par classe

### Composants principaux
```tsx
// Tabs de navigation
<LeaderboardTabs 
  activeTab={activeTab}
  onTabChange={setActiveTab}
  tabs={['solo', 'multiplayer', 'classes']}
/>

// Tableau de classement
<LeaderboardTable 
  data={leaderboardData}
  userRank={userRank}
  loading={loading}
  onUserClick={handleUserClick}
/>

// Filtres
<LeaderboardFilters 
  filters={filters}
  onFiltersChange={setFilters}
/>
```

### Pagination et infini scroll
```tsx
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

const loadMore = useCallback(async () => {
  if (loading || !hasMore) return;
  
  setLoading(true);
  const newData = await fetchLeaderboard(page + 1);
  
  setLeaderboardData(prev => [...prev, ...newData]);
  setPage(prev => prev + 1);
  setHasMore(newData.length === 20);
  setLoading(false);
}, [page, loading, hasMore]);
```

---

## 🏫 Classes

**Chemin**: `/app/class-groups/page.tsx`
**Description**: Gestion des groupes de classes

### Fonctionnalités principales
- **Mes classes** : Classes rejointes par l'utilisateur
- **Rejoindre une classe** : Avec code d'invitation
- **Explorer** : Classes publiques disponibles
- **Créer une classe** : Pour les professeurs
- **Gestion** : Membres, statistiques, paramètres

### API routes utilisées
- `GET /api/class-groups` - Classes disponibles
- `GET /api/class-groups/my-classes` - Classes de l'utilisateur
- `POST /api/class-groups` - Créer classe
- `POST /api/class-groups/join` - Rejoindre classe
- `GET /api/class-groups/[id]/members` - Membres d'une classe

### Composants principaux
```tsx
// Tabs de navigation
<ClassTabs 
  activeTab={activeTab}
  onTabChange={setActiveTab}
  tabs={['my', 'all']}
/>

// Grid des classes
<ClassesGrid 
  classes={displayedClasses}
  onJoinClass={handleJoinClass}
  onManageClass={handleManageClass}
/>

// Modal de création
<CreateClassModal 
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onCreate={handleCreateClass}
/>
```

### Gestion des permissions
```tsx
const canCreateClass = profile?.user.role === 'teacher' || profile?.user.isTeacher;

const handleManageClass = (classId: string) => {
  const classItem = myClasses.find(c => c.id === classId);
  const isOwner = classItem?.teacherId === profile?.user.id;
  const isAdmin = profile?.user.role === 'admin';
  
  if (isOwner || isAdmin) {
    router.push(`/class-management/${classId}`);
  }
};
```

---

## 👥 Amis

**Chemin**: `/app/friends/page.tsx`
**Description**: Gestion des amis et demandes d'amitié

### Fonctionnalités principales
- **Liste d'amis** : Amis actifs avec statut
- **Demandes en attente** : Envoyées et reçues
- **Recherche** : Trouver des utilisateurs
- **Inviter** : Envoyer des demandes d'amitié
- **Messagerie** : Discuter avec les amis

### API routes utilisées
- `GET /api/friends` - Liste d'amis
- `POST /api/friends` - Gérer demandes
- `GET /api/users/search` - Rechercher utilisateurs
- `GET /api/messages` - Messages avec amis

### Composants principaux
```tsx
// Liste d'amis
<FriendsList 
  friends={friends}
  onlineFriends={onlineFriends}
  onFriendClick={handleFriendClick}
  onRemoveFriend={handleRemoveFriend}
/>

// Demandes
<FriendRequests 
  requests={friendRequests}
  onAccept={handleAcceptRequest}
  onDecline={handleDeclineRequest}
/>

// Recherche
<UserSearch 
  onUserSelect={handleUserSelect}
  onSendRequest={handleSendRequest}
/>
```

### Statut en temps réel
```tsx
const { subscribe } = useRealtime();

useEffect(() => {
  const unsubscribePresence = subscribe('presence:update', (payload) => {
    updateOnlineStatus(payload.userId, payload.isOnline);
  });

  const unsubscribeRequests = subscribe('friend_request:new', (payload) => {
    addFriendRequest(payload.request);
  });

  return () => {
    unsubscribePresence();
    unsubscribeRequests();
  };
}, [subscribe]);
```

---

## 💬 Messages

**Chemin**: `/app/messages/page.tsx`
**Description**: Messagerie interne et notifications

### Fonctionnalités principales
- **Conversations** : Liste des discussions
- **Chat** : Interface de messagerie
- **Notifications** : Centre de notifications
- **Recherche** : Dans les messages
- **Statuts** : Lu/non lu, archivé

### API routes utilisées
- `GET /api/messages` - Conversations et messages
- `POST /api/messages` - Envoyer message
- `GET /api/notifications` - Notifications
- `PUT /api/notifications/read` - Marquer comme lu

### Composants principaux
```tsx
// Liste des conversations
<ConversationList 
  conversations={conversations}
  activeConversation={activeConversation}
  onSelectConversation={setActiveConversation}
/>

// Chat
<ChatInterface 
  conversation={activeConversation}
  messages={messages}
  onSendMessage={handleSendMessage}
  onMarkAsRead={handleMarkAsRead}
/>

// Notifications
<NotificationCenter 
  notifications={notifications}
  onMarkAsRead={handleNotificationRead}
  onDelete={handleDeleteNotification}
/>
```

### Mise à jour en temps réel
```tsx
const { subscribe, publish } = useRealtime();

useEffect(() => {
  const unsubscribeMessages = subscribe(`conversation:${activeConversation?.id}`, (payload) => {
    addMessage(payload.message);
  });

  const unsubscribeNotifications = subscribe('notification:new', (payload) => {
    addNotification(payload.notification);
  });

  return () => {
    unsubscribeMessages();
    unsubscribeNotifications();
  };
}, [activeConversation?.id, subscribe]);
```

---

## 🔔 Notifications

**Chemin**: `/app/notifications/page.tsx`
**Description**: Centre de notifications centralisé

### Fonctionnalités principales
- **Liste des notifications** : Toutes les notifications
- **Filtres** : Par type, date, statut
- **Actions rapides** : Accepter/refuser directement
- **Préférences** : Types de notifications souhaitées
- **Historique** : Notifications archivées

### API routes utilisées
- `GET /api/notifications` - Liste des notifications
- `PUT /api/notifications/read` - Marquer comme lu
- `DELETE /api/notifications` - Supprimer notifications
- `POST /api/notifications/preferences` - Préférences

### Composants principaux
```tsx
// Filtres
<NotificationFilters 
  filters={filters}
  onFiltersChange={setFilters}
  types={['all', 'messages', 'challenges', 'achievements', 'classes']}
/>

// Liste
<NotificationList 
  notifications={filteredNotifications}
  onMarkAsRead={handleMarkAsRead}
  onDelete={handleDelete}
  onAction={handleNotificationAction}
/>

// Préférences
<NotificationPreferences 
  preferences={notificationPreferences}
  onSave={handleSavePreferences}
/>
```

---

## 🛠️ Administration

**Chemin**: `/app/admin/page.tsx`
**Description**: Panneau d'administration

### Fonctionnalités principales
- **Gestion utilisateurs** : Création, modification, suppression
- **Badges** : Création et attribution
- **Demandes professeur** : Validation des accès
- **Statistiques** : Vue d'ensemble du système
- **Support** : Gestion des tickets

### API routes utilisées
- `GET /api/admin/users` - Liste utilisateurs
- `GET /api/admin/badges` - Gestion badges
- `GET /api/admin/teacher-requests` - Demandes professeur
- `GET /api/tickets` - Tickets de support
- `GET /api/admin/analytics` - Statistiques système

### Composants principaux
```tsx
// Navigation admin
<AdminNavigation 
  activeSection={activeSection}
  onSectionChange={setActiveSection}
  sections={['users', 'badges', 'teacher-requests', 'analytics', 'support']}
/>

// Tableau utilisateurs
<UsersTable 
  users={users}
  onEditUser={handleEditUser}
  onDeleteUser={handleDeleteUser}
  onToggleRole={handleToggleRole}
/>

// Statistiques
<AnalyticsDashboard 
  data={analyticsData}
  timeRange={timeRange}
  onTimeRangeChange={setTimeRange}
/>
```

### Permissions et sécurité
```tsx
const { profile } = useUserProfile();

const isAdmin = profile?.user.role === 'admin';
const isTeacher = profile?.user.role === 'teacher' || profile?.user.isTeacher;

// Middleware de protection
useEffect(() => {
  if (!isAdmin) {
    router.push('/dashboard');
    return;
  }
}, [isAdmin]);
```

---

## 📱 Responsive Design

### Breakpoints utilisés
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px  
- **Desktop** : > 1024px

### Stratégies responsive
```tsx
// Layout adaptatif
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Contenu */}
</div>

// Navigation mobile
<MobileNavigation 
  isOpen={isMobileMenuOpen}
  onClose={() => setIsMobileMenuOpen(false)}
/>

// Hook de détection
const { isMobile, isTablet, isDesktop } = useBreakpoint();
```

---

## 🎯 Bonnes pratiques

### 1. Gestion d'état
- Utiliser les hooks personnalisés pour la logique complexe
- Éviter les états globaux quand possible
- Privilégier le lifting state up

### 2. Performance
- Code splitting avec dynamic imports
- Lazy loading des images et composants lourds
- Optimisation des re-rendus avec React.memo

### 3. Accessibilité
- Navigation au clavier complète
- Attributs ARIA appropriés
- Contrastes et tailles de police adéquats

### 4. SEO
- Meta tags descriptifs
- URLs propres et sémantiques
- Structured data pour le contenu important

---

## 📁 Structure des pages

```
/app/
├── (auth)/           # Pages d'authentification
│   ├── login/
│   └── register/
├── (dashboard)/      # Pages protégées
│   ├── dashboard/
│   ├── profile/
│   ├── multiplayer/
│   ├── practice/
│   └── leaderboard/
├── (social)/         # Pages sociales
│   ├── friends/
│   ├── messages/
│   └── notifications/
├── (education)/      # Pages éducation
│   ├── class-groups/
│   ├── courses/
│   └── history/
├── (admin)/          # Pages admin
│   └── admin/
├── api/              # Routes API
└── globals.css        # Styles globaux
```

---

**Cette documentation est maintenue à jour avec chaque modification de page.**
