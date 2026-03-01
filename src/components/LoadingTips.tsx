'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Calculator, Brain, Zap, Target, Trophy, Clock, Users, Sparkles } from 'lucide-react';

interface LoadingTip {
  icon: React.ReactNode;
  title: string;
  tip: string;
  category: 'strategy' | 'math' | 'game' | 'fun';
}

const loadingTips: LoadingTip[] = [
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Astuce de calcul",
    tip: "Pour multiplier par 5 rapidement : divise par 2 puis multiplie par 10. Ex: 24 × 5 = (24 ÷ 2) × 10 = 120",
    category: 'math'
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Mental math",
    tip: "Pour additionner 9, ajoute 10 puis soustrais 1. Ex: 47 + 9 = 47 + 10 - 1 = 56",
    category: 'math'
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Stratégie multijoueur",
    tip: "Concentre-toi sur la précision avant la vitesse. Une bonne réponse vaut mieux qu'une réponse rapide et fausse !",
    category: 'strategy'
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Progression",
    tip: "Chaque classe débloque de nouvelles opérations. Passe de F- à S+ en t'entraînant régulièrement !",
    category: 'game'
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Gestion du temps",
    tip: "Si tu bloques sur une question, passe à la suivante. Ne perds pas trop de temps sur une seule question !",
    category: 'strategy'
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Défie tes amis",
    tip: "Tu peux créer des parties privées et inviter tes amis avec un code ou un QR code !",
    category: 'game'
  },
  {
    icon: <Calculator className="w-5 h-5" />,
    title: "Astuce carrés",
    tip: "Les carrés des nombres se terminant par 5 : multiplie le chiffre des dizaines par (lui+1), ajoute 25. Ex: 35² = (3×4)25 = 1225",
    category: 'math'
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: "Pourcentages",
    tip: "Pour calculer 15%, fais 10% + 5%. Ex: 15% de 80 = 8 + 4 = 12",
    category: 'math'
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Le saviez-vous ?",
    tip: "Le nombre 142857 est magique : 142857 × 2 = 285714, 142857 × 3 = 428571... les mêmes chiffres qui tournent !",
    category: 'fun'
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Multiplication",
    tip: "11 × un nombre à 2 chiffres = additionne les 2 chiffres et mets le résultat au milieu. Ex: 11 × 34 = 3(3+4)4 = 374",
    category: 'math'
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Mode compétitif",
    tip: "En mode classé, ton Elo change selon tes performances. Gagne des points en répondant vite et correctement !",
    category: 'game'
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Tables de multiplication",
    tip: "Apprends les tables jusqu'à 12, pas seulement jusqu'à 10. Ça te donnera un avantage significatif !",
    category: 'math'
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Badges",
    tip: "Débloque des badges en atteignant des objectifs spéciaux. Collectionne-les tous sur ton profil !",
    category: 'game'
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Entraînement",
    tip: "5 minutes d'entraînement quotidien valent mieux qu'une heure une fois par semaine. La régularité est la clé !",
    category: 'strategy'
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: "Division",
    tip: "Pour vérifier une division : dividende = diviseur × quotient + reste. Toujours utile pour vérifier rapidement !",
    category: 'math'
  }
];

interface LoadingTipsProps {
  isLoading: boolean;
  className?: string;
}

export default function LoadingTips({ isLoading, className = '' }: LoadingTipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    // Change tip every 6 seconds
    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % loadingTips.length);
      setProgress(0);
    }, 6000);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 2; // 50 steps over 5 seconds
      });
    }, 100);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  const currentTip = loadingTips[currentTipIndex];
  const categoryColors = {
    strategy: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    math: 'text-green-400 bg-green-500/20 border-green-500/30',
    game: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    fun: 'text-pink-400 bg-pink-500/20 border-pink-500/30'
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTipIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`rounded-xl border p-4 ${categoryColors[currentTip.category]}`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              {currentTip.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                {currentTip.title}
              </h4>
              <p className="text-sm opacity-90 leading-relaxed">
                {currentTip.tip}
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-black/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white/40 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Tip counter dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {loadingTips.slice(0, 5).map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              index === currentTipIndex % 5
                ? 'bg-white w-4'
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
