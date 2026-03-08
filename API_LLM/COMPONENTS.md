# COMPONENTS — Documentation des composants réutilisables

## 📋 Table des matières
- [Composants UI de base](#composants-ui-de-base)
- [Composants de formulaires](#composants-de-formulaires)
- [Composants de jeu](#composants-de-jeu)
- [Composants de profil](#composants-de-profil)
- [Composants administratifs](#composants-administratifs)
- [Composants de notification](#composants-de-notification)
- [Hooks personnalisés](#hooks-personnalisés)

---

## 🎨 Composants UI de base

### Button
**Chemin**: `/components/ui/Button.tsx`
**Description**: Bouton réutilisable avec plusieurs variantes

#### Props:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

#### Exemples:
```tsx
// Bouton primaire
<Button variant="primary" size="md" onClick={handleSubmit}>
  Envoyer
</Button>

// Bouton avec icône
<Button variant="secondary" icon={<Plus />} iconPosition="left">
  Ajouter
</Button>

// Bouton chargement
<Button loading disabled>
  Traitement...
</Button>
```

### Card
**Chemin**: `/components/ui/Card.tsx`
**Description**: Carte réutilisable avec header et content

#### Props:
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}
```

#### Exemples:
```tsx
<Card 
  title="Statistiques" 
  subtitle="Vue d'ensemble"
  actions={<Button>Modifier</Button>}
>
  <p>Contenu de la carte...</p>
</Card>
```

### Modal
**Chemin**: `/components/ui/Modal.tsx`
**Description**: Modale réutilisable avec overlay

#### Props:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### Exemples:
```tsx
<Modal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)}
  title="Confirmation"
  size="md"
>
  <p>Êtes-vous sûr de vouloir continuer ?</p>
  <Modal.Footer>
    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
      Annuler
    </Button>
    <Button onClick={handleConfirm}>
      Confirmer
    </Button>
  </Modal.Footer>
</Modal>
```

### Badge
**Chemin**: `/components/ui/Badge.tsx`
**Description**: Badge réutilisable avec plusieurs couleurs

#### Props:
```typescript
interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}
```

#### Exemples:
```tsx
<Badge variant="success">Actif</Badge>
<Badge variant="warning" size="sm">En attente</Badge>
```

---

## 📝 Composants de formulaires

### FormInput
**Chemin**: `/components/forms/FormInput.tsx`
**Description**: Champ de formulaire avec validation

#### Props:
```typescript
interface FormInputProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}
```

#### Exemples:
```tsx
<FormInput
  label="Email"
  name="email"
  type="email"
  placeholder="votre@email.com"
  required
  error={errors.email}
  value={email}
  onChange={setEmail}
/>
```

### FormSelect
**Chemin**: `/components/forms/FormSelect.tsx`
**Description**: Champ de sélection avec options

#### Props:
```typescript
interface FormSelectProps {
  label?: string;
  name: string;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;
}
```

#### Exemples:
```tsx
<FormSelect
  label="Difficulté"
  name="difficulty"
  options={[
    { value: 'easy', label: 'Facile' },
    { value: 'medium', label: 'Moyen' },
    { value: 'hard', label: 'Difficile' }
  ]}
  value={difficulty}
  onChange={setDifficulty}
/>
```

### FormCheckbox
**Chemin**: `/components/forms/FormCheckbox.tsx`
**Description**: Case à cocher personnalisée

#### Props:
```typescript
interface FormCheckboxProps {
  label?: string;
  name: string;
  checked?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
}
```

---

## 🎮 Composants de jeu

### GameCard
**Chemin**: `/components/game/GameCard.tsx`
**Description**: Carte pour afficher une partie ou un test

#### Props:
```typescript
interface GameCardProps {
  game: {
    id: string;
    type: 'solo' | 'multiplayer';
    status: 'waiting' | 'playing' | 'finished';
    score?: number;
    opponent?: User;
    createdAt: string;
  };
  onClick?: () => void;
  actions?: React.ReactNode;
}
```

### QuestionCard
**Chemin**: `/components/game/QuestionCard.tsx`
**Description**: Carte pour afficher une question

#### Props:
```typescript
interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    type: 'multiple' | 'text' | 'numeric';
    options?: string[];
    timeLimit?: number;
    points?: number;
  };
  onAnswer?: (answer: string | number) => void;
  showResult?: boolean;
  userAnswer?: string | number;
  correctAnswer?: string | number;
}
```

### Timer
**Chemin**: `/components/game/Timer.tsx`
**Description**: Compteur de temps pour les jeux

#### Props:
```typescript
interface TimerProps {
  duration: number; // en secondes
  onTimeUp?: () => void;
  onTick?: (remaining: number) => void;
  autoStart?: boolean;
  showMinutes?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'warning' | 'danger';
}
```

---

## 👤 Composants de profil

### UserAvatar
**Chemin**: `/components/profile/UserAvatar.tsx`
**Description**: Avatar utilisateur avec fallback

#### Props:
```typescript
interface UserAvatarProps {
  user: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  showRank?: boolean;
  onClick?: () => void;
  className?: string;
}
```

#### Exemples:
```tsx
<UserAvatar 
  user={user} 
  size="lg" 
  showStatus 
  showRank 
  onClick={() => router.push(`/profile/${user.id}`)}
/>
```

### UserCard
**Chemin**: `/components/profile/UserCard.tsx`
**Description**: Carte profil utilisateur

#### Props:
```typescript
interface UserCardProps {
  user: User;
  statistics?: {
    soloElo: number;
    multiplayerElo: number;
    totalGames: number;
    winRate: number;
  };
  showActions?: boolean;
  actions?: React.ReactNode;
  compact?: boolean;
}
```

### RankBadge
**Chemin**: `/components/profile/RankBadge.tsx`
**Description**: Badge de rang ELO

#### Props:
```typescript
interface RankBadgeProps {
  rank: string; // F-, F, E+, E++, S+, S++
  elo: number;
  size?: 'sm' | 'md' | 'lg';
  showElo?: boolean;
  animated?: boolean;
}
```

---

## 🛠️ Composants administratifs

### AdminTable
**Chemin**: `/components/admin/AdminTable.tsx`
**Description**: Tableau administratif réutilisable

#### Props:
```typescript
interface AdminTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  actions?: (row: T) => React.ReactNode;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
}
```

### AdminStats
**Chemin**: `/components/admin/AdminStats.tsx`
**Description**: Cartes de statistiques administratives

#### Props:
```typescript
interface AdminStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    change?: {
      value: number;
      type: 'increase' | 'decrease';
      period: string;
    };
    icon?: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'danger';
  }>;
  loading?: boolean;
}
```

---

## 🔔 Composants de notification

### NotificationItem
**Chemin**: `/components/notifications/NotificationItem.tsx`
**Description**: Élément de notification

#### Props:
```typescript
interface NotificationItemProps {
  notification: {
    id: string;
    type: 'message' | 'challenge' | 'friend_request' | 'achievement';
    title: string;
    content: string;
    createdAt: string;
    read: boolean;
    metadata?: Record<string, any>;
  };
  onRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAction?: (action: string, notification: any) => void;
}
```

### NotificationProvider
**Chemin**: `/components/NotificationProvider.tsx`
**Description**: Provider pour les notifications en temps réel

#### Props:
```typescript
interface NotificationProviderProps {
  children: React.ReactNode;
  pollingInterval?: number; // en millisecondes
  enableRealtime?: boolean;
}
```

---

## 🪝 Hooks personnalisés

### useUserProfile
**Chemin**: `/hooks/useUserProfile.ts`
**Description**: Hook pour récupérer le profil utilisateur

#### Retour:
```typescript
interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

#### Exemple:
```tsx
const { profile, loading, error, updateProfile } = useUserProfile();

if (loading) return <div>Chargement...</div>;
if (error) return <div>Erreur: {error}</div>;

return (
  <div>
    <h1>{profile?.user.displayName}</h1>
    <Button onClick={() => updateProfile({ displayName: 'Nouveau nom' })}>
      Mettre à jour
    </Button>
  </div>
);
```

### useNotifications
**Chemin**: `/hooks/useNotifications.ts`
**Description**: Hook pour gérer les notifications

#### Retour:
```typescript
interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (ids: string[]) => Promise<void>;
  deleteNotifications: (ids: string[]) => Promise<void>;
  refresh: () => Promise<void>;
}
```

### useGameSession
**Chemin**: `/hooks/useGameSession.ts`
**Description**: Hook pour gérer une session de jeu

#### Retour:
```typescript
interface UseGameSessionReturn {
  game: GameSession | null;
  currentQuestion: Question | null;
  score: number;
  timeRemaining: number;
  loading: boolean;
  error: string | null;
  startGame: () => Promise<void>;
  submitAnswer: (answer: string | number) => Promise<void>;
  nextQuestion: () => Promise<void>;
  finishGame: () => Promise<void>;
}
```

### useRealtime
**Chemin**: `/hooks/useRealtime.ts`
**Description**: Hook pour les fonctionnalités temps réel

#### Retour:
```typescript
interface UseRealtimeReturn {
  connected: boolean;
  subscribe: (channel: string, callback: (payload: any) => void) => void;
  unsubscribe: (channel: string) => void;
  publish: (channel: string, payload: any) => void;
}
```

---

## 🎨 Thème et styling

### useTheme
**Chemin**: `/hooks/useTheme.ts`
**Description**: Hook pour gérer le thème

#### Retour:
```typescript
interface UseThemeReturn {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}
```

### useBreakpoint
**Chemin**: `/hooks/useBreakpoint.ts`
**Description**: Hook pour détecter les breakpoints

#### Retour:
```typescript
interface UseBreakpointReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}
```

---

## 📱 Composants responsives

### ResponsiveGrid
**Chemin**: `/components/layout/ResponsiveGrid.tsx`
**Description**: Grille responsive automatique

#### Props:
```typescript
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number | string;
  className?: string;
}
```

#### Exemple:
```tsx
<ResponsiveGrid 
  cols={{ xs: 1, sm: 2, md: 3, lg: 4 }}
  gap={4}
>
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</ResponsiveGrid>
```

---

## 🎯 Bonnes pratiques

### 1. Composition over inheritance
Privilégiez la composition des composants :
```tsx
// ✅ Bon
<Card>
  <Card.Header>
    <Card.Title>Titre</Card.Title>
  </Card.Header>
  <Card.Body>Contenu</Card.Body>
</Card>

// ❌ Éviter
<Card title="Titre" body="Contenu" />
```

### 2. Props typées
Toujours typer les props avec TypeScript :
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}
```

### 3. Accessibilité
Ajouter les attributs ARIA nécessaires :
```tsx
<button
  aria-label="Fermer la modale"
  aria-expanded={isOpen}
  aria-controls="modal-content"
>
  <CloseIcon />
</button>
```

### 4. Performance
Utiliser React.memo pour les composants coûteux :
```tsx
const ExpensiveComponent = React.memo(({ data }) => {
  // logique coûteuse
  return <div>{/* ... */}</div>;
});
```

### 5. Tests unitaires
Chaque composant doit avoir son test :
```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

---

## 📁 Structure des dossiers

```
/components/
├── ui/              # Composants UI de base
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── Badge.tsx
├── forms/           # Composants de formulaires
│   ├── FormInput.tsx
│   ├── FormSelect.tsx
│   └── FormCheckbox.tsx
├── game/            # Composants de jeu
│   ├── GameCard.tsx
│   ├── QuestionCard.tsx
│   └── Timer.tsx
├── profile/         # Composants de profil
│   ├── UserAvatar.tsx
│   ├── UserCard.tsx
│   └── RankBadge.tsx
├── admin/           # Composants administratifs
│   ├── AdminTable.tsx
│   └── AdminStats.tsx
├── notifications/   # Composants de notification
│   └── NotificationItem.tsx
├── layout/          # Composants de layout
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── ResponsiveGrid.tsx
└── index.ts        # Exports principaux
```

---

**Cette documentation est maintenue à jour avec chaque ajout ou modification de composant.**
