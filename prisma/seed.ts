import { prisma } from '@/lib/prisma';

const coursesData = [
  {
    title: 'Addition rapide',
    slug: 'addition-rapide',
    description: 'Maîtrise les techniques d\'addition mentale pour calculer plus vite',
    content: `
# Addition rapide

## Introduction
L'addition mentale est la base du calcul mental. Maîtriser ces techniques te permettra de gagner un temps précieux.

## Techniques fondamentales

### 1. Compléments à 10
Apprends à reconnaître les paires qui font 10 :
- 1 + 9 = 10
- 2 + 8 = 10
- 3 + 7 = 10
- 4 + 6 = 10
- 5 + 5 = 10

### 2. Méthode de décomposition
Décompose les nombres pour simplifier le calcul :
- 47 + 25 = 47 + 20 + 5 = 67 + 5 = 72
- 38 + 46 = 38 + 40 + 6 = 78 + 6 = 84

### 3. Addition de gauche à droite
Commence par les chiffres de poids fort :
- 45 + 32 : 40 + 30 = 70, puis 5 + 2 = 7, total = 77

## Exercices pratiques
- 23 + 45 = ?
- 67 + 28 = ?
- 156 + 89 = ?
    `,
    difficulty: 1,
    order: 1,
    relatedTypes: JSON.stringify(['addition'])
  },
  {
    title: 'Soustraction efficace',
    slug: 'soustraction-efficace',
    description: 'Apprends à soustraire rapidement sans calculatrice',
    content: `
# Soustraction efficace

## Introduction
La soustraction peut être transformée en addition pour plus de rapidité.

## Techniques fondamentales

### 1. Méthode du complément
Transforme la soustraction en recherche de complément :
- 100 - 37 = ? → Quel nombre ajouté à 37 donne 100 ?
- 63 - 29 = ? → 29 + ? = 63

### 2. Soustraction par étapes
Décompose la soustraction :
- 85 - 37 = 85 - 30 - 7 = 55 - 7 = 48

### 3. Arrondis astucieux
Arrondis puis ajuste :
- 73 - 49 = 73 - 50 + 1 = 24
- 156 - 98 = 156 - 100 + 2 = 58

## Exercices pratiques
- 95 - 47 = ?
- 143 - 89 = ?
- 200 - 76 = ?
    `,
    difficulty: 2,
    order: 2,
    relatedTypes: JSON.stringify(['subtraction'])
  },
  {
    title: 'Tables de multiplication',
    slug: 'tables-multiplication',
    description: 'Mémorise et maîtrise les tables de multiplication',
    content: `
# Tables de multiplication

## Introduction
Les tables de multiplication sont essentielles pour tous les calculs avancés.

## Tables de base (2-9)
Maîtrise parfaitement les tables de 2 à 9 avant de passer aux suivantes.

## Tables avancées

### Table de 11
Pour les nombres à 2 chiffres : sépare et additionne
- 11 × 34 : 3 _ (3+4) _ 4 = 374
- 11 × 52 : 5 _ (5+2) _ 2 = 572

### Table de 12
- 12 × n = 10 × n + 2 × n
- 12 × 7 = 70 + 14 = 84

### Carrés parfaits (1-20)
1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400

## Astuces
- Multiplication par 5 : diviser par 2 puis multiplier par 10
- Multiplication par 9 : multiplier par 10 puis soustraire le nombre

## Exercices pratiques
- 8 × 7 = ?
- 12 × 9 = ?
- 15 × 15 = ?
    `,
    difficulty: 3,
    order: 3,
    relatedTypes: JSON.stringify(['multiplication'])
  },
  {
    title: 'Division mentale',
    slug: 'division-mentale',
    description: 'Techniques pour diviser rapidement sans papier',
    content: `
# Division mentale

## Introduction
La division mentale repose sur la connaissance des tables et des astuces de simplification.

## Techniques fondamentales

### 1. Division par un chiffre
Utilise la table de multiplication à l'envers :
- 56 ÷ 8 = 7 car 7 × 8 = 56
- 72 ÷ 9 = 8 car 8 × 9 = 72

### 2. Division par 5
Multiplie par 2 puis divise par 10 :
- 85 ÷ 5 = 85 × 2 ÷ 10 = 170 ÷ 10 = 17

### 3. Division par 25
Multiplie par 4 puis divise par 100 :
- 125 ÷ 25 = 125 × 4 ÷ 100 = 500 ÷ 100 = 5

### 4. Estimation
Arrondis pour vérifier ton calcul :
- 147 ÷ 7 ≈ 140 ÷ 7 = 20, donc réponse proche de 20 (21 exact)

## Exercices pratiques
- 96 ÷ 8 = ?
- 135 ÷ 5 = ?
- 208 ÷ 4 = ?
    `,
    difficulty: 4,
    order: 4,
    relatedTypes: JSON.stringify(['division'])
  }
];

async function main() {
  console.log('Start seeding...');

  for (const courseData of coursesData) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: courseData,
      create: courseData
    });
    console.log(`Created/Updated course: ${course.title}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
