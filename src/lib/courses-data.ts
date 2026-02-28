// Cours détaillés par classe française
// Chaque classe a son propre programme adapté aux compétences et opérations disponibles

export interface CourseSection {
  title: string;
  content: string;
  examples: { problem: string; solution: string; explanation: string }[];
  tips: string[];
  isCollapsible?: boolean;
  tableData?: { table: number; values: number[]; tip: string }[];
}

export interface ClassCourse {
  id: string;
  className: string;
  title: string;
  description: string;
  duration: string;
  sections: CourseSection[];
  skills: string[]; // Compétences acquises
  prerequisites: string[]; // Prérequis
}

export const COURSES_BY_CLASS: Record<string, ClassCourse> = {
  'CP': {
    id: 'cp',
    className: 'CP',
    title: 'Débuter avec les nombres',
    description: 'Premiers pas avec l\'addition et la logique. Apprends à compter et à faire des additions simples.',
    duration: '15 min',
    skills: ['Additions simples', 'Compléments à 10', 'Logique de base'],
    prerequisites: [],
    sections: [
      {
        title: '🎯 Les compléments à 10',
        content: 'Les compléments à 10 sont les paires de nombres qui font 10 ensemble. C\'est la base de toute l\'arithmétique !',
        examples: [
          { problem: '1 + ? = 10', solution: '9', explanation: '1 et 9 sont complémentaires' },
          { problem: '2 + ? = 10', solution: '8', explanation: '2 et 8 sont complémentaires' },
          { problem: '3 + 7 = ?', solution: '10', explanation: '3 et 7 sont complémentaires' },
          { problem: '4 + 6 = ?', solution: '10', explanation: '4 et 6 sont complémentaires' },
          { problem: '5 + 5 = ?', solution: '10', explanation: '5 et 5 font 10' },
        ],
        tips: ['Mémorise ces 5 paires : 1-9, 2-8, 3-7, 4-6, 5-5', 'Quand tu vois ces nombres, pense à faire 10 !', 'Entraîne-toi tous les jours avec des flashcards']
      },
      {
        title: '➕ Additionner deux petits nombres',
        content: 'Pour additionner, on peut compter sur ses doigts ou utiliser les compléments à 10.',
        examples: [
          { problem: '3 + 4 = ?', solution: '7', explanation: '3 + 4 = 7 (compte : 4, 5, 6, 7)' },
          { problem: '2 + 5 = ?', solution: '7', explanation: '2 + 5 = 7' },
          { problem: '6 + 3 = ?', solution: '9', explanation: '6 + 3 = 9' },
          { problem: '4 + 4 = ?', solution: '8', explanation: '4 + 4 = 8 (double)' },
          { problem: '5 + 3 = ?', solution: '8', explanation: '5 + 3 = 8' },
        ],
        tips: ['Commence par le plus grand nombre et compte', 'Les doubles sont faciles : 1+1, 2+2, 3+3...', 'Utilise tes doigts si besoin']
      },
      {
        title: '🧩 Logique : les suites simples',
        content: 'Trouve la règle et continue la suite de nombres.',
        examples: [
          { problem: '2, 4, 6, 8, ?', solution: '10', explanation: 'On ajoute 2 à chaque fois' },
          { problem: '1, 3, 5, 7, ?', solution: '9', explanation: 'On ajoute 2 (nombres impairs)' },
          { problem: '5, 10, 15, 20, ?', solution: '25', explanation: 'On ajoute 5 (table de 5)' },
          { problem: '10, 9, 8, 7, ?', solution: '6', explanation: 'On enlève 1 (décompte)' },
        ],
        tips: ['Regarde la différence entre deux nombres voisins', 'Demande-toi : on ajoute ou on enlève ?', 'Vérifie avec le nombre suivant']
      }
    ]
  },

  'CE1': {
    id: 'ce1',
    className: 'CE1',
    title: 'Maîtrise l\'addition et la soustraction',
    description: 'Addition de nombres à 2 chiffres et premières soustractions. Techniques mentales de base.',
    duration: '20 min',
    skills: ['Additions à 2 chiffres', 'Soustractions simples', 'Tables de 2, 5, 10'],
    prerequisites: ['Compléments à 10', 'Additions simples'],
    sections: [
      {
        title: '🔢 Addition par décomposition',
        content: 'Décompose les nombres en dizaines et unités. Additionne les dizaines d\'abord, puis les unités.',
        examples: [
          { problem: '24 + 13 = ?', solution: '37', explanation: '20 + 10 = 30, 4 + 3 = 7, 30 + 7 = 37' },
          { problem: '35 + 22 = ?', solution: '57', explanation: '30 + 20 = 50, 5 + 2 = 7, 50 + 7 = 57' },
          { problem: '41 + 38 = ?', solution: '79', explanation: '40 + 30 = 70, 1 + 8 = 9, 70 + 9 = 79' },
          { problem: '56 + 27 = ?', solution: '83', explanation: '50 + 20 = 70, 6 + 7 = 13, 70 + 13 = 83' },
        ],
        tips: ['Sépare toujours dizaines et unités', 'Fais un trait sous les dizaines pour les repérer', 'Si les unités font plus de 10, retiens la retenue']
      },
      {
        title: '➖ Soustraction : emprunter ou compter',
        content: 'Deux méthodes : compter à rebours ou emprunter 1 dizaine.',
        examples: [
          { problem: '15 - 7 = ?', solution: '8', explanation: 'Compte à rebours : 15 → 14 → 13 → 12 → 11 → 10 → 9 → 8 (7 fois)' },
          { problem: '23 - 9 = ?', solution: '14', explanation: '23 - 10 = 13, mais on a enlevé 1 de trop, donc 13 + 1 = 14' },
          { problem: '34 - 15 = ?', solution: '19', explanation: '34 - 10 = 24, puis 24 - 5 = 19' },
          { problem: '42 - 18 = ?', solution: '24', explanation: '42 - 20 = 22, trop enlevé de 2, donc 22 + 2 = 24' },
        ],
        tips: ['Méthode du complément : combien faut-il ajouter ?', 'Arrondis puis corrige', 'Décompose : enlève les dizaines d\'abord']
      },
      {
        title: '✖️ Tables de multiplication : 2, 5 et 10',
        content: 'Apprends les tables les plus faciles : 2 (doubles), 5 (finissent par 0 ou 5), 10 (ajoute un 0).',
        examples: [
          { problem: '2 × 6 = ?', solution: '12', explanation: 'Le double de 6' },
          { problem: '5 × 4 = ?', solution: '20', explanation: '5 × 4 = 20 (finit par 0)' },
          { problem: '7 × 10 = ?', solution: '70', explanation: '7 avec un 0 à la fin' },
          { problem: '5 × 7 = ?', solution: '35', explanation: '5 × 7 = 35 (finil par 5)' },
        ],
        tips: ['Table de 2 = doubles', 'Table de 5 : alterne 0 et 5', 'Table de 10 : ajoute un zéro', 'Moitié de table de 10 = table de 5']
      }
    ]
  },

  'CE2': {
    id: 'ce2',
    className: 'CE2',
    title: 'Multiplication et Division',
    description: 'Maîtrise toutes les tables et apprends à diviser. Techniques de calcul mental rapide.',
    duration: '30 min',
    skills: ['Tables 2-10', 'Division par 1 chiffre', 'Multiplication à 2 chiffres'],
    prerequisites: ['Additions/Soustractions', 'Tables de 2,5,10'],
    sections: [
      {
        title: '📚 Toutes les tables de 2 à 10',
        content: 'Mémorise toutes les tables. Astuces spéciales pour chaque table.',
        examples: [
          { problem: 'Table de 9 : 9 × 7', solution: '63', explanation: '10×7 = 70, moins 7 = 63' },
          { problem: 'Table de 4 : 4 × 8', solution: '32', explanation: 'Double de 8 = 16, double encore = 32' },
          { problem: 'Table de 3 : 3 × 7', solution: '21', explanation: '2×7 = 14, + 7 = 21' },
          { problem: 'Table de 8 : 8 × 7', solution: '56', explanation: 'Double de 28 = 56, ou 10×7 - 2×7' },
        ],
        tips: ['Table de 9 : doigts des mains !', 'Table de 4 : double deux fois', 'Table de 8 : double trois fois', 'Table de 6 : paires (résultats pairs)'],
        isCollapsible: true,
        tableData: [
          { table: 2, values: [2,4,6,8,10,12,14,16,18,20], tip: 'Tous les nombres pairs' },
          { table: 3, values: [3,6,9,12,15,18,21,24,27,30], tip: 'Somme des chiffres = 3,6,9' },
          { table: 4, values: [4,8,12,16,20,24,28,32,36,40], tip: 'Double la table de 2' },
          { table: 5, values: [5,10,15,20,25,30,35,40,45,50], tip: 'Finissent par 0 ou 5' },
          { table: 6, values: [6,12,18,24,30,36,42,48,54,60], tip: 'Pairs et multiples de 3' },
          { table: 7, values: [7,14,21,28,35,42,49,56,63,70], tip: '7×8=56 (5-6-7-8 !)' },
          { table: 8, values: [8,16,24,32,40,48,56,64,72,80], tip: 'Double la table de 4' },
          { table: 9, values: [9,18,27,36,45,54,63,72,81,90], tip: 'Chiffres additionnent à 9' },
          { table: 10, values: [10,20,30,40,50,60,70,80,90,100], tip: 'Ajoute un 0' },
        ]
      },
      {
        title: '➗ Division par un chiffre',
        content: 'Diviser, c\'est trouver combien de fois le diviseur rentre dans le dividende.',
        examples: [
          { problem: '24 ÷ 4 = ?', solution: '6', explanation: '4 × 6 = 24, donc 24 ÷ 4 = 6' },
          { problem: '35 ÷ 5 = ?', solution: '7', explanation: '5 × 7 = 35, donc 35 ÷ 5 = 7' },
          { problem: '48 ÷ 6 = ?', solution: '8', explanation: '6 × 8 = 48' },
          { problem: '63 ÷ 7 = ?', solution: '9', explanation: '7 × 9 = 63' },
          { problem: '72 ÷ 8 = ?', solution: '9', explanation: '8 × 9 = 72' },
        ],
        tips: ['Division = multiplication inverse', 'Utilise tes tables !', 'Vérifie : quotient × diviseur = dividende', 'Reste doit être < diviseur']
      },
      {
        title: '✖️ Multiplier par 11 (1-9)',
        content: 'Super astuce : 11 × n = le chiffre répété deux fois !',
        examples: [
          { problem: '11 × 3 = ?', solution: '33', explanation: '3 répété deux fois' },
          { problem: '11 × 7 = ?', solution: '77', explanation: '7 répété deux fois' },
          { problem: '11 × 9 = ?', solution: '99', explanation: '9 répété deux fois' },
        ],
        tips: ['11 × n = nn pour n=1 à 9', 'La table de 11 est la plus facile !', '11×11 et plus sont différents']
      }
    ]
  },

  'CM1': {
    id: 'cm1',
    className: 'CM1',
    title: 'Pourcentages et grandes opérations',
    description: 'Maîtrise les pourcentages et les opérations sur de grands nombres.',
    duration: '25 min',
    skills: ['Pourcentages simples', 'Additions/soustractions complexes', 'Estimation'],
    prerequisites: ['Tables complètes', 'Division'],
    sections: [
      {
        title: '💯 Pourcentages faciles : 10%, 25%, 50%',
        content: 'Les pourcentages sont des fractions de 100. 50% = la moitié, 25% = le quart, 10% = un dixième.',
        examples: [
          { problem: '50% de 80 = ?', solution: '40', explanation: 'La moitié de 80' },
          { problem: '25% de 60 = ?', solution: '15', explanation: 'Le quart de 60 (60 ÷ 4)' },
          { problem: '10% de 45 = ?', solution: '4,5', explanation: 'Enlève un zéro ou décale la virgule' },
          { problem: '50% de 34 = ?', solution: '17', explanation: '34 ÷ 2 = 17' },
          { problem: '20% de 50 = ?', solution: '10', explanation: '2 × 10% de 50 = 2 × 5 = 10' },
        ],
        tips: ['50% = ÷ 2', '25% = ÷ 4', '10% = ÷ 10 (enlève un 0)', '5% = moitié de 10%', '20% = 2 × 10%']
      },
      {
        title: '🔢 Calcul mental rapide',
        content: 'Techniques pour calculer vite avec des grands nombres.',
        examples: [
          { problem: '48 + 37 = ?', solution: '85', explanation: '50 + 37 = 87, moins 2 = 85' },
          { problem: '156 - 48 = ?', solution: '108', explanation: '156 - 50 = 106, + 2 = 108' },
          { problem: '99 + 47 = ?', solution: '146', explanation: '100 + 47 = 147, - 1 = 146' },
          { problem: '73 - 19 = ?', solution: '54', explanation: '73 - 20 = 53, + 1 = 54' },
        ],
        tips: ['Arrondis puis corrige', '99 = 100 - 1', 'Transforme en calcul plus facile', 'Vérifie ton résultat']
      },
      {
        title: '🧮 Division avec reste',
        content: 'Quand ça ne divise pas exactement, il reste quelque chose.',
        examples: [
          { problem: '17 ÷ 5 = ?', solution: '3 reste 2', explanation: '5 × 3 = 15, 17 - 15 = 2' },
          { problem: '23 ÷ 4 = ?', solution: '5 reste 3', explanation: '4 × 5 = 20, 23 - 20 = 3' },
          { problem: '31 ÷ 6 = ?', solution: '5 reste 1', explanation: '6 × 5 = 30, reste 1' },
        ],
        tips: ['Reste < diviseur toujours !', 'Vérifie : (quotient × diviseur) + reste = dividende', 'Si reste = 0, division exacte']
      }
    ]
  },

  'CM2': {
    id: 'cm2',
    className: 'CM2',
    title: 'Fractions et Carrés parfaits',
    description: 'Introduction aux fractions et maîtrise des carrés parfaits. Calculs avec des nombres décimaux.',
    duration: '30 min',
    skills: ['Carrés 1-25', 'Fractions simples', 'Racines carrées estimation'],
    prerequisites: ['Pourcentages', 'Multiplication fluide'],
    sections: [
      {
        title: '🔲 Carrés parfaits 1-25',
        content: 'Un carré parfait est le résultat de n × n. Mémorise-les !',
        examples: [
          { problem: '12² = ?', solution: '144', explanation: '12 × 12 = 144' },
          { problem: '15² = ?', solution: '225', explanation: '15 × 15 = 225' },
          { problem: '20² = ?', solution: '400', explanation: '20 × 20 = 400' },
          { problem: '25² = ?', solution: '625', explanation: '25 × 25 = 625' },
          { problem: '13² = ?', solution: '169', explanation: '13 × 13 = 169' },
        ],
        tips: ['Nombres finissant par 5 : n5² = n×(n+1) puis 25', 'Ex: 25² = 2×3=6, puis 25 → 625', '15² = 1×2=2, puis 25 → 225', '11²=121, 12²=144, 13²=169...']
      },
      {
        title: '√ Estimation des racines carrées',
        content: 'Trouve entre quels nombres entiers se trouve la racine.',
        examples: [
          { problem: '√50 est entre ?', solution: '7 et 8', explanation: '7²=49, 8²=64, donc √50 ≈ 7,07' },
          { problem: '√20 est entre ?', solution: '4 et 5', explanation: '4²=16, 5²=25, √20 ≈ 4,47' },
          { problem: '√90 est entre ?', solution: '9 et 10', explanation: '9²=81, 10²=100, √90 ≈ 9,49' },
        ],
        tips: ['Trouve les carrés parfaits encadrants', 'La racine est entre les racines de ces carrés', 'Plus près duquel ? Estime la décimale']
      },
      {
        title: '🍕 Fractions : moitiés, tiers, quarts',
        content: 'Les fractions représentent des parts d\'un tout.',
        examples: [
          { problem: '1/2 + 1/4 = ?', solution: '3/4', explanation: '2/4 + 1/4 = 3/4' },
          { problem: '3/4 de 20 = ?', solution: '15', explanation: '20 ÷ 4 = 5, puis 5 × 3 = 15' },
          { problem: '2/5 de 25 = ?', solution: '10', explanation: '25 ÷ 5 = 5, puis 5 × 2 = 10' },
        ],
        tips: ['« De » veut dire × (multiplier)', '1/n de X = X ÷ n', 'a/b de X = (X ÷ b) × a', 'Simplifie si possible']
      }
    ]
  },

  '6e': {
    id: '6e',
    className: '6e',
    title: 'Puissances et Géométrie',
    description: 'Découvre les puissances de 2 et 10, et les premiers calculs géométriques.',
    duration: '35 min',
    skills: ['Puissances de 2 et 10', 'Périmètres', 'Aires simples'],
    prerequisites: ['Carrés parfaits', 'Fractions'],
    sections: [
      {
        title: '⚡ Puissances de 2',
        content: 'Les puissances de 2 sont fondamentales. Mémorise jusqu\'à 2^10 !',
        examples: [
          { problem: '2⁶ = ?', solution: '64', explanation: '2×2×2×2×2×2 = 64' },
          { problem: '2⁸ = ?', solution: '256', explanation: '2^10 = 1024, 2^8 = 1024÷4 = 256' },
          { problem: '2¹⁰ = ?', solution: '1024', explanation: 'Mémorise : 2^10 = 1024' },
          { problem: '2⁷ = ?', solution: '128', explanation: '2^8 ÷ 2 = 256 ÷ 2 = 128' },
        ],
        tips: ['2^10 = 1024 (mémorise !)', 'Pour n+1 : double', 'Pour n-1 : moitié', 'Utilisé en informatique (Ko = 1024 octets)']
      },
      {
        title: '💯 Puissances de 10',
        content: '10^n = 1 suivi de n zéros. La virgule bouge !',
        examples: [
          { problem: '10⁴ = ?', solution: '10000', explanation: '1 suivi de 4 zéros' },
          { problem: '10³ = ?', solution: '1000', explanation: 'Millier' },
          { problem: '10⁻² = ?', solution: '0,01', explanation: '1 centième' },
          { problem: '5 × 10² = ?', solution: '500', explanation: '5 avec 2 zéros' },
        ],
        tips: ['10^n : décale la virgule de n rangs vers la droite', '10^-n : décale vers la gauche', 'Utilisé pour les kilo, méga, milli...']
      },
      {
        title: '📐 Périmètres et Aires de base',
        content: 'Premiers calculs géométriques : périmètre et aire des formes simples.',
        examples: [
          { problem: 'Périmètre carré côté 5cm', solution: '20 cm', explanation: '4 × côté = 4 × 5 = 20' },
          { problem: 'Aire rectangle 6×4 cm', solution: '24 cm²', explanation: 'L × l = 6 × 4 = 24' },
          { problem: 'Périmètre cercle r=3 (π≈3)', solution: '~18 cm', explanation: '2×π×r ≈ 2×3×3 = 18' },
        ],
        tips: ['Périmètre = contour (addition)', 'Aire = surface (multiplication)', 'Carré : P=4c, A=c²', 'Rectangle : P=2(L+l), A=L×l']
      }
    ]
  },

  '5e': {
    id: '5e',
    className: '5e',
    title: 'Équations et Géométrie avancée',
    description: 'Premières équations et géométrie avec Pythagore. Techniques avancées.',
    duration: '40 min',
    skills: ['Équations simples', 'Théorème de Pythagore', 'Volumes', 'Factorisation basique'],
    prerequisites: ['Puissances', 'Géométrie de base'],
    sections: [
      {
        title: '🔢 Résoudre des équations simples',
        content: 'Trouver x dans des équations du type ax + b = c.',
        examples: [
          { problem: '2x + 5 = 13', solution: 'x = 4', explanation: '2x = 13-5 = 8, x = 8÷2 = 4' },
          { problem: '3x - 7 = 14', solution: 'x = 7', explanation: '3x = 14+7 = 21, x = 21÷3 = 7' },
          { problem: '5x + 3 = 28', solution: 'x = 5', explanation: '5x = 28-3 = 25, x = 25÷5 = 5' },
        ],
        tips: ['Isoler x d\'un côté', 'Inverse des opérations : + devient -, × devient ÷', 'Vérifie en remplaçant x dans l\'équation']
      },
      {
        title: '📐 Théorème de Pythagore',
        content: 'Dans un triangle rectangle : a² + b² = c² (c = hypoténuse)',
        examples: [
          { problem: 'Triangle 3 et 4, hypoténuse ?', solution: '5', explanation: '3²+4² = 9+16 = 25, √25 = 5' },
          { problem: 'Hypoténuse 13, côté 5, autre ?', solution: '12', explanation: '13²-5² = 169-25 = 144, √144 = 12' },
          { problem: 'Triangle 6 et 8, hypoténuse ?', solution: '10', explanation: '6²+8² = 36+64 = 100, √100 = 10' },
        ],
        tips: ['Hypoténuse = plus grand côté (en face de l\'angle droit)', 'Cherche les triplets pythagoriciens : 3-4-5, 5-12-13, 6-8-10...', 'a²+b²=c² toujours !']
      },
      {
        title: '📦 Volumes de base',
        content: 'Calculer le volume des pavés et cubes.',
        examples: [
          { problem: 'Volume cube 4cm', solution: '64 cm³', explanation: '4³ = 4×4×4 = 64' },
          { problem: 'Volume pavé 3×4×5 cm', solution: '60 cm³', explanation: 'L×l×h = 3×4×5 = 60' },
          { problem: 'Volume cube 10cm', solution: '1000 cm³', explanation: '10³ = 1000 (1 litre !)' },
        ],
        tips: ['Volume = L × l × h', 'Cube : V = côté³', 'Unité : cm³ (centimètres cubes)', '1 L = 1000 cm³ = 1 dm³']
      }
    ]
  },

  '4e': {
    id: '4e',
    className: '4e',
    title: 'Calcul mental avancé et Proportionnalité',
    description: 'Techniques de pro pour calculer ultra-rapide. Identités et factorisation.',
    duration: '45 min',
    skills: ['Méthode différence', 'Identités remarquables', 'Racines carrées', 'Puissances avancées'],
    prerequisites: ['Équations', 'Pythagore', 'Volumes'],
    sections: [
      {
        title: '⚡ Technique de la différence',
        content: 'Multiplier deux nombres proches d\'une base : (base+a)(base+b) = base² + base(a+b) + ab',
        examples: [
          { problem: '43 × 37 (base 40)', solution: '1591', explanation: '40² + 40(3-3) + (3×-3) = 1600 - 9 = 1591' },
          { problem: '52 × 48 (base 50)', solution: '2496', explanation: '50² - 2² = 2500 - 4 = 2496' },
          { problem: '102 × 98 (base 100)', solution: '9996', explanation: '100² - 2² = 10000 - 4 = 9996' },
        ],
        tips: ['Choisis une base ronde entre les deux nombres', 'Calcule les différences à la base', 'Formule : a² - b² quand différences opposées', 'Très rapide pour nombres proches !']
      },
      {
        title: '📐 Identités remarquables',
        content: '(a+b)² = a² + 2ab + b² | (a-b)² = a² - 2ab + b² | (a+b)(a-b) = a²-b²',
        examples: [
          { problem: '31² = ?', solution: '961', explanation: '(30+1)² = 900 + 60 + 1 = 961' },
          { problem: '29² = ?', solution: '841', explanation: '(30-1)² = 900 - 60 + 1 = 841' },
          { problem: '53 × 47 = ?', solution: '2491', explanation: '(50+3)(50-3) = 50² - 3² = 2500 - 9 = 2491' },
        ],
        tips: ['(a+b)² : carré + double produit + carré', '(a-b)² : carré - double produit + carré', '(a+b)(a-b) = a²-b² (différence de carrés)', 'Approche les dizaines/rondes !']
      },
      {
        title: '✖️ Multiplication rapide par 11',
        content: 'Pour 2 chiffres : sépare, additionne, combine. Avec retenue si >9',
        examples: [
          { problem: '23 × 11', solution: '253', explanation: '2_(2+3)_3 = 2_5_3 = 253' },
          { problem: '45 × 11', solution: '495', explanation: '4_(4+5)_5 = 4_9_5 = 495' },
          { problem: '78 × 11', solution: '858', explanation: '7_(15)_8 → 7+1_5_8 = 858' },
        ],
        tips: ['Sépare les deux chiffres', 'Additionne-les pour le milieu', 'Si milieu > 9 : garde unité, retenue à gauche', 'Marche pour tous les nombres à 2 chiffres !']
      }
    ]
  },

  '3e': {
    id: '3e',
    className: '3e',
    title: 'Racines carrées et Puissances avancées',
    description: 'Maîtrise complète des racines carrées et propriétés des puissances.',
    duration: '40 min',
    skills: ['Racines carrées exactes', 'Propriétés des exposants', 'Calcul scientifique'],
    prerequisites: ['Identités remarquables', 'Puissances de base'],
    sections: [
      {
        title: '√ Racines carrées : extraction',
        content: 'Simplifier √a en extrayant les carrés parfaits.',
        examples: [
          { problem: '√50 = ?', solution: '5√2', explanation: '√50 = √(25×2) = 5√2' },
          { problem: '√72 = ?', solution: '6√2', explanation: '√72 = √(36×2) = 6√2' },
          { problem: '√98 = ?', solution: '7√2', explanation: '√98 = √(49×2) = 7√2' },
          { problem: '√12 = ?', solution: '2√3', explanation: '√12 = √(4×3) = 2√3' },
        ],
        tips: ['Décompose en facteurs', 'Extrais les carrés parfaits (4, 9, 16, 25, 36, 49...)', 'Ce qui reste sous la racine est premier', '√(a×b) = √a × √b']
      },
      {
        title: '⚡ Propriétés des puissances',
        content: 'a^m × a^n = a^(m+n) | (a^m)^n = a^(m×n) | a^(-n) = 1/a^n',
        examples: [
          { problem: '2³ × 2⁵ = ?', solution: '2⁸ = 256', explanation: '3+5 = 8' },
          { problem: '(3²)³ = ?', solution: '3⁶ = 729', explanation: '2×3 = 6' },
          { problem: '5⁻² = ?', solution: '1/25 = 0,04', explanation: '1 ÷ 5² = 1/25' },
          { problem: '10³ × 10⁻² = ?', solution: '10¹ = 10', explanation: '3 + (-2) = 1' },
        ],
        tips: ['Multiplication : ajoute les exposants', 'Puissance de puissance : multiplie', 'Négatif = inverse', 'Division : soustrait les exposants']
      },
      {
        title: '📊 Notation scientifique',
        content: 'Écrire les grands/petits nombres : a × 10^n avec 1 ≤ a < 10',
        examples: [
          { problem: '5000 en scientifique', solution: '5 × 10³', explanation: '5 × 1000' },
          { problem: '0,007 en scientifique', solution: '7 × 10⁻³', explanation: '7 × 0,001' },
          { problem: '6 × 10⁴ = ?', solution: '60000', explanation: '6 suivi de 4 zéros' },
        ],
        tips: ['a doit être entre 1 et 10', 'Décale la virgule pour obtenir a', 'Compte les décalages pour trouver n', 'Utilisé en physique/chimie']
      }
    ]
  },

  '2de': {
    id: '2de',
    className: '2de',
    title: 'Calcul mental de niveau Lycée',
    description: 'Techniques avancées pour le calcul mental rapide et précis.',
    duration: '50 min',
    skills: ['Approximation linéaire', 'Techniques mémotechniques', 'Logique avancée'],
    prerequisites: ['Racines carrées', 'Puissances avancées'],
    sections: [
      {
        title: '🧠 Carrés rapides (méthode générale)',
        content: 'Pour n² : (n+a)(n-a) + a² = n² - a² + a² = n². Choisis a pour faire un calcul facile.',
        examples: [
          { problem: '47²', solution: '2209', explanation: '(50-3)² = 2500 - 300 + 9 = 2209' },
          { problem: '53²', solution: '2809', explanation: '(50+3)² = 2500 + 300 + 9 = 2809' },
          { problem: '98²', solution: '9604', explanation: '(100-2)² = 10000 - 400 + 4 = 9604' },
        ],
        tips: ['Approche un nombre rond (50, 100...)', 'Utilise (a±b)² = a² ± 2ab + b²', 'Plus b est petit, plus c\'est facile', 'Mémorise les carrés de 1 à 50 !']
      },
      {
        title: '📐 Approximation de racines',
        content: '√x ≈ √a + (x-a)/(2√a) où a est le carré parfait le plus proche.',
        examples: [
          { problem: '√27 (approx)', solution: '~5,2', explanation: '√25 = 5, (27-25)/(2×5) = 2/10 = 0,2' },
          { problem: '√50 (approx)', solution: '~7,07', explanation: '√49 = 7, (50-49)/(2×7) = 1/14 ≈ 0,07' },
          { problem: '√104 (approx)', solution: '~10,2', explanation: '√100 = 10, (104-100)/20 = 0,2' },
        ],
        tips: ['Prends le carré parfait le plus proche', 'Formule : √a + Δ/(2√a)', 'Plus x est proche du carré parfait, plus c\'est précis', 'Vérifie avec (√x)² ≈ x']
      },
      {
        title: '🔢 Division rapide par des décimaux',
        content: 'Diviser par 0,5, 0,25, 0,1... c\'est multiplier !',
        examples: [
          { problem: '24 ÷ 0,5 = ?', solution: '48', explanation: '÷0,5 = ×2' },
          { problem: '16 ÷ 0,25 = ?', solution: '64', explanation: '÷0,25 = ×4' },
          { problem: '50 ÷ 0,1 = ?', solution: '500', explanation: '÷0,1 = ×10' },
          { problem: '12 ÷ 0,125 = ?', solution: '96', explanation: '÷0,125 = ×8' },
        ],
        tips: ['0,5 = 1/2, donc ×2', '0,25 = 1/4, donc ×4', '0,125 = 1/8, donc ×8', '0,1 = 1/10, donc ×10']
      }
    ]
  },

  '1re': {
    id: '1re',
    className: '1re',
    title: 'Maths expertes : Fonctions et Suites',
    description: 'Calcul mental pour les fonctions et les suites. Progressions et tendances.',
    duration: '55 min',
    skills: ['Calculs de suites', 'Estimation de fonctions', 'Probabilités mentales'],
    prerequisites: ['Calcul mental avancé', 'Logique'],
    sections: [
      {
        title: '📈 Suites arithmétiques et géométriques',
        content: 'u_n = u_0 + n×r (arithmétique) | u_n = u_0 × q^n (géométrique)',
        examples: [
          { problem: 'Suite : 5, 8, 11... u_10 ?', solution: '35', explanation: 'u_0=5, r=3, u_10 = 5 + 10×3 = 35' },
          { problem: 'Suite : 2, 6, 18... u_5 ?', solution: '486', explanation: 'u_0=2, q=3, u_5 = 2×3⁵ = 2×243 = 486' },
          { problem: 'Somme 1+2+...+20', solution: '210', explanation: '20×21/2 = 210' },
        ],
        tips: ['Arithmétique : additionne la raison', 'Géométrique : multiplie par la raison', 'Somme 1 à n = n(n+1)/2', 'Vérifie avec les premiers termes']
      },
      {
        title: '🎲 Probabilités simples',
        content: 'Calculer des probabilités et des espérances mentalement.',
        examples: [
          { problem: 'Proba pair sur dé', solution: '1/2', explanation: '3 pairs sur 6 : 3/6 = 1/2' },
          { problem: 'Espérance dé', solution: '3,5', explanation: '(1+2+3+4+5+6)/6 = 21/6 = 3,5' },
          { problem: 'Proba 2 rois (52 cartes)', solution: '1/221', explanation: '4/52 × 3/51 = 12/2652 = 1/221' },
        ],
        tips: ['Proba = cas favorables / cas possibles', 'Espérance = somme (valeur × proba)', 'Sans remise : décrémente le dénominateur', 'Multiplie les probas pour ET, additionne pour OU incompatible']
      },
      {
        title: '📊 Pourcentages composés',
        content: 'Augmentations et réductions successives.',
        examples: [
          { problem: '+20% puis -20%', solution: '-4%', explanation: '1,2 × 0,8 = 0,96 = -4%' },
          { problem: 'Doublement en combien d\'années à 10% ?', solution: '~7 ans', explanation: 'Règle de 70 : 70/10 = 7' },
          { problem: '100 → +10% → +10% → ?', solution: '121', explanation: '100 × 1,1 × 1,1 = 121' },
        ],
        tips: ['CM global = produit des CM', '+10% = ×1,1, -10% = ×0,9', 'Règle de 70 : temps de doublement ≈ 70/taux%', 'Les % ne s\'additionnent pas !']
      }
    ]
  },

  'Tle': {
    id: 'tle',
    className: 'Tle',
    title: 'Maths Terminale : Limites et Dérivées',
    description: 'Calcul mental pour l\'analyse de terminale. Estimations de limites et dérivées.',
    duration: '60 min',
    skills: ['Estimation de limites', 'Dérivées mentales', 'Intégrales approximatives'],
    prerequisites: ['Fonctions', 'Suites'],
    sections: [
      {
        title: '📉 Estimation de limites',
        content: 'Trouver la valeur approchée d\'une fonction en un point.',
        examples: [
          { problem: 'lim (x²-1)/(x-1) en x=1', solution: '2', explanation: 'Factorise : (x+1)(x-1)/(x-1) = x+1 → 2' },
          { problem: '(2,001)³ ≈ ?', solution: '8,012', explanation: '8 + 3×4×0,001 = 8,012 (dérivée)' },
          { problem: '√9,01 ≈ ?', solution: '3,0017', explanation: '3 + 0,01/(2×3) = 3,0017' },
        ],
        tips: ['Factorise pour lever l\'indétermination', 'Utilise f(a+h) ≈ f(a) + h×f\'(a)', 'Dérivée = taux de variation instantané', 'Vérifie avec la calculatrice']
      },
      {
        title: '📈 Dérivées essentielles',
        content: '(x^n)\' = n×x^(n-1) | (e^x)\' = e^x | (ln x)\' = 1/x',
        examples: [
          { problem: 'Dérivée de x⁴', solution: '4x³', explanation: '4×x^(4-1) = 4x³' },
          { problem: 'Dérivée de 3x² + 2x', solution: '6x + 2', explanation: '6x + 2' },
          { problem: 'Tangente à x² en x=2', solution: 'y = 4x - 4', explanation: 'f(2)=4, f\'(2)=4, y = 4 + 4(x-2)' },
        ],
        tips: ['(x^n)\' = n×x^(n-1)', 'Dérivée d\'une constante = 0', '(uv)\' = u\'v + uv\'', 'Tangente : y = f(a) + f\'(a)(x-a)']
      },
      {
        title: '∫ Intégrales approximatives',
        content: 'Estimer des aires et des intégrales.',
        examples: [
          { problem: 'Aire sous x² de 0 à 2', solution: '8/3 ≈ 2,67', explanation: '[x³/3]_0^2 = 8/3' },
          { problem: '∫₁³ (2x) dx', solution: '8', explanation: '[x²]_1^3 = 9-1 = 8' },
          { problem: 'Aire cercle rayon 2', solution: '4π', explanation: 'π×r² = π×4 = 4π' },
        ],
        tips: ['∫x^n = x^(n+1)/(n+1)', 'Aire cercle = πr²', 'Intégrale = primitive(b) - primitive(a)', 'Méthode des rectangles pour approximation']
      }
    ]
  },

  'Pro': {
    id: 'pro',
    className: 'Pro',
    title: 'Expert : Algorithmes et Optimisation',
    description: 'Niveau professionnel et compétitions. Algorithmes de calcul et optimisations.',
    duration: 'Illimité',
    skills: ['Algorithmes', 'Optimisation', 'Mémoire de travail', 'Vitesse maximale'],
    prerequisites: ['Toutes les classes précédentes'],
    sections: [
      {
        title: '⚡ Techniques de compétition',
        content: 'Méthodes utilisées aux championnats de calcul mental.',
        examples: [
          { problem: '73 × 77 (même dizaine)', solution: '5621', explanation: '(70+3)(70+7) = 70² + 70×10 + 21 = 4900 + 700 + 21' },
          { problem: '104²', solution: '10816', explanation: '(100+4)² = 10000 + 800 + 16' },
          { problem: '√2 à 5 décimales', solution: '1,41421', explanation: 'Mémorisation directe' },
        ],
        tips: ['Mémorise les constantes : π, e, √2...', 'Apprends les tables jusqu\'à 30', 'Utilise la méthode des cases (Vedic)', 'Méditation et concentration']
      },
      {
        title: '🧠 Mémoire de travail',
        content: 'Techniques pour retenir plus de nombres en tête.',
        examples: [
          { problem: 'Mémoriser 25 nombres', solution: 'Technique des palais', explanation: 'Associe à des lieux familiers' },
          { problem: 'Calcul intermédiaire', solution: 'Chunking', explanation: 'Groupe par 2-3 chiffres' },
          { problem: 'Mémoriser π', solution: '3,141592653...', explanation: 'Chanson ou histoire mnémotechnique' },
        ],
        tips: ['Méthode du palais de la mémoire', 'Chunking : groupe les chiffres', 'Associe des images', 'Répète immédiatement']
      },
      {
        title: '🎯 Entraînement systématique',
        content: 'Programme d\'entraînement pour atteindre la vitesse maximale.',
        examples: [
          { problem: '100 additions/minute', solution: 'Entraînement quotidien', explanation: 'Flash Anzan (soroban mental)' },
          { problem: 'Multiplications 2×2 chiffres', solution: '< 3 secondes', explanation: 'Répétition massive' },
          { problem: 'Racines carrées', solution: 'Parfaites instantanées', explanation: 'Mémorisation 1-100' },
        ],
        tips: ['Entraîne-toi 30 min/jour minimum', 'Utilise des métronomes pour la vitesse', 'Flash Anzan (soroban)', 'Compétitions en ligne (maths-app.com !)']
      }
    ]
  }
};
