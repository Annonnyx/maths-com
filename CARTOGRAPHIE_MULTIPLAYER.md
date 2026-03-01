# 🎯 **CARTOGRAPHIE DES 3 IMPLÉMENTATIONS MULTIJOUER**

## 📋 **TABLEAU COMPARATIF**

| FONCTIONNALITÉ          | MODE GROUPE (Kahoot) | MODE 1V1 | ANCIEN MODÈLE |
|------------------------|---------------------|-----------|---------------|
| **Sélection du mode** | ✓ (séparé)          | ✓ (séparé) | ❌ (fixe 1v1) |
| **Sélection du temps** | ❌ (fixe)           | ✓ (5 options) | ✓ (5 options) |
| **Code de partie**     | ✓ (6 char)          | ❌ (matchmaking) | ❌ (matchmaking) |
| **QR code**            | ✓                   | ❌ | ❌ |
| **Lobby temps réel**   | ✓ (Supabase)        | ✓ (Supabase) | ✓ (Supabase) |
| **Matchmaking auto**   | ❌ (code uniquement) | ✓ | ✓ |
| **Classement en fin**  | ✓ (score)           | ✓ (ELO) | ✓ (ELO) |
| **ELO ranked**         | ❌ (amical)          | ✓ | ✓ |

---

## 📁 **FICHIERS PAR IMPLÉMENTATION**

### **🟣 MODE GROUPE (Kahoot)**
**Pages/Components :**
- `/src/app/multiplayer/page.tsx` (lignes 423-599)
- `/src/app/multiplayer/kahoot/[sessionId]/page.tsx`
- `/src/app/multiplayer/join/page.tsx`

**API Routes :**
- `/src/app/api/game/create/route.ts` (création session)
- `/src/app/api/game/kahoot/session/[sessionId]/route.ts`
- `/src/app/api/game/kahoot/[sessionId]/start/route.ts`
- `/src/app/api/game/kahoot/question/[sessionId]/route.ts`

**Tables Supabase :**
- `game_sessions` (code, host_id, status, max_players)
- `game_players` (session_id, user_id, score, is_ready)
- `kahoot_questions` (session_id, question, answer)

**Fonctionnalités :**
- ✅ Code 6 caractères uniques
- ✅ QR code généré automatiquement
- ✅ Lobby temps réel avec Supabase
- ✅ Questions synchronisées
- ❌ Pas de matchmaking (code uniquement)
- ❌ Pas d'ELO (amical uniquement)

---

### **🔵 MODE 1V1**
**Pages/Components :**
- `/src/app/multiplayer/page.tsx` (lignes 462-499)
- `/src/app/multiplayer/random/page.tsx`
- `/src/app/multiplayer/game/[id]/page.tsx`

**API Routes :**
- `/src/app/api/multiplayer/route.ts` (création/matchmaking)
- `/src/app/api/multiplayer/clean/route.ts`
- `/src/app/api/multiplayer/clear-all/route.ts`
- `/src/app/api/multiplayer/game/[id]/finish/route.ts`

**Tables Supabase :**
- `multiplayer_games` (player1Id, player2Id, gameType, timeControl)
- `multiplayer_questions` (gameId, question, player1Answer, player2Answer)

**Fonctionnalités :**
- ✅ Matchmaking automatique
- ✅ 5 contrôles de temps (bullet, blitz, rapid, classical, thinking)
- ✅ Mode ranked/casual avec ELO
- ✅ Défis d'amis
- ❌ Pas de code d'accès
- ❌ Pas de QR code

---

### **🟢 ANCIEN MODÈLE (intégré dans page.tsx)**
**Pages/Components :**
- `/src/app/multiplayer/page.tsx` (lignes 610-716)

**API Routes :**
- Utilise les mêmes routes que le MODE 1V1

**Tables Supabase :**
- Utilise les mêmes tables que le MODE 1V1

**Fonctionnalités :**
- ✅ Interface unifiée dans la page principale
- ✅ Options de temps et type de partie
- ✅ Matchmaking et défis d'amis
- ✅ ELO ranked
- ❌ Pas de mode groupe
- ❌ Pas de codes/QR

---

## 🎯 **ANALYSE DES OCCURRENCES "KAHOOT"**

### **Fichiers concernés :**
1. **`/src/app/multiplayer/page.tsx`** - Interface principale
2. **`/src/app/multiplayer/kahoot/[sessionId]/page.tsx`** - Page de jeu groupe
3. **`/src/app/api/game/kahoot/`** - Toutes les API routes
4. **`/src/app/api/game/kahoot/[sessionId]/start/route.ts`** - Ligne 46 (player.user.elo)
5. **Commentaires et noms de fonctions** dans plusieurs fichiers

### **Occurrences à remplacer :**
- **Interface** : "Mode Kahoot" → "Partie de groupe"
- **API** : `/kahoot/` → `/group/`
- **Variables** : `kahootQuestions` → `groupQuestions`
- **Fonctions** : `startKahootGame` → `startGroupGame`

---

## 🚀 **RECOMMANDATIONS**

### **Modèle de données unifié proposé :**
Utiliser `game_sessions` comme base et ajouter :
- `game_mode`: 'ranked_1v1' | 'casual_1v1' | 'group_quiz'
- `time_control`: 'bullet' | 'blitz' | 'rapid' | 'classical' | 'custom'
- `time_per_question`: int (pour mode groupe)
- `max_players`: int (2 pour 1v1, jusqu'à 30 pour groupe)
- `is_ranked`: boolean

### **Interface unifiée :**
1. **SECTION 1** - Choix du mode (1v1 vs Groupe)
2. **SECTION 2** - Options selon mode
3. **SECTION 3** - Lobby unifié
4. **SECTION 4** - Supprimer l'ancien modèle dupliqué

---

**✅ CARTOGRAPHIE TERMINÉE - PRÊT POUR VALIDATION**
