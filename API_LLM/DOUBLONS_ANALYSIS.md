# ANALYSE DES DOUBLONS - APIS ET TABLES
*Date: 11/03/2026*

## 📊 STATISTIQUES D'UTILISATION

### Routes API les plus utilisées :
1. `/api/friends` - 6 utilisations
2. `/api/admin` - 6 utilisations  
3. `/api/notifications` - 5 utilisations
4. `/api/challenges` - 5 utilisations
5. `/api/multiplayer` - 3 utilisations

### Tables Prisma les plus utilisées :
1. `prisma.userBadge` - 16 utilisations
2. `prisma.user` - 10 utilisations
3. `prisma.message` - 9 utilisations
4. `prisma.friendship` - 9 utilisations
5. `prisma.badge` - 8 utilisations

---

## 🔄 DOUBLONS IDENTIFIÉS

### 1. PROFILS UTILISATEURS

**Doublon trouvé :**
- `/api/profile` (3 utilisations)
- `/api/users/[id]` (1 utilisation)
- `/api/users/username/[username]/public` (1 utilisation)

**Fonctionnalités similaires :**
- GET profil utilisateur
- PATCH mise à jour profil

**Analyse :**
- `/api/profile` : Plus complet, gère userId param, badges, statistiques
- `/api/users/[id]` : CRUD basique
- `/api/users/username/[username]/public` : Spécifique profil public

**Recommandation :** Standardiser sur `/api/profile`

**Actions :**
- [ ] Remplacer les appels à `/api/users/[id]` par `/api/profile?id=...`
- [ ] Conserver `/api/users/username/[username]/public` pour les profils publics
- [ ] Mettre à jour les 3 utilisations de `/api/profile` si nécessaire

### 2. STATISTIQUES

**Doublon trouvé :**
- `soloStatistics` (table) vs `stats/summary` (API)
- Précision calculée différemment selon les endpoints

**Problèmes identifiés :**
- Calcul précision à 0% dans leaderboard
- Différentes formules selon les endpoints

**Recommandation :** Standardiser le calcul de précision

### 3. MESSAGES & SOCIAL

**Doublons partiels :**
- `/api/messages` vs `/api/social` (non existant?)
- Fonctionnalités dispersées entre plusieurs endpoints

**Recommandation :** Consolidation nécessaire

### 4. MULTIJOUER

**Doublons trouvés :**
- `/api/multiplayer` vs `/api/game/*`
- Plusieurs endpoints pour créer/joindre des parties

**Recommandation :** Standardiser sur `/api/multiplayer/*`

---

## 🎯 PLAN D'ACTION PRIORITAIRE

### Phase 1: Profils Utilisateurs (IMMÉDIAT)
1. **Analyser** les différences entre `/api/profile` et `/api/users/[id]`
2. **Standardiser** sur l'API la plus complète
3. **Mettre à jour** tous les appels

### Phase 2: Statistiques (IMMÉDIAT)  
1. **Unifier** le calcul de précision
2. **Standardiser** la structure des réponses
3. **Tester** les corrections

### Phase 3: Multijoueur
1. **Consolider** les endpoints de jeu
2. **Simplifier** la logique de création/join

### Phase 4: Social & Messages
1. **Analyser** l'API `/api/social` (existe-t-elle?)
2. **Consolider** les fonctionnalités sociales

---

## 🔧 COMMANDES DE STANDARDISATION

### Pour les profils utilisateurs :
```bash
# Remplacer /api/users/[id] par /api/profile?id=[id]
find ./src -name "*.ts" -o -name "*.tsx" | xargs grep -l "/api/users/" | grep -v "username\|onboarding"

# Commandes de remplacement à exécuter après validation
```

### Pour les statistiques :
```bash
# Standardiser le calcul de précision
find ./src -name "*.ts" -o -name "*.tsx" | xargs grep -l "accuracy\|precision"
```

---

## 📋 VALIDATIONS REQUISES

Avant d'exécuter les remplacements :

1. **Valider** que `/api/profile` supporte tous les cas d'usage
2. **Tester** les changements sur les composants critiques
3. **Vérifier** la rétrocompatibilité

---

## ⚠️ RISQUES IDENTIFIÉS

1. **Breaking changes** possibles dans les composants
2. **Perte de fonctionnalités** si les APIs ne sont pas 100% équivalentes
3. **Impact sur le frontend** si les structures de réponse diffèrent

---

*En attente de validation pour exécuter les standardisations...*
