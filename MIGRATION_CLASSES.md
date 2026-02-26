# Migration Supabase - Système de Classes Françaises

Ce document décrit les modifications nécessaires dans Supabase pour implémenter le nouveau système de classes françaises.

## ⚠️ IMPORTANT - Aucune migration de schéma requise

Le système de classes françaises est **entièrement basé sur les ELO existants**. Aucune modification de la base de données n'est nécessaire car :

- Les classes sont déduites de l'ELO actuel via `getClassFromElo()`
- Les classes débloquées sont déduites du `rankClass` via `getUnlockedClasses()`
- Pas besoin de nouvelle colonne `currentClass` dans la table User

## 📊 Nouveaux fichiers créés

### `/src/lib/french-classes.ts`
- Définit toutes les classes françaises (CP à Pro)
- Mapping ELO → Classe
- Mapping Rang → Classes débloquées
- Fonctions utilitaires pour la progression

### `/src/lib/class-generators.ts`
- Générateurs de questions spécifiques par classe
- Configuration des exercices adaptés à chaque niveau scolaire
- Fonctions pour générer des tests multijoueur basés sur les classes

## 🔄 API Admin ajoutées

### GET/POST `/api/admin`
- `action: 'generate-reset-code'` - Génère un code aléatoire pour reset ELO
- `action: 'reset-all-elo'` - Réinitialise l'ELO de tous les joueurs (avec code)
- `action: 'get-class-info'` - Récupère les infos de classe d'un utilisateur

## 🎯 Utilisation du système de classes

### Côté serveur (API)
```typescript
import { getClassFromElo, getUnlockedClasses, checkClassPromotion } from '@/lib/french-classes';

// Obtenir la classe d'un joueur
const userClass = getClassFromElo(user.elo);

// Obtenir les classes débloquées
const unlocked = getUnlockedClasses(user.rankClass);

// Vérifier si un joueur passe une classe
const promotion = checkClassPromotion(oldElo, newElo);
if (promotion) {
  // Envoyer message de félicitations
  console.log(promotion.message);
}
```

### Côté client (React)
```typescript
import { formatClassName, getClassProgress, CLASS_INFO } from '@/lib/french-classes';

// Afficher le nom formaté
const displayName = formatClassName('6e'); // "📚 6e"

// Barre de progression
const progress = getClassProgress(user.elo, currentClass);
```

## 🏆 Système de déblocage des classes par rang

| Rang | Classes débloquées |
|------|-------------------|
| F- à F+ | CP, CE1 |
| E- à E+ | CP, CE1, CE2 |
| D- à D+ | CP, CE1, CE2, CM1, CM2, 6e |
| C- à C+ | ... + 5e, 4e, 3e |
| B- à B+ | ... + 2de, 1re, Tle |
| A- à A+ | ... + Sup1, Sup2, Sup3 |
| S- à S+ | Toutes les classes + Pro |

## 📱 Interface utilisateur recommandée

### Sélecteur de classe pour l'entraînement
```tsx
<FrenchClassSelector 
  unlockedClasses={getUnlockedClasses(user.rankClass)}
  currentClass={getClassFromElo(user.elo)}
  onSelect={(className) => startTraining(className)}
/>
```

### Modal de passage de classe
```tsx
<ClassPromotionModal 
  oldClass={promotion.oldClass}
  newClass={promotion.newClass}
  message={promotion.message}
/>
```

## 🎮 Intégration dans les modes de jeu

### Mode Classé / Multijoueur
Les questions sont générées automatiquement selon l'ELO (comme avant), mais la difficulté est maintenant "traduite" en classe :
- ELO 400-549 → Questions CP
- ELO 550-649 → Questions CE1
- ELO 650-799 → Questions CE2
- etc.

### Mode Entraînement
Le joueur peut choisir n'importe quelle classe débloquée pour s'entraîner spécifiquement sur ce niveau.

## ⚙️ Configuration des exercices par classe

Voir `/src/lib/class-generators.ts` pour la configuration complète. Exemple pour CP :

```typescript
'CP': {
  operations: ['addition', 'subtraction', 'mental_math', 'logic'],
  minDifficulty: 1,
  maxDifficulty: 3,
  geometryEnabled: false,
  specialTypes: ['comptage', 'formes_simples']
}
```

## 🔧 Corrections de bugs incluses

### Bug "En ligne" corrigé
- Nouveau `usePresence.ts` avec détection d'inactivité
- Cleanup automatique des utilisateurs inactifs (>5 min)
- API de présence améliorée avec `sendBeacon`

### Bug bannières custom
- À corriger séparément si nécessaire

## 📝 TODO pour compléter l'intégration

1. **Interface de sélection de classe** dans `/practice/page.tsx`
2. **Modal de passage de classe** après chaque test compétitif
3. **Option pour désactiver la géométrie** dans les paramètres
4. **Visualisation géométrique** avec SVG/canvas pour les questions de géométrie
5. **Mise à jour du panel admin** avec le bouton de reset ELO

## 🚀 Déploiement

1. Déployer les nouveaux fichiers
2. Aucune migration de base de données nécessaire
3. Tester les endpoints admin
4. Vérifier la détection de présence
5. Mettre à jour l'interface utilisateur

---

**Note**: Le système est conçu pour être rétrocompatible. Les anciens utilisateurs verront automatiquement leur classe calculée à partir de leur ELO existant.
