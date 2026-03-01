# AUTH — NextAuth, sessions, middleware

## 📍 Localisation
- Page : Configuration authentification
- Fichiers : /lib/auth.ts, /app/api/auth/[...nextauth]/route.ts
- Middleware : /middleware.ts
- Providers : /components/AuthProvider.tsx

## 🗄️ Tables Supabase/Prisma utilisées
| Table | Opérations | Champs utilisés |
|-------|-----------|-----------------|
| users | SELECT, INSERT, UPDATE | id, email, username, password, soloElo, multiplayerElo, role, hasCompletedOnboarding |

## 🔌 API Routes
| Route | Méthode | Paramètres | Retourne | Erreurs connues |
|-------|---------|------------|----------|-----------------|
| /api/auth/[...nextauth] | ALL | - | Session | 401 si unauthorized |
| /api/auth/register | POST | email, username, password | User | 400 si email exists |
| /api/auth/check | GET | - | Session | 401 si no session |
| /api/auth/refresh | POST | - | New tokens | 500 if error |

## 📦 Variables et Types
```typescript
// Configuration NextAuth
export const authOptions: NextAuthOptions = {
  providers: [GoogleProvider, DiscordProvider, CredentialsProvider],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: { signIn, jwt, session }
}

// Types de session
type Session = {
  user: {
    id: string
    email: string
    username: string
    displayName?: string
    soloElo: number
    multiplayerElo: number
    role: 'user' | 'admin' | 'teacher'
    hasCompletedOnboarding: boolean
  }
  expires: string
}

// Types de token JWT
type JWT = {
  id: string
  email: string
  username: string
  soloElo: number
  multiplayerElo: number
  role: string
}
```

## 🔗 Dépendances externes
- **Libs** : NextAuth.js v4, bcryptjs, Prisma
- **Providers OAuth** : Google, Discord
- **Variables d'environnement** : NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET

## ⚠️ Erreurs connues et pièges à éviter
- ❌ **Ne jamais utiliser getSession() côté serveur** → utiliser getToken()
- ❌ **Ne pas utiliser de champs deprecated dans callbacks** (elo, rankClass) → utiliser soloElo, multiplayerElo
- ❌ **Ne pas oublier de mettre à jour les callbacks après refactoring**
- ❌ **Ne pas stocker de mots de passe en clair** → utiliser bcrypt.hash()
- ❌ **Ne pas utiliser de cookies non sécurisés en production**

## 🔄 Interactions avec d'autres pages
- **Toutes les pages** utilisent useSession() pour l'authentification
- **Profile** : Met à jour les infos utilisateur après connexion
- **Onboarding** : Redirection si hasCompletedOnboarding = false
- **Admin** : Vérification role = 'admin' dans callbacks
- **Discord** : Liaison compte Discord dans callbacks OAuth

## 📝 Notes importantes
- **OAuth providers** : Google et Discord configurés avec scopes appropriés
- **Strategy JWT** : Utilisée pour la performance et la scalabilité
- **Session duration** : 30 jours par défaut
- **Password hashing** : bcryptjs avec salt rounds = 12
- **Middleware** : Protection des routes privées
- **Callbacks** : Gestion automatique de la création d'utilisateurs OAuth

---

## 🔐 Configuration détaillée

### Providers OAuth
```typescript
// Google OAuth
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
})

// Discord OAuth  
DiscordProvider({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  authorization: {
    params: {
      scope: 'identify email',
      response_type: 'code',
    },
  },
})
```

### Callbacks importants
```typescript
// Callback signIn - Création automatique utilisateur OAuth
async signIn({ user, account }) {
  if (account?.provider === 'google' || account?.provider === 'discord') {
    let existingUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });
    
    if (!existingUser) {
      // Création automatique avec valeurs par défaut
      existingUser = await prisma.user.create({
        data: {
          email: user.email!,
          username: user.email!.split('@')[0], // Temporaire
          displayName: user.name,
          soloElo: 400,
          multiplayerElo: 400,
          hasCompletedOnboarding: false,
        },
      });
    }
    
    return true;
  }
  return true;
}

// Callback jwt - Ajout des champs personnalisés
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.username = user.username;
    token.soloElo = user.soloElo;
    token.multiplayerElo = user.multiplayerElo;
    token.role = user.role;
  }
  return token;
}

// Callback session - Transmission à useSession()
async session({ session, token }) {
  if (token) {
    session.user.id = token.id;
    session.user.username = token.username;
    session.user.soloElo = token.soloElo;
    session.user.multiplayerElo = token.multiplayerElo;
    session.user.role = token.role;
  }
  return session;
}
```

### Middleware de protection
```typescript
// /middleware.ts
export { auth } from '@/lib/auth'
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnProfile = req.nextUrl.pathname.startsWith('/profile')
  
  if (!isLoggedIn && (isOnDashboard || isOnProfile)) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
})
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 🚨 Erreurs spécifiques à corriger

### Dans le callback authorize (CredentialsProvider)
```typescript
// ❌ ERREUR - Champs deprecated
return {
  id: user.id,
  email: user.email,
  username: user.username,
  displayName: user.displayName,
  elo: user.elo,           // ← ERREUR
  rankClass: user.rankClass, // ← ERREUR
  hasCompletedOnboarding: user.hasCompletedOnboarding,
} as any;

// ✅ CORRECTION - Champs unifiés
return {
  id: user.id,
  email: user.email,
  username: user.username,
  displayName: user.displayName,
  soloElo: user.soloElo,
  multiplayerElo: user.multiplayerElo,
  soloRankClass: user.soloRankClass,
  multiplayerRankClass: user.multiplayerRankClass,
  hasCompletedOnboarding: user.hasCompletedOnboarding,
} as any;
```

### Dans les callbacks OAuth
```typescript
// ❌ ERREUR - Champs manquants
await prisma.user.create({
  data: {
    email: user.email!,
    username: user.email!.split('@')[0],
    displayName: user.name,
    // Manque soloElo, multiplayerElo, etc.
  },
});

// ✅ CORRECTION - Tous les champs requis
await prisma.user.create({
  data: {
    email: user.email!,
    username: user.email!.split('@')[0],
    displayName: user.name,
    soloElo: 400,
    soloRankClass: 'F-',
    multiplayerElo: 400,
    multiplayerRankClass: 'F-',
    hasCompletedOnboarding: false,
  },
});
```

---

## 🔧 Utilisation côté client

### Hook useSession
```typescript
'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

export function UserProfile() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>
  
  return (
    <div>
      <h1>Welcome {session.user.username}</h1>
      <p>Solo ELO: {session.user.soloElo}</p>
      <p>Multiplayer ELO: {session.user.multiplayerElo}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
```

### Appel API côté serveur
```typescript
import { getToken } from 'next-auth/jwt'

export async function GET(req: Request) {
  const token = await getToken({ req })
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Utiliser token.id, token.username, etc.
  const user = await prisma.user.findUnique({
    where: { id: token.id as string }
  })
  
  return NextResponse.json({ user })
}
```

---

## 📋 Variables d'environnement requises

```env
# NextAuth
NEXTAUTH_URL=https://maths-app.com
NEXTAUTH_SECRET=votre_secret_très_long_et_aléatoire

# OAuth Google
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret

# OAuth Discord  
DISCORD_CLIENT_ID=votre_discord_client_id
DISCORD_CLIENT_SECRET=votre_discord_client_secret
```

---

**Cette documentation couvre tout le système d'authentification. Toute modification doit être répercutée ici et les callbacks maintenus à jour avec le schéma de données.**
