# MIDDLEWARE — Documentation du middleware et protections

## 📋 Table des matières
- [Middleware principal](#middleware-principal)
- [Protection des routes](#protection-des-routes)
- [Gestion des rôles](#gestion-des-rôles)
- [Rate limiting](#rate-limiting)
- [Sécurité](#sécurité)
- [Logging et monitoring](#logging-et-monitoring)

---

## 🔐 Middleware principal

**Chemin**: `/middleware.ts`
**Description**: Middleware Next.js pour la protection des routes et la gestion des sessions

### Configuration de base
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const { pathname } = request.nextUrl;
  
  // Logique de protection et redirection
  return handleRouteProtection(request, token, pathname);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
```

### Fonctions de protection
```typescript
async function handleRouteProtection(
  request: NextRequest, 
  token: any, 
  pathname: string
): Promise<NextResponse> {
  // Routes publiques
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/api/auth',
  ];
  
  // Routes nécessitant une authentification
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/multiplayer',
    '/practice',
    '/leaderboard',
    '/friends',
    '/messages',
    '/notifications',
    '/class-groups',
  ];
  
  // Routes admin uniquement
  const adminRoutes = [
    '/admin',
    '/api/admin',
  ];
  
  // Routes professeur uniquement
  const teacherRoutes = [
    '/class-management',
    '/teacher-settings',
  ];
  
  // Vérification des routes publiques
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Vérification de l'authentification
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Vérification des droits admin
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Vérification des droits professeur
  if (teacherRoutes.some(route => pathname.startsWith(route))) {
    if (!token || (token.role !== 'admin' && !token.isTeacher)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}
```

---

## 🛡️ Protection des routes

### 1. Middleware côté client
**Chemin**: `/components/ProtectedRoute.tsx`
**Description**: Composant HOC pour protéger les routes côté client

```typescript
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'admin' | 'teacher';
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  fallback = <div>Chargement...</div>
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (requiredRole === 'admin' && session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    if (requiredRole === 'teacher' && 
        session.user.role !== 'admin' && 
        !session.user.isTeacher) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router, requiredRole]);
  
  if (status === 'loading') {
    return fallback;
  }
  
  if (!session) {
    return null;
  }
  
  // Vérification des rôles
  if (requiredRole === 'admin' && session.user.role !== 'admin') {
    return null;
  }
  
  if (requiredRole === 'teacher' && 
      session.user.role !== 'admin' && 
      !session.user.isTeacher) {
    return null;
  }
  
  return <>{children}</>;
}
```

### 2. Hook de protection
**Chemin**: `/hooks/useProtectedRoute.ts`
**Description**: Hook personnalisé pour la protection des routes

```typescript
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useProtectedRoute(requiredRole?: 'admin' | 'teacher') {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (requiredRole === 'admin' && session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    if (requiredRole === 'teacher' && 
        session.user.role !== 'admin' && 
        !session.user.isTeacher) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router, requiredRole]);
  
  return {
    session,
    status,
    isAuthorized: status === 'authenticated' && (
      !requiredRole || 
      (requiredRole === 'admin' && session?.user.role === 'admin') ||
      (requiredRole === 'teacher' && (
        session?.user.role === 'admin' || 
        session?.user.isTeacher
      ))
    )
  };
}
```

---

## 👥 Gestion des rôles

### 1. Types de rôles
```typescript
export type UserRole = 'user' | 'admin' | 'teacher';

export interface UserWithRole {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isTeacher: boolean; // Pour les professeurs validés
  permissions: Permission[];
}

export type Permission = 
  | 'read:profile'
  | 'write:profile'
  | 'read:users'
  | 'write:users'
  | 'read:admin'
  | 'write:admin'
  | 'manage:classes'
  | 'manage:badges'
  | 'manage:notifications';
```

### 2. Vérification des permissions
**Chemin**: `/lib/permissions.ts`
**Description**: Utilitaires de vérification des permissions

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    'read:profile',
    'write:profile',
  ],
  teacher: [
    'read:profile',
    'write:profile',
    'manage:classes',
  ],
  admin: [
    'read:profile',
    'write:profile',
    'read:users',
    'write:users',
    'read:admin',
    'write:admin',
    'manage:classes',
    'manage:badges',
    'manage:notifications',
  ],
};

export function hasPermission(
  user: UserWithRole, 
  permission: Permission
): boolean {
  return user.permissions.includes(permission);
}

export function hasRole(user: UserWithRole, role: UserRole): boolean {
  if (role === 'admin') {
    return user.role === 'admin';
  }
  
  if (role === 'teacher') {
    return user.role === 'admin' || user.isTeacher;
  }
  
  return true; // user
}

export function requirePermission(
  user: UserWithRole | null | undefined,
  permission: Permission
): asserts user is UserWithRole {
  if (!user || !hasPermission(user, permission)) {
    throw new Error(`Permission requise: ${permission}`);
  }
}
```

### 3. Middleware de permissions
**Chemin**: `/middleware/permissionMiddleware.ts`
**Description**: Middleware pour vérifier les permissions spécifiques

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Permission, hasPermission } from '@/lib/permissions';

export function withPermission(
  permission: Permission,
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any) => {
    const token = await getToken({ 
      req: req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' }, 
        { status: 401 }
      );
    }
    
    if (!hasPermission(token as any, permission)) {
      return NextResponse.json(
        { error: 'Permission refusée' }, 
        { status: 403 }
      );
    }
    
    return handler(req, context);
  };
}
```

---

## ⏱️ Rate Limiting

### 1. Configuration Redis
**Chemin**: `/lib/rateLimit.ts`
**Description**: Configuration du rate limiting avec Redis

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en ms
  maxRequests: number; // Nombre max de requêtes
  keyGenerator?: (req: NextRequest) => string;
  message?: string;
}

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number }> {
  const key = config.keyGenerator 
    ? config.keyGenerator(req)
    : `rate_limit:${req.ip}`;
  
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // Nettoyer les anciennes entrées
  await redis.zremrangebyscore(key, 0, windowStart);
  
  // Compter les requêtes dans la fenêtre
  const current = await redis.zcard(key);
  
  if (current >= config.maxRequests) {
    return { success: false, remaining: 0 };
  }
  
  // Ajouter la requête actuelle
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, Math.ceil(config.windowMs / 1000));
  
  return { 
    success: true, 
    remaining: config.maxRequests - current - 1 
  };
}
```

### 2. Middleware de rate limiting
**Chemin**: `/middleware/rateLimitMiddleware.ts`
**Description**: Middleware pour appliquer le rate limiting

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

const RATE_LIMIT_CONFIGS = {
  '/api/auth': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 req/15min
  '/api/profile': { windowMs: 60 * 1000, maxRequests: 100 }, // 100 req/min
  '/api/multiplayer': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 req/min
  '/api/messages': { windowMs: 60 * 1000, maxRequests: 60 }, // 60 req/min
  default: { windowMs: 60 * 1000, maxRequests: 1000 }, // 1000 req/min
};

export function withRateLimit(
  path: string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const config = RATE_LIMIT_CONFIGS[path] || RATE_LIMIT_CONFIGS.default;
    
    const { success, remaining } = await rateLimit(req, config);
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Trop de requêtes',
          message: `Limite dépassée. Réessayez plus tard.`,
          retryAfter: Math.ceil(config.windowMs / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
          }
        }
      );
    }
    
    const response = await handler(req);
    
    // Ajouter les headers de rate limiting
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    
    return response;
  };
}
```

---

## 🔒 Sécurité

### 1. Headers de sécurité
**Chemin**: `/middleware/securityHeaders.ts`
**Description**: Ajout des headers de sécurité

```typescript
import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prévenir le clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prévenir le MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Politique de sécurité de contenu
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.supabase.co",
      "frame-src 'none'",
    ].join('; ')
  );
  
  // Politique de référent
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  
  return response;
}
```

### 2. Validation des inputs
**Chemin**: `/lib/validation.ts`
**Description**: Schémas de validation avec Zod

```typescript
import { z } from 'zod';

// Schéma de validation pour les profils
export const profileSchema = z.object({
  displayName: z.string()
    .min(1, 'Le nom d\'affichage est requis')
    .max(50, 'Le nom d\'affichage ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Caractères invalides'),
  
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit faire au moins 3 caractères')
    .max(20, 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Caractères autorisés: lettres, chiffres, _, -'),
  
  email: z.string()
    .email('Email invalide')
    .max(255, 'Email trop long'),
});

// Schéma pour la création de partie
export const gameCreationSchema = z.object({
  gameType: z.enum(['ranked_1v1', 'casual_1v1', 'group_quiz']),
  timeControl: z.enum(['bullet', 'blitz', 'rapid']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  questionCount: z.number()
    .int('Le nombre de questions doit être entier')
    .min(5, 'Minimum 5 questions')
    .max(50, 'Maximum 50 questions'),
  isPrivate: z.boolean().default(false),
  maxPlayers: z.number()
    .int()
    .min(2)
    .max(10)
    .optional(),
});

// Middleware de validation
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        };
      }
      return { success: false, error: 'Erreur de validation' };
    }
  };
}
```

### 3. Protection CSRF
**Chemin**: `/lib/csrf.ts`
**Description**: Protection contre les attaques CSRF

```typescript
import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCSRFToken(
  token: string, 
  sessionToken: string
): boolean {
  // Implémentation simple - en production, utiliser Redis
  const expectedToken = crypto
    .createHash('sha256')
    .update(sessionToken + process.env.CSRF_SECRET!)
    .digest('hex');
  
  return token === expectedToken;
}

// Middleware CSRF
export function withCSRFProtection(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    if (req.method !== 'GET') {
      const csrfToken = req.headers.get('x-csrf-token');
      const sessionToken = req.headers.get('authorization');
      
      if (!csrfToken || !sessionToken || 
          !validateCSRFToken(csrfToken, sessionToken)) {
        return NextResponse.json(
          { error: 'Token CSRF invalide' },
          { status: 403 }
        );
      }
    }
    
    return handler(req);
  };
}
```

---

## 📊 Logging et monitoring

### 1. Configuration du logging
**Chemin**: `/lib/logger.ts`
**Description**: Système de logging structuré

```typescript
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: any;
  metadata?: Record<string, any>;
}

class Logger {
  private context: Partial<LogEntry> = {};
  
  constructor(context: Partial<LogEntry> = {}) {
    this.context = context;
  }
  
  private log(level: LogLevel, message: string, data: Partial<LogEntry> = {}) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...data,
    };
    
    // En production, envoyer vers un service de logging
    if (process.env.NODE_ENV === 'production') {
      // Envoyer vers Datadog, Sentry, etc.
      this.sendToExternalService(entry);
    } else {
      // En développement, logger dans la console
      console.log(`[${level.toUpperCase()}] ${message}`, entry);
    }
  }
  
  error(message: string, data?: Partial<LogEntry>) {
    this.log(LogLevel.ERROR, message, data);
  }
  
  warn(message: string, data?: Partial<LogEntry>) {
    this.log(LogLevel.WARN, message, data);
  }
  
  info(message: string, data?: Partial<LogEntry>) {
    this.log(LogLevel.INFO, message, data);
  }
  
  debug(message: string, data?: Partial<LogEntry>) {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  private async sendToExternalService(entry: LogEntry) {
    // Implémenter l'envoi vers le service de logging
    // Ex: fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
  }
}

export const logger = new Logger();
```

### 2. Middleware de logging
**Chemin**: `/middleware/loggingMiddleware.ts`
**Description**: Middleware pour logger les requêtes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export function withLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const url = req.url;
    const method = req.method;
    const ip = req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;
      
      logger.info(`${method} ${url}`, {
        method,
        path: new URL(url).pathname,
        statusCode: response.status,
        duration,
        ip,
        userAgent,
      });
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(`${method} ${url} - Erreur`, {
        method,
        path: new URL(url).pathname,
        statusCode: 500,
        duration,
        ip,
        userAgent,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  };
}
```

### 3. Monitoring des performances
**Chemin**: `/lib/performance.ts`
**Description**: Suivi des performances

```typescript
interface PerformanceMetrics {
  route: string;
  method: string;
  duration: number;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Garder les 1000 dernières mesures
  
  record(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Garder seulement les dernières mesures
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Alertes si performance dégradée
    if (metric.duration > 5000) { // 5 secondes
      logger.warn('Performance dégradée', {
        route: metric.route,
        duration: metric.duration,
      });
    }
  }
  
  getAverageResponseTime(route?: string): number {
    const filtered = route 
      ? this.metrics.filter(m => m.route === route)
      : this.metrics;
    
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }
  
  getSlowRoutes(limit: number = 10): Array<{route: string, avgDuration: number}> {
    const routeStats = new Map<string, {total: number, count: number}>();
    
    this.metrics.forEach(metric => {
      const current = routeStats.get(metric.route) || {total: 0, count: 0};
      routeStats.set(metric.route, {
        total: current.total + metric.duration,
        count: current.count + 1,
      });
    });
    
    return Array.from(routeStats.entries())
      .map(([route, stats]) => ({
        route,
        avgDuration: stats.total / stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

---

## 🎯 Utilisation pratique

### 1. Protection d'une route API
```typescript
// app/api/admin/users/route.ts
import { withPermission, withRateLimit, withLogging } from '@/middleware';
import { Permission } from '@/lib/permissions';

export const GET = withLogging(
  withRateLimit('/api/admin',
    withPermission('read:users', async (req) => {
      // Logique de récupération des utilisateurs
      const users = await getUsers();
      return NextResponse.json({ users });
    })
  )
);
```

### 2. Protection d'une page
```typescript
// app/admin/page.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

### 3. Validation dans une API route
```typescript
// app/api/profile/route.ts
import { validateBody, profileSchema } from '@/lib/validation';

export async function PUT(req: NextRequest) {
  const validation = await validateBody(profileSchema);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Données invalides', errors: validation.errors },
      { status: 400 }
    );
  }
  
  // Utiliser validation.data
  const updatedUser = await updateProfile(validation.data);
  return NextResponse.json({ user: updatedUser });
}
```

---

## 🔧 Configuration et déploiement

### Variables d'environnement requises
```env
# Sécurité
NEXTAUTH_SECRET="votre_secret_32_caracteres_minimum"
CSRF_SECRET="votre_secret_csrf"

# Redis pour rate limiting
REDIS_URL="redis://user:password@host:port"

# Logging
LOG_LEVEL="info" # debug, info, warn, error
EXTERNAL_LOG_SERVICE_URL="https://votre-service-de-logs.com"
```

### Monitoring en production
- **Alertes** : Configurer des alertes pour les erreurs et performances
- **Dashboard** : Utiliser Grafana ou équivalent pour visualiser les métriques
- **Logs** : Centraliser les logs avec ELK Stack ou équivalent

---

**Cette documentation est maintenue à jour avec chaque modification du middleware.**
