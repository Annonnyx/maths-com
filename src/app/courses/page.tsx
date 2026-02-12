'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Trophy, BookOpen, ArrowLeft, Clock, Target, 
  ChevronRight, Calculator, Lightbulb, CheckCircle
} from 'lucide-react';

const COURSE_CONTENT: Record<string, {
  sections: {
    title: string;
    content: string;
    examples: { problem: string; solution: string; explanation: string }[];
    tips: string[];
  }[];
}> = {
  'addition-rapide': {
    sections: [
      {
        title: 'La technique des compléments à 10',
        content: 'L\'addition devient facile quand on sait repérer les compléments à 10. 1+9=10, 2+8=10, 3+7=10, 4+6=10, 5+5=10. Quand vous voyez ces paires dans un calcul, additionnez-les d\'abord.',
        examples: [
          { problem: '7 + 8 + 3 + 2', solution: '20', explanation: '7+3=10 et 8+2=10, donc 10+10=20' },
          { problem: '9 + 5 + 1 + 5', solution: '20', explanation: '9+1=10 et 5+5=10, donc 10+10=20' },
          { problem: '6 + 7 + 4', solution: '17', explanation: '6+4=10, puis 10+7=17' },
        ],
        tips: ['Cherchez toujours les paires qui font 10', 'Commencez par les nombres les plus faciles à additionner', 'Entraînez-vous à repérer les compléments instantanément'] 
      },
      {
        title: 'Addition par décomposition',
        content: 'Décomposez les nombres en dizaines et unités. Additionnez séparément les dizaines, puis les unités, puis combinez. C\'est plus facile que d\'additionner tout d\'un coup.',
        examples: [
          { problem: '47 + 36', solution: '83', explanation: '40+30=70, 7+6=13, puis 70+13=83' },
          { problem: '58 + 25', solution: '83', explanation: '50+20=70, 8+5=13, puis 70+13=83' },
          { problem: '123 + 45', solution: '168', explanation: '120+40=160, 3+5=8, puis 160+8=168' },
        ],
        tips: ['Décomposez en centaines, dizaines, unités', 'Additionnez les grandes parties d\'abord', 'Ajoutez les restes à la fin']
      },
      {
        title: 'La méthode "aller-retour"',
        content: 'Pour additionner un nombre difficile, empruntez ce qu\'il faut pour arriver à la dizaine suivante, puis ajoutez le reste.',
        examples: [
          { problem: '28 + 7', solution: '35', explanation: '28+2=30 (emprunt à 7), reste 5 à ajouter, 30+5=35' },
          { problem: '46 + 8', solution: '54', explanation: '46+4=50, reste 4, 50+4=54' },
          { problem: '95 + 17', solution: '112', explanation: '95+5=100, reste 12, 100+12=112' },
        ],
        tips: ['Arrondissez d\'abord à la dizaine suivante', 'Retenez ce qu\'il reste à ajouter', 'Cette méthode fonctionne très bien pour les grands nombres']
      },
    ]
  },
  'soustraction-efficace': {
    sections: [
      {
        title: 'Soustraction par complément à 10',
        content: 'Au lieu de soustraire directement, demandez-vous : "combien faut-il ajouter pour arriver à la dizaine suivante ?"',
        examples: [
          { problem: '15 - 8', solution: '7', explanation: '8 + 2 = 10, puis 10 + 5 = 15, donc 2+5=7' },
          { problem: '23 - 7', solution: '16', explanation: '7 + 3 = 10, puis 10 + 13 = 23, donc 3+13=16' },
          { problem: '42 - 9', solution: '33', explanation: '9 + 1 = 10, puis 10 + 32 = 42, donc 1+32=33' },
        ],
        tips: ['Pensez en termes d\'addition inversée', 'Trouvez le complément à la dizaine', 'Additionnez les deux parties du complément']
      },
      {
        title: 'Technique de l\'emprunt mental',
        content: 'Pour les soustractions avec retenue, empruntez 1 à la dizaine supérieure pour faire un nombre rond.',
        examples: [
          { problem: '52 - 18', solution: '34', explanation: '52-20=32, mais on a trop enlevé de 2, donc 32+2=34' },
          { problem: '73 - 29', solution: '44', explanation: '73-30=43, on a trop enlevé de 1, donc 43+1=44' },
          { problem: '100 - 27', solution: '73', explanation: '100-30=70, trop enlevé de 3, donc 70+3=73' },
        ],
        tips: ['Arrondissez le nombre à soustraire', 'Soustrayez le nombre arrondi', 'Corrigez l\'erreur d\'arrondi']
      },
      {
        title: 'Vérification par addition',
        content: 'Pour vérifier une soustraction, additionnez le résultat au nombre soustrait. Vous devez retrouver le nombre initial.',
        examples: [
          { problem: '56 - 23 = 33 ?', solution: 'Oui', explanation: '33 + 23 = 56 ✓' },
          { problem: '81 - 37 = 44 ?', solution: 'Oui', explanation: '44 + 37 = 81 ✓' },
          { problem: '95 - 48 = 47 ?', solution: 'Non', explanation: '47 + 48 = 95 ✓ Donc c\'est correct!' },
        ],
        tips: ['Toujours vérifier vos calculs', 'L\'addition inverse doit donner le nombre de départ', 'Une erreur de 1 est souvent une distraction']
      },
    ]
  },
  'tables-multiplication': {
    sections: [
      {
        title: 'Astuce des tables de 9',
        content: 'Pour la table de 9 : les doigts de vos mains ! Écartez le doigt correspondant au multiplicateur. Les doigts à gauche = dizaines, à droite = unités.',
        examples: [
          { problem: '9 × 3', solution: '27', explanation: 'Écartez le 3ème doigt : 2 doigts à gauche (20), 7 à droite (7) = 27' },
          { problem: '9 × 7', solution: '63', explanation: 'Écartez le 7ème doigt : 6 doigts à gauche (60), 3 à droite (3) = 63' },
          { problem: '9 × 9', solution: '81', explanation: 'Écartez le 9ème doigt : 8 à gauche (80), 1 à droite (1) = 81' },
        ],
        tips: ['Méthode des doigts pour 9×1 à 9×10', 'Les chiffres des résultats additionnent toujours à 9', '9×n = 10×n - n']
      },
      {
        title: 'Tables de 11 (1-9)',
        content: 'Pour multiplier un chiffre par 11 : répétez le chiffre ! 3×11=33, 4×11=44, etc. C\'est la table la plus simple.',
        examples: [
          { problem: '5 × 11', solution: '55', explanation: '5 répété deux fois = 55' },
          { problem: '7 × 11', solution: '77', explanation: '7 répété deux fois = 77' },
          { problem: '9 × 11', solution: '99', explanation: '9 répété deux fois = 99' },
        ],
        tips: ['11×n = nn pour n de 1 à 9', 'La table de 11 est juste des doubles chiffres', 'Mémorisez-les comme des paires symétriques']
      },
      {
        title: 'Double et moitié',
        content: 'Quand un nombre est difficile, doublez l\'autre et prenez la moitié. Cela simplifie souvent le calcul.',
        examples: [
          { problem: '4 × 18', solution: '72', explanation: 'Double 4 = 8, moitié de 18 = 9, alors 8×9=72' },
          { problem: '8 × 25', solution: '200', explanation: 'Moitié de 8 = 4, double 25 = 50, alors 4×50=200' },
          { problem: '12 × 15', solution: '180', explanation: 'Moitié de 12 = 6, double 15 = 30, alors 6×30=180' },
        ],
        tips: ['Faites des nombres pairs quand possible', 'Les multiples de 10 sont plus faciles', 'Compensez toujours double/moitié']
      },
    ]
  },
  'division-mentale': {
    sections: [
      {
        title: 'Division par décomposition',
        content: 'Décomposez le dividende en parties facilement divisibles par le diviseur. Divisez chaque partie séparément.',
        examples: [
          { problem: '84 ÷ 4', solution: '21', explanation: '80÷4=20, 4÷4=1, donc 20+1=21' },
          { problem: '96 ÷ 3', solution: '32', explanation: '90÷3=30, 6÷3=2, donc 30+2=32' },
          { problem: '156 ÷ 6', solution: '26', explanation: '120÷6=20, 36÷6=6, donc 20+6=26' },
        ],
        tips: ['Cherchez des multiples du diviseur', 'Décomposez en parties faciles', 'Additionnez les quotients partiels']
      },
      {
        title: 'Estimation du quotient',
        content: 'Pour diviser rapidement, estimez d\'abord en arrondissant. Puis affinez votre réponse.',
        examples: [
          { problem: '147 ÷ 7', solution: '21', explanation: '140÷7=20 exact, reste 7, 7÷7=1, donc 20+1=21' },
          { problem: '238 ÷ 6', solution: '39 (reste 4)', explanation: '240÷6=40, donc c\'est un peu moins, 240-6=234, donc 39 reste 4' },
          { problem: '315 ÷ 5', solution: '63', explanation: '300÷5=60, 15÷5=3, donc 60+3=63' },
        ],
        tips: ['Arrondissez à un multiple proche', 'Commencez par une estimation', 'Ajustez avec le reste']
      },
      {
        title: 'Vérification par multiplication',
        content: 'Quotient × Diviseur + Reste = Dividende. C\'est la règle fondamentale pour vérifier vos divisions.',
        examples: [
          { problem: '19 × 5 + 3 = 98 ?', solution: 'Oui', explanation: 'Quotient 19, diviseur 5, reste 3 → 19×5+3=95+3=98 ✓' },
          { problem: '27 × 4 + 2 = 110 ?', solution: 'Oui', explanation: '27×4=108, +2=110 ✓' },
          { problem: '33 × 3 + 1 = 100 ?', solution: 'Oui', explanation: '33×3=99, +1=100 ✓' },
        ],
        tips: ['Toujours vérifier : quotient × diviseur + reste', 'Le reste doit être plus petit que le diviseur', 'Si le reste = diviseur, vous pouvez encore diviser']
      },
    ]
  },
  'carres-racines': {
    sections: [
      {
        title: 'Carrés parfaits 1-25',
        content: 'Mémorisez ces carrés essentiels. Ils sont fondamentaux pour toutes les estimations rapides.',
        examples: [
          { problem: '12²', solution: '144', explanation: '10² + 2×10×2 + 2² = 100 + 40 + 4 = 144' },
          { problem: '15²', solution: '225', explanation: '15×15 = (10+5)² = 100 + 100 + 25 = 225' },
          { problem: '25²', solution: '625', explanation: 'Mémorisez : 25² = 625 (toujours finit par 25 pour les carrés de nombres finissant par 5)' },
        ],
        tips: ['Mémorisez les carrés jusqu\'à 25', 'Nombres finissant par 5 : (n5)² = n×(n+1) suivi de 25', 'Utilisez (a+b)² = a² + 2ab + b²']
      },
      {
        title: 'Estimation des racines carrées',
        content: 'Trouvez les carrés parfaits les plus proches. Estimez entre eux selon la position du nombre.',
        examples: [
          { problem: '√50', solution: '~7', explanation: '49 < 50 < 64, donc 7 < √50 < 8, plus proche de 49 donc ~7.1' },
          { problem: '√130', solution: '~11.4', explanation: '121 < 130 < 144, 11²=121, 12²=144, 130 est proche de 121' },
          { problem: '√200', solution: '~14.1', explanation: '196 < 200 < 225, 14²=196, très proche donc ~14.1' },
        ],
        tips: ['Repérez les carrés parfaits encadrants', 'La racine sera entre les racines de ces carrés', 'Plus le nombre est proche d\'un carré, plus l\'estimation est précise']
      },
      {
        title: 'Astuce des nombres finissant par 5',
        content: 'Pour calculer n5² : multipliez n par (n+1), puis ajoutez 25 à la fin.',
        examples: [
          { problem: '35²', solution: '1225', explanation: '3×4=12, ajoutez 25 → 1225' },
          { problem: '65²', solution: '4225', explanation: '6×7=42, ajoutez 25 → 4225' },
          { problem: '95²', solution: '9025', explanation: '9×10=90, ajoutez 25 → 9025' },
        ],
        tips: ['Pour n5 : calculez n×(n+1)', 'Ajoutez toujours 25 à la fin', 'Cette astuce marche pour tous les nombres finissant par 5']
      },
    ]
  },
  'puissances': {
    sections: [
      {
        title: 'Puissances de 2',
        content: 'Mémorisez les puissances de 2 jusqu\'à 2^10. Elles sont partout en informatique et mathématiques.',
        examples: [
          { problem: '2^8', solution: '256', explanation: '2^10=1024, donc 2^8 = 1024÷4 = 256' },
          { problem: '2^7', solution: '128', explanation: '2^8=256, donc 2^7 = 256÷2 = 128' },
          { problem: '2^12', solution: '4096', explanation: '2^10=1024, donc 2^12 = 1024×4 = 4096' },
        ],
        tips: ['2^10 = 1024 (mémorisez !)', 'Pour n+1 : double, pour n-1 : moitié', 'Utilisé partout en informatique']
      },
      {
        title: 'Puissances de 10',
        content: '10^n = 1 suivi de n zéros. Pour les négatifs : 0, suivi de (n-1) zéros, puis 1.',
        examples: [
          { problem: '10^5', solution: '100000', explanation: '1 suivi de 5 zéros = 100000' },
          { problem: '10^-3', solution: '0.001', explanation: '0, puis 2 zéros, puis 1 = 0.001' },
          { problem: '10^0', solution: '1', explanation: 'Par définition, toute puissance 0 = 1' },
        ],
        tips: ['10^n = 1 avec n zéros', '10^-n = 0.(n-1 zéros)1', 'Déplacez simplement la virgule']
      },
      {
        title: 'Propriétés des exposants',
        content: 'a^m × a^n = a^(m+n) | (a^m)^n = a^(m×n) | a^(-n) = 1/a^n. Ces règles simplifient tous les calculs.',
        examples: [
          { problem: '2^3 × 2^5', solution: '2^8 = 256', explanation: 'Additionnez les exposants : 3+5=8' },
          { problem: '(3^2)^3', solution: '3^6 = 729', explanation: 'Multipliez les exposants : 2×3=6' },
          { problem: '2^-3', solution: '1/8 = 0.125', explanation: 'Négatif = inverse : 1/2^3 = 1/8' },
        ],
        tips: ['Multiplication : additionnez les exposants', 'Puissance de puissance : multipliez les exposants', 'Exposant négatif = inverse']
      },
    ]
  },
  'factorisation': {
    sections: [
      {
        title: 'Factorisation par facteur commun',
        content: 'Identifiez le facteur commun à tous les termes, mettez-le en évidence. C\'est la méthode la plus fondamentale.',
        examples: [
          { problem: 'Factoriser 6x + 9', solution: '3(2x + 3)', explanation: 'PGCD(6,9)=3, donc 3×2x + 3×3 = 3(2x+3)' },
          { problem: 'Factoriser 12a + 8b', solution: '4(3a + 2b)', explanation: 'PGCD(12,8)=4, donc 4×3a + 4×2b = 4(3a+2b)' },
          { problem: 'Factoriser 15x² + 25x', solution: '5x(3x + 5)', explanation: 'Facteur commun : 5x, donc 5x×3x + 5x×5 = 5x(3x+5)' },
        ],
        tips: ['Trouvez le PGCD des coefficients', 'Identifiez les facteurs communs aux variables', 'Vérifiez en développant']
      },
      {
        title: 'Identités remarquables',
        content: 'a² + 2ab + b² = (a+b)² | a² - 2ab + b² = (a-b)² | a² - b² = (a+b)(a-b). Apprenez à les reconnaître instantanément.',
        examples: [
          { problem: 'Factoriser x² + 6x + 9', solution: '(x+3)²', explanation: 'a=x, b=3 : a²+2ab+b² = (x+3)²' },
          { problem: 'Factoriser 4x² - 25', solution: '(2x+5)(2x-5)', explanation: 'a=2x, b=5 : a²-b² = (a+b)(a-b)' },
          { problem: 'Factoriser 9x² - 12x + 4', solution: '(3x-2)²', explanation: 'a=3x, b=2 : a²-2ab+b² = (3x-2)²' },
        ],
        tips: ['Recherchez les carrés parfaits', 'Vérifiez le double produit', 'Carré parfait : 3 termes, 1er et 3e sont des carrés']
      },
      {
        title: 'Factorisation de trinômes',
        content: 'Pour x² + bx + c : cherchez deux nombres qui multiplient à c et additionnent à b.',
        examples: [
          { problem: 'Factoriser x² + 5x + 6', solution: '(x+2)(x+3)', explanation: '2×3=6 et 2+3=5, donc (x+2)(x+3)' },
          { problem: 'Factoriser x² - 7x + 12', solution: '(x-3)(x-4)', explanation: '(-3)×(-4)=12 et (-3)+(-4)=-7' },
          { problem: 'Factoriser x² + 2x - 8', solution: '(x+4)(x-2)', explanation: '4×(-2)=-8 et 4+(-2)=2' },
        ],
        tips: ['Produit = terme constant', 'Somme = coefficient du milieu', 'Testez les diviseurs du terme constant']
      },
    ]
  },
  'methodes-avancees': {
    sections: [
      {
        title: 'Méthode de la différence',
        content: 'Pour multiplier deux nombres proches d\'une base commune : (base + diff1)(base + diff2) = base² + base(diff1+diff2) + diff1×diff2',
        examples: [
          { problem: '43 × 37', solution: '1591', explanation: 'Base 40, diff +3 et -3 : 40² + 40(0) + (-9) = 1600 - 9 = 1591' },
          { problem: '52 × 48', solution: '2496', explanation: 'Base 50, diff +2 et -2 : 50² - 4 = 2500 - 4 = 2496' },
          { problem: '102 × 98', solution: '9996', explanation: 'Base 100, diff +2 et -2 : 100² - 4 = 10000 - 4 = 9996' },
        ],
        tips: ['Choisissez une base ronde entre les deux nombres', 'Calculez les différences à cette base', 'Appliquez la formule a² - b² quand les différences sont opposées']
      },
      {
        title: 'Multiplication rapide par 11',
        content: 'Pour un nombre à 2 chiffres : séparez les chiffres, additionnez-les, placez le résultat au milieu.',
        examples: [
          { problem: '23 × 11', solution: '253', explanation: '2_(2+3)_3 = 2_5_3 = 253' },
          { problem: '45 × 11', solution: '495', explanation: '4_(4+5)_5 = 4_9_5 = 495' },
          { problem: '78 × 11', solution: '858', explanation: '7_(7+8)_8 = 7_15_8 → retenue : 7+1_5_8 = 858' },
        ],
        tips: ['Séparez les deux chiffres', 'Additionnez-les pour le milieu', 'Si >9, gardez l\'unité et retenez la dizaine']
      },
      {
        title: 'Carrés rapides (méthode Vedic)',
        content: 'Pour nombres proches de 50 ou 100 : utilisez la base pour simplifier. Base 100 : n² = (n-100)(n+100) + 100² pour n>100',
        examples: [
          { problem: '52²', solution: '2704', explanation: '(52-2) × (52+2) + 2² = 50×54 + 4 = 2700 + 4 = 2704' },
          { problem: '47²', solution: '2209', explanation: '(47-3) × (47+3) + 3² = 44×50 + 9 = 2200 + 9 = 2209' },
          { problem: '96²', solution: '9216', explanation: '(100-4)² = 10000 - 800 + 16 = 9216' },
        ],
        tips: ['Utilisez la base 50 ou 100', 'Appliquez (a-b)² = a² - 2ab + b²', 'Simplifiez avec la base ronde']
      },
    ]
  },
};

const COURSES = [
  {
    id: 1,
    title: 'Addition rapide',
    slug: 'addition-rapide',
    description: 'Maîtrise les techniques d\'addition mentale pour calculer plus vite',
    difficulty: 1,
    duration: '15 min',
    icon: Calculator,
    color: 'from-blue-500/20 to-blue-600/20',
    topics: ['Addition de nombres à 1 chiffre', 'Compléments à 10', 'Addition de nombres à 2 chiffres', 'Techniques de regroupement']
  },
  {
    id: 2,
    title: 'Soustraction efficace',
    slug: 'soustraction-efficace',
    description: 'Apprends à soustraire rapidement sans calculatrice',
    difficulty: 2,
    duration: '20 min',
    icon: Calculator,
    color: 'from-green-500/20 to-green-600/20',
    topics: ['Soustraction par complément', 'Technique du "emprunt" mental', 'Soustraction de grands nombres', 'Vérification par addition']
  },
  {
    id: 3,
    title: 'Tables de multiplication',
    slug: 'tables-multiplication',
    description: 'Mémorise et maîtrise les tables de multiplication',
    difficulty: 3,
    duration: '30 min',
    icon: Target,
    color: 'from-purple-500/20 to-purple-600/20',
    topics: ['Tables de 2 à 9', 'Tables de 11 à 15', 'Carrés parfaits', 'Astuces de multiplication rapide']
  },
  {
    id: 4,
    title: 'Division mentale',
    slug: 'division-mentale',
    description: 'Techniques pour diviser rapidement sans papier',
    difficulty: 4,
    duration: '25 min',
    icon: Target,
    color: 'from-orange-500/20 to-orange-600/20',
    topics: ['Division par un chiffre', 'Estimation de quotient', 'Division avec reste', 'Vérification par multiplication']
  },
  {
    id: 5,
    title: 'Carrés et racines carrées',
    slug: 'carres-racines',
    description: 'Calcul des carrés et estimation des racines carrées',
    difficulty: 5,
    duration: '30 min',
    icon: Lightbulb,
    color: 'from-cyan-500/20 to-cyan-600/20',
    topics: ['Carrés de 1 à 25', 'Technique de calcul rapide des carrés', 'Estimation des racines carrées', 'Approximation linéaire']
  },
  {
    id: 6,
    title: 'Puissances et exponentiation',
    slug: 'puissances',
    description: 'Maîtrise les calculs avec puissances et exposants',
    difficulty: 6,
    duration: '35 min',
    icon: Lightbulb,
    color: 'from-red-500/20 to-red-600/20',
    topics: ['Puissances de 2', 'Puissances de 10', 'Propriétés des exposants', 'Calcul rapide de puissances']
  },
  {
    id: 7,
    title: 'Factorisation astucieuse',
    slug: 'factorisation',
    description: 'Techniques avancées de factorisation mentale',
    difficulty: 7,
    duration: '40 min',
    icon: Lightbulb,
    color: 'from-pink-500/20 to-pink-600/20',
    topics: ['Factorisation par facteur commun', 'Identités remarquables', 'Factorisation de trinômes', 'Applications rapides']
  },
  {
    id: 8,
    title: 'Méthodes de calcul avancées',
    slug: 'methodes-avancees',
    description: 'Techniques de pro pour le calcul mental ultra-rapide',
    difficulty: 8,
    duration: '45 min',
    icon: Trophy,
    color: 'from-yellow-500/20 to-yellow-600/20',
    topics: ['Méthode de la différence', 'Algorithme de multiplication rapide', 'Techniques de mémorisation', 'Entraînement systématique']
  }
];

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(null);

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        {/* Header */}
        <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </button>
            </div>
            <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
              <Trophy className="w-6 h-6" />
              <span className="font-bold">Math.com</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Course Header */}
            <div className={`p-8 rounded-2xl bg-gradient-to-br ${selectedCourse.color} mb-8`}>
              <div className="flex items-center gap-3 mb-4">
                <selectedCourse.icon className="w-8 h-8 text-white" />
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedCourse.difficulty <= 2 ? 'bg-green-500/30 text-green-300' :
                  selectedCourse.difficulty <= 5 ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-red-500/30 text-red-300'
                }`}>
                  {selectedCourse.difficulty <= 2 ? 'Débutant' :
                   selectedCourse.difficulty <= 5 ? 'Intermédiaire' : 'Avancé'}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{selectedCourse.title}</h1>
              <p className="text-lg opacity-90 mb-4">{selectedCourse.description}</p>
              <div className="flex items-center gap-2 text-sm opacity-75">
                <Clock className="w-4 h-4" />
                <span>{selectedCourse.duration}</span>
              </div>
            </div>

            {/* Detailed Course Content */}
            {COURSE_CONTENT[selectedCourse.slug]?.sections ? (
              <div className="space-y-8 mb-8">
                {COURSE_CONTENT[selectedCourse.slug].sections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] overflow-hidden"
                  >
                    {/* Section Header */}
                    <div className="p-6 border-b border-[#2a2a3a] bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold">
                          {index + 1}
                        </div>
                        <h2 className="text-xl font-bold">{section.title}</h2>
                      </div>
                    </div>

                    {/* Section Content */}
                    <div className="p-6">
                      <p className="text-gray-300 mb-6 leading-relaxed">{section.content}</p>

                      {/* Examples */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          Exemples
                        </h3>
                        <div className="space-y-3">
                          {section.examples.map((example, exIndex) => (
                            <div key={exIndex} className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3a]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-lg text-white">{example.problem}</span>
                                <span className="text-green-400 font-bold text-xl">= {example.solution}</span>
                              </div>
                              <p className="text-sm text-gray-400">{example.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tips */}
                      <div>
                        <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Astuces
                        </h3>
                        <ul className="space-y-2">
                          {section.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-3 text-sm text-gray-300">
                              <span className="text-yellow-400 mt-0.5">▸</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Fallback: simple topics list if no detailed content */
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Contenu du cours</h2>
                <div className="space-y-3">
                  {selectedCourse.topics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-[#12121a] rounded-xl border border-[#2a2a3a]"
                    >
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{topic}</span>
                      <CheckCircle className="w-5 h-5 text-gray-500 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                href={`/test?type=${selectedCourse.slug}`}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all glow-primary text-center flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Tester mes connaissances
              </Link>
              <Link
                href="/practice"
                className="px-6 py-4 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-xl font-semibold transition-all border border-[#2a2a3a] flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                S'exercer
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
              <Trophy className="w-6 h-6" />
              <span className="font-bold">Math.com</span>
            </Link>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">Cours</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Cours et Méthodes</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Apprends les techniques de calcul mental utilisées par les experts. 
            Progresse étape par étape avec nos cours interactifs.
          </p>
        </motion.div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {COURSES.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCourse(course)}
              className={`p-6 rounded-2xl bg-gradient-to-br ${course.color} border border-white/10 cursor-pointer hover:scale-[1.02] transition-all group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <course.icon className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  Niv. {course.difficulty}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-sm opacity-75 mb-4">{course.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm opacity-75">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <span>Commencer</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Preview topics */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs opacity-60 mb-2">{course.topics.length} leçons</p>
                <div className="flex flex-wrap gap-2">
                  {course.topics.slice(0, 2).map((topic, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded-full">
                      {topic}
                    </span>
                  ))}
                  {course.topics.length > 2 && (
                    <span className="text-xs px-2 py-1 bg-white/10 rounded-full">
                      +{course.topics.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 bg-[#12121a] rounded-2xl border border-[#2a2a3a]"
        >
          <h2 className="text-2xl font-bold mb-4">Parcours d&apos;apprentissage recommandé</h2>
          <p className="text-gray-400 mb-6">Apprends les méthodes et techniques pour devenir plus rapide.</p>
          <div className="flex flex-wrap items-center gap-4">
            {['Addition', 'Soustraction', 'Multiplication', 'Division', 'Puissances', 'Avancé'].map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold">
                  {i + 1}
                </div>
                <span className="font-medium">{step}</span>
                {i < 5 && <ChevronRight className="w-5 h-5 text-gray-500" />}
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
