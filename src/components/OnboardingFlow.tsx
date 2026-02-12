'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Trophy, ChevronRight, Check, Calculator, Target, TrendingUp 
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const { playSound } = useSound();

  const steps = [
    {
      title: "Bienvenue sur Math.com !",
      description: "Le chess.com des maths. Entraîne ton calcul mental et monte dans le classement.",
      icon: Trophy,
      color: "from-yellow-400 to-orange-500"
    },
    {
      title: "Système de classes",
      description: "Progresse de F- à S+ en améliorant ton Elo. Chaque nouveau rang débloque de nouvelles opérations.",
      icon: TrendingUp,
      color: "from-indigo-400 to-purple-500"
    },
    {
      title: "Tests chronométrés",
      description: "Affronte 20 questions contre la montre. Plus tu réponds vite et correctement, plus tu gagnes d'Elo !",
      icon: Target,
      color: "from-green-400 to-teal-500"
    },
    {
      title: "Prêt à commencer ?",
      description: "Fais ton test d'évaluation pour découvrir ton niveau actuel et commencer ta progression.",
      icon: Calculator,
      color: "from-pink-400 to-rose-500"
    }
  ];

  const nextStep = () => {
    playSound('click');
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      playSound('complete');
      onComplete();
    }
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 bg-[#0a0a0f]/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-[#12121a] rounded-3xl border border-[#2a2a3a] p-8 text-center"
        >
          {/* Progress */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i <= step ? 'w-8 bg-indigo-500' : 'w-2 bg-[#2a2a3a]'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${currentStep.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-12 h-12 text-foreground" />
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>
          <p className="text-foreground mb-8 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={nextStep}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group"
            >
              {step === steps.length - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  Commencer mon test
                </>
              ) : (
                <>
                  Continuer
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            {step < steps.length - 1 && (
              <button
                onClick={() => {
                  playSound('click');
                  onComplete();
                }}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Passer l'introduction
              </button>
            )}
          </div>

          {/* Step indicator */}
          <p className="mt-6 text-sm text-gray-500">
            Étape {step + 1} sur {steps.length}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
