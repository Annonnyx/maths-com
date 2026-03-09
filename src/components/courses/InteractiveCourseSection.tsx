'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, RefreshCw, Calculator, Lightbulb, BookOpen } from 'lucide-react';

export interface Formula {
  name: string;
  formula: string; // Latex-like format
  description?: string;
}

export interface GeneratedExample {
  id: string;
  problem: string;
  solution: string;
  explanation: string;
  steps?: string[];
}

// Composant pour afficher les formules sans KaTeX (fallback)
function FormulaDisplay({ formula }: { formula: string }) {
  // Remplacer les notations LaTeX courantes par du texte stylisé
  const styledFormula = formula
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="inline-flex flex-col items-center align-middle mx-1"><span class="border-b border-white px-1">$1</span><span>$2</span></span>')
    .replace(/\^\{([^}]+)\}/g, '<sup class="text-xs">$1</sup>')
    .replace(/_\{([^}]+)\}/g, '<sub class="text-xs">$1</sub>')
    .replace(/\\sqrt\{([^}]+)\}/g, '<span class="inline-flex items-center">√<span class="border-t border-white px-1">$1</span></span>')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pi/g, 'π')
    .replace(/\\approx/g, '≈')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\infty/g, '∞')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\int/g, '∫')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ');

  return (
    <span 
      className="font-mono text-lg"
      dangerouslySetInnerHTML={{ __html: styledFormula }}
    />
  );
}

export interface InteractiveCourseSectionProps {
  title: string;
  content: string;
  formulas?: Formula[];
  examples: GeneratedExample[];
  tips: string[];
  onGenerateExample?: () => GeneratedExample;
  hasVisualization?: boolean;
  visualizationComponent?: React.ReactNode;
  courseId: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export function InteractiveCourseSection({
  title,
  content,
  formulas = [],
  examples: initialExamples,
  tips,
  onGenerateExample,
  hasVisualization,
  visualizationComponent,
  courseId,
  difficulty = 'intermediate',
}: InteractiveCourseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFormulas, setShowFormulas] = useState(false);
  const [examples, setExamples] = useState<GeneratedExample[]>(initialExamples);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);

  // Générer un nouvel exemple
  const handleNewExample = useCallback(async () => {
    if (!onGenerateExample) return;
    
    setIsGenerating(true);
    try {
      // Simuler un délai pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 300));
      const newExample = onGenerateExample();
      setExamples(prev => [newExample, ...prev.slice(0, 4)]); // Garder les 5 derniers
    } finally {
      setIsGenerating(false);
    }
  }, [onGenerateExample]);

  const difficultyColors = {
    beginner: 'from-green-500/20 to-emerald-600/20 border-green-500/30',
    intermediate: 'from-blue-500/20 to-cyan-600/20 border-blue-500/30',
    advanced: 'from-purple-500/20 to-pink-600/20 border-purple-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#12121a] rounded-2xl border border-border overflow-hidden ${difficultyColors[difficulty]}`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-left">{title}</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Résumé du cours */}
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">{content}</p>
          </div>

          {/* Formules clés */}
          {formulas.length > 0 && (
            <div>
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors mb-3"
              >
                <Calculator className="w-4 h-4" />
                Formules clés ({formulas.length})
                {showFormulas ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {showFormulas && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#0f0f1a] rounded-xl p-4 border border-border/50"
                >
                  <div className="grid gap-3">
                    {formulas.map((formula, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">{formula.name}</span>
                        {formula.description && (
                          <span className="text-xs text-gray-500">{formula.description}</span>
                        )}
                        <FormulaDisplay formula={formula.formula} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Visualisation */}
          {hasVisualization && (
            <div>
              <button
                onClick={() => setShowVisualization(!showVisualization)}
                className="flex items-center gap-2 text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors mb-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
                Visualisation
                {showVisualization ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {showVisualization && visualizationComponent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#0f0f1a] rounded-xl p-4 border border-border/50 overflow-hidden"
                >
                  {visualizationComponent}
                </motion.div>
              )}
            </div>
          )}

          {/* Exemples interactifs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-green-400 uppercase flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Exemples interactifs
              </h3>
              {onGenerateExample && (
                <button
                  onClick={handleNewExample}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-sm transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Nouvel exemple
                </button>
              )}
            </div>

            <div className="space-y-3">
              {examples.map((example, idx) => (
                <motion.div
                  key={example.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#1a1a2e] rounded-xl p-4 border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <FormulaDisplay formula={example.problem} />
                    <span className="text-green-400 font-bold text-lg">
                      = <FormulaDisplay formula={example.solution} />
                    </span>
                  </div>
                  
                  {example.steps && example.steps.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {example.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="text-sm text-muted-foreground pl-4 border-l-2 border-indigo-500/30">
                          <FormulaDisplay formula={step} />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground">{example.explanation}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Astuces */}
          <div>
            <h3 className="text-sm font-semibold text-yellow-400 uppercase mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Astuces
            </h3>
            <ul className="space-y-2">
              {tips.map((tip, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="text-yellow-400 mt-0.5">▸</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bouton S'entraîner */}
          <div className="pt-4 border-t border-border">
            <a
              href={`/practice?course_id=${courseId}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl font-semibold transition-all"
            >
              <Calculator className="w-5 h-5" />
              S'entraîner sur ce chapitre
            </a>
          </div>
        </div>
      )}
    </motion.div>
  );
}
