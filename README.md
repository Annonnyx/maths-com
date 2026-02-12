# Math.com - L'entraînement au calcul mental

> Le chess.com des maths - Un système d'entraînement au calcul mental gamifié et adaptatif

## 🎯 Objectif

Math.com est une application moderne d'entraînement au calcul mental basée sur une progression ludique et motivante, inspirée des systèmes de ranking des jeux compétitifs comme Chess.com.

## ✨ Fonctionnalités

### 🎮 Système de Progression
- **Classes de F- à S+** : 21 rangs avec progression basée sur l'Elo
- **Système Elo** : Gains et pertes basés sur la performance
- **Bonus de série** : Récompenses pour les performances consécutives
- **Déblocage progressif** : Nouvelles opérations débloquées selon le niveau

### 🧮 Types d'Opérations
1. **Additions** (F-) - Débloquée par défaut
2. **Soustractions** (F+) - 500 Elo
3. **Multiplications** (E) - 600 Elo
4. **Divisions** (D-) - 750 Elo
5. **Puissances** (C-) - 900 Elo
6. **Racines carrées** (B-) - 1050 Elo
7. **Factorisation** (A-) - 1200 Elo

### 📊 Tests et Évaluation
- Tests de 20 questions chronométrés
- Test d'évaluation initial pour déterminer le niveau
- Correction détaillée avec explications
- Historique des performances

### 📚 Apprentissage
- 8 cours pédagogiques interactifs
- Méthodes de calcul mental expliquées
- Exercices libres sans impact sur l'Elo
- Feedback immédiat

## 🛠️ Stack Technique

- **Framework** : Next.js 16 avec App Router
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Animations** : Framer Motion
- **Database** : SQLite avec Prisma ORM
- **Icônes** : Lucide React

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm

### Étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la base de données
npx prisma migrate dev
npx prisma generate

# 3. Lancer le serveur
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du Projet

- `/src/app/` - Routes et pages
- `/src/components/` - Composants React
- `/src/lib/` - Utilitaires (Elo, exercices, Prisma)
- `/prisma/` - Schéma base de données

## 🎨 Design

Thème gaming néo-moderne avec :
- Background sombre `#0a0a0f`
- Gradients indigo/violet
- Couleurs par rang (F=gris → S=or)
- Animations fluides avec Framer Motion

## 📝 License

MIT License

---
**Math.com** - Deviens le maître du calcul mental ! 🧮✨
