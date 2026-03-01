// GUIDE DE REMPLACEMENT DES OCCURRENCES "KAHOOT"

## 🔧 ÉTAPE 4 - NETTOYAGE DES OCCURRENCES "KAHOOT"

### **Fichiers à renommer/modifier :**

#### **1. Pages et Components**
```bash
# Renommer les dossiers et fichiers
mv /src/app/multiplayer/kahoot /src/app/multiplayer/group
mv /src/app/multiplayer/kahoot/[sessionId]/page.tsx /src/app/multiplayer/group/[sessionId]/page.tsx

# Remplacer l'ancienne page
mv /src/app/multiplayer/page.tsx /src/app/multiplayer/page-old.tsx
mv /src/app/multiplayer/page-unified.tsx /src/app/multiplayer/page.tsx
```

#### **2. API Routes**
```bash
# Renommer les dossiers API
mv /src/app/api/game/kahoot /src/app/api/game/group

# Remplacer les routes unifiées
mv /src/app/api/game/create/route.ts /src/app/api/game/create-old.ts
mv /src/app/api/game/create-unified.ts /src/app/api/game/create/route.ts

mv /src/app/api/game/join/route.ts /src/app/api/game/join-old.ts
mv /src/app/api/game/join-unified.ts /src/app/api/game/join/route.ts

mv /src/app/api/game/start/route.ts /src/app/api/game/start-old.ts
mv /src/app/api/game/start-unified.ts /src/app/api/game/start/route.ts
```

#### **3. Remplacements dans le code**

**Dans `/src/app/multiplayer/group/[sessionId]/page.tsx` :**
```typescript
// Remplacer
interface GameSession { ... } // Garder mais mettre à jour les références
interface KahootQuestion { ... } → interface GameQuestion { ... }

// Remplacer les imports
import { GameSession, GameQuestion } from '@/types/unified-multiplayer';

// Remplacer les appels API
'/api/game/kahoot/session/[sessionId]' → '/api/game/group/session/[sessionId]'
'/api/game/kahoot/[sessionId]/start' → '/api/game/[sessionId]/start'
```

**Dans `/src/app/api/game/group/session/[sessionId]/route.ts` :**
```typescript
// Remplacer
"SELECT * FROM game_sessions" → Garder (même table)
"SELECT * FROM kahoot_questions" → "SELECT * FROM game_questions"
```

**Dans `/src/app/api/game/group/[sessionId]/start/route.ts` :**
```typescript
// Remplacer
player.user.elo → player.user.multiplayerElo
```

#### **4. Mises à jour Prisma**

**Dans `prisma/schema.prisma` :**
```prisma
// Remplacer le modèle
model KahootQuestion { ... } → model GameQuestion { ... }

// Mettre à jour les relations
game_sessions kahootQuestions → game_sessions questions
```

#### **5. Nettoyage des anciens fichiers**
```bash
# Supprimer les anciennes implémentations après validation
rm -rf /src/app/multiplayer/page-old.tsx
rm -rf /src/app/api/game/create-old.ts
rm -rf /src/app/api/game/join-old.ts
rm -rf /src/app/api/game/start-old.ts

# Supprimer les anciennes routes 1v1 dupliquées
rm -rf /src/app/multiplayer/random/
rm -rf /src/app/multiplayer/join/
```

#### **6. Remplacements textuels globaux**

**Rechercher et remplacer dans tout le projet :**
- `"Mode Kahoot"` → `"Partie de groupe"`
- `"mode Kahoot"` → `"mode groupe"`
- `"Kahoot"` → `"Quiz multijoueur"` (sauf dans les noms de fichiers/variables)
- `"kahoot"` → `"group"` (dans les URLs et noms de variables)
- `"KahootQuestion"` → `"GameQuestion"`
- `"startKahootGame"` → `"startGroupGame"`

#### **7. Mises à jour des imports**

**Dans les fichiers qui importent les anciens types :**
```typescript
// Remplacer
import { KahootQuestion } from '@/types/...' → import { GameQuestion } from '@/types/unified-multiplayer'
```

#### **8. Vérification finale**

**Après tous les remplacements, vérifier :**
```bash
npm run build
npm run dev
```

**Tester les fonctionnalités :**
- ✅ Création de partie groupe
- ✅ Rejoindre avec code
- ✅ QR code
- ✅ Lobby temps réel
- ✅ Mode 1v1 ranked/casual
- ✅ Matchmaking

---

## 🎯 **ORDRE DES OPÉRATIONS**

1. **Appliquer la migration SQL** (`migration_unified_multiplayer.sql`)
2. **Mettre à jour Prisma** et regénérer le client
3. **Renommer les fichiers/dossiers**
4. **Appliquer les remplacements textuels**
5. **Tester le build**
6. **Supprimer les anciens fichiers**
7. **Test final complet**

---

**⚠️ ATTENTION :** Faire des sauvegardes avant de supprimer des fichiers !
