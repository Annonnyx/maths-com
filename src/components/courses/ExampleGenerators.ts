import { randomInt, randomChoice } from '../../../src/lib/question-generators/types';
import type { GeneratedExample } from './InteractiveCourseSection';

// Générateurs d'exemples par niveau et par chapitre

export const EXAMPLE_GENERATORS: Record<string, () => GeneratedExample> = {
  // CP - Nombres 0-20
  'cp-numbers': () => {
    const a = randomInt(1, 10);
    const b = 10 - a;
    return {
      id: `cp-${Date.now()}`,
      problem: `${a} + ? = 10`,
      solution: b.toString(),
      explanation: `Le complément à 10 de ${a} est ${b} car ${a} + ${b} = 10`,
    };
  },
  
  // CP - Additions simples
  'cp-addition': () => {
    const a = randomInt(1, 10);
    const b = randomInt(1, 10);
    return {
      id: `cp-${Date.now()}`,
      problem: `${a} + ${b}`,
      solution: (a + b).toString(),
      explanation: `${a} + ${b} = ${a + b}. On peut compter : ${Array.from({length: b}, (_, i) => a + i + 1).join(', ')}`,
    };
  },

  // CE1 - Tables 2, 5, 10
  'ce1-tables': () => {
    const tables = [2, 5, 10];
    const table = randomChoice(tables);
    const n = randomInt(1, 10);
    return {
      id: `ce1-${Date.now()}`,
      problem: `${table} × ${n}`,
      solution: (table * n).toString(),
      explanation: `Table de ${table} : ${table} × ${n} = ${table * n}`,
    };
  },

  // CE2 - Multiplication
  'ce2-multiplication': () => {
    const a = randomInt(2, 9);
    const b = randomInt(2, 9);
    return {
      id: `ce2-${Date.now()}`,
      problem: `${a} × ${b}`,
      solution: (a * b).toString(),
      explanation: `${a} × ${b} = ${a * b}`,
    };
  },

  // CE2 - Division
  'ce2-division': () => {
    const b = randomInt(2, 9);
    const result = randomInt(2, 9);
    const a = b * result;
    return {
      id: `ce2-${Date.now()}`,
      problem: `${a} ÷ ${b}`,
      solution: result.toString(),
      explanation: `${a} ÷ ${b} = ${result} car ${result} × ${b} = ${a}`,
    };
  },

  // CM1 - Pourcentages
  'cm1-percentage': () => {
    const base = randomInt(20, 100);
    const percent = randomChoice([10, 25, 50]);
    const result = (base * percent) / 100;
    return {
      id: `cm1-${Date.now()}`,
      problem: `${percent}% de ${base}`,
      solution: result.toString(),
      explanation: `${percent}% de ${base} = (${base} × ${percent}) ÷ 100 = ${result}`,
    };
  },

  // CM1 - Division avec reste
  'cm1-division-remainder': () => {
    const divisor = randomInt(3, 9);
    const quotient = randomInt(3, 12);
    const remainder = randomInt(1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    return {
      id: `cm1-${Date.now()}`,
      problem: `${dividend} ÷ ${divisor}`,
      solution: `${quotient} reste ${remainder}`,
      explanation: `${divisor} × ${quotient} = ${divisor * quotient}, et il reste ${remainder}`,
    };
  },

  // CM2 - Fractions simples
  'cm2-fractions': () => {
    const num = randomInt(1, 3);
    const den = randomInt(2, 5);
    const whole = randomInt(2, 10);
    return {
      id: `cm2-${Date.now()}`,
      problem: `${num}/${den} de ${whole * den}`,
      solution: (num * whole).toString(),
      explanation: `${num}/${den} de ${whole * den} = (${whole * den} ÷ ${den}) × ${num} = ${whole} × ${num} = ${num * whole}`,
    };
  },

  // CM2 - Carrés parfaits
  'cm2-squares': () => {
    const n = randomInt(11, 20);
    return {
      id: `cm2-${Date.now()}`,
      problem: `${n}²`,
      solution: (n * n).toString(),
      explanation: `${n}² = ${n} × ${n} = ${n * n}`,
    };
  },

  // 6ème - Puissances de 10
  '6e-powers': () => {
    const exp = randomInt(2, 5);
    return {
      id: `6e-${Date.now()}`,
      problem: `10^${exp}`,
      solution: Math.pow(10, exp).toString(),
      explanation: `10^${exp} = 1${'0'.repeat(exp)} = ${Math.pow(10, exp)}`,
    };
  },

  // 6ème - Nombres relatifs
  '6e-relatifs': () => {
    const a = randomInt(-10, 10);
    const b = randomInt(-10, 10);
    return {
      id: `6e-${Date.now()}`,
      problem: `(${a}) + (${b})`,
      solution: (a + b).toString(),
      explanation: `(${a}) + (${b}) = ${a + b}`,
    };
  },

  // 5ème - Pythagore
  '5e-pythagore': () => {
    const triplets = [[3, 4, 5], [6, 8, 10], [5, 12, 13]];
    const [a, b, c] = randomChoice(triplets);
    return {
      id: `5e-${Date.now()}`,
      problem: `Triangle rectangle avec a=${a}, b=${b}, c=?`,
      solution: c.toString(),
      explanation: `c² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a + b*b}, donc c = √${a*a + b*b} = ${c}`,
    };
  },

  // 4ème - Identités remarquables
  '4e-identities': () => {
    const a = randomInt(2, 9);
    const b = randomInt(1, 5);
    return {
      id: `4e-${Date.now()}`,
      problem: `(${a} + ${b})²`,
      solution: ((a + b) ** 2).toString(),
      explanation: `(${a} + ${b})² = ${a}² + 2×${a}×${b} + ${b}² = ${a*a} + ${2*a*b} + ${b*b} = ${(a + b) ** 2}`,
    };
  },

  // 3ème - Racines carrées
  '3e-racines': () => {
    const squares = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
    const n = randomChoice(squares);
    const sqrt = Math.sqrt(n);
    return {
      id: `3e-${Date.now()}`,
      problem: `√${n}`,
      solution: sqrt.toString(),
      explanation: `√${n} = ${sqrt} car ${sqrt}² = ${n}`,
    };
  },

  // 3ème - Systèmes
  '3e-systemes': () => {
    const x = randomInt(1, 5);
    const y = randomInt(1, 5);
    const a = 1, b = 1;
    const c = a * x + b * y;
    return {
      id: `3e-${Date.now()}`,
      problem: `x + y = ${c}, trouve x et y`,
      solution: `x=${x}, y=${y}`,
      explanation: `Si x = ${x} et y = ${y}, alors x + y = ${x} + ${y} = ${c}`,
    };
  },

  // 2nde - Fonctions de référence
  '2nde-fonctions': () => {
    const x = randomInt(-5, 5);
    return {
      id: `2nde-${Date.now()}`,
      problem: `f(x) = x², calcule f(${x})`,
      solution: (x * x).toString(),
      explanation: `f(${x}) = ${x}² = ${x * x}`,
    };
  },

  // 2nde - Vecteurs
  '2nde-vecteurs': () => {
    const x1 = randomInt(1, 5);
    const y1 = randomInt(1, 5);
    const x2 = randomInt(1, 5);
    const y2 = randomInt(1, 5);
    return {
      id: `2nde-${Date.now()}`,
      problem: `u(${x1};${y1}) + v(${x2};${y2})`,
      solution: `(${x1 + x2}; ${y1 + y2})`,
      explanation: `(${x1} + ${x2}; ${y1} + ${y2}) = (${x1 + x2}; ${y1 + y2})`,
    };
  },

  // 1ère - Dérivation
  '1re-derivation': () => {
    const a = randomInt(2, 5);
    const n = randomInt(2, 4);
    return {
      id: `1re-${Date.now()}`,
      problem: `f(x) = ${a}x^${n}, trouve f'(x)`,
      solution: `${a * n}x^${n - 1}`,
      explanation: `f'(x) = ${a} × ${n}x^${n - 1} = ${a * n}x^${n - 1}`,
    };
  },

  // 1ère - Suites
  '1re-suites': () => {
    const u0 = randomInt(1, 5);
    const r = randomInt(2, 5);
    const n = randomInt(5, 10);
    const un = u0 + n * r;
    return {
      id: `1re-${Date.now()}`,
      problem: `Suite arithmétique: u₀=${u0}, r=${r}, calcule u${n}`,
      solution: un.toString(),
      explanation: `u${n} = u₀ + ${n}×r = ${u0} + ${n}×${r} = ${u0} + ${n * r} = ${un}`,
    };
  },

  // Terminale - Limites
  'tle-limites': () => {
    const n = randomInt(2, 5);
    return {
      id: `tle-${Date.now()}`,
      problem: `lim(x→+∞) de 1/x^${n}`,
      solution: '0',
      explanation: `Quand x tend vers +∞, 1/x^${n} tend vers 0`,
    };
  },

  // Terminale - Dérivées
  'tle-derivation': () => {
    const a = randomInt(2, 5);
    return {
      id: `tle-${Date.now()}`,
      problem: `f(x) = e^${a}x, trouve f'(x)`,
      solution: `${a}e^${a}x`,
      explanation: `(e^ax)' = a×e^ax, donc f'(x) = ${a}e^${a}x`,
    };
  },
};

// Fonction pour obtenir un générateur par défaut si le spécifique n'existe pas
export function getExampleGenerator(courseId: string, sectionId: string): (() => GeneratedExample) | undefined {
  const key = `${courseId}-${sectionId}`;
  return EXAMPLE_GENERATORS[key];
}
