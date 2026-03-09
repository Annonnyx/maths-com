'use client';

import { motion } from 'framer-motion';
import { ChevronRight, GraduationCap } from 'lucide-react';

export type Cycle = {
  id: string;
  name: string;
  description: string;
  levels: string[];
  color: string;
  gradient: string;
};

export const CYCLES: Cycle[] = [
  {
    id: 'cycle2',
    name: 'Cycle 2',
    description: 'CP - CE1 - CE2',
    levels: ['CP', 'CE1', 'CE2'],
    color: 'from-green-500 to-emerald-600',
    gradient: 'from-green-500/20 to-emerald-600/20',
  },
  {
    id: 'cycle3',
    name: 'Cycle 3',
    description: 'CM1 - CM2 - 6ème',
    levels: ['CM1', 'CM2', '6e'],
    color: 'from-blue-500 to-cyan-600',
    gradient: 'from-blue-500/20 to-cyan-600/20',
  },
  {
    id: 'cycle4',
    name: 'Cycle 4',
    description: '5ème - 4ème - 3ème',
    levels: ['5e', '4e', '3e'],
    color: 'from-purple-500 to-pink-600',
    gradient: 'from-purple-500/20 to-pink-600/20',
  },
  {
    id: 'lycee',
    name: 'Lycée',
    description: '2nde - 1ère - Terminale',
    levels: ['2de', '1re', 'Tle'],
    color: 'from-amber-500 to-orange-600',
    gradient: 'from-amber-500/20 to-orange-600/20',
  },
  {
    id: 'avance',
    name: 'Avancé',
    description: 'Pro & Licence',
    levels: ['Pro'],
    color: 'from-red-500 to-rose-600',
    gradient: 'from-red-500/20 to-rose-600/20',
  },
];

interface CycleSidebarProps {
  selectedCycle: string | null;
  onSelectCycle: (cycle: string | null) => void;
  selectedLevel: string | null;
  onSelectLevel: (level: string | null) => void;
  availableLevels: string[];
}

export function CycleSidebar({
  selectedCycle,
  onSelectCycle,
  selectedLevel,
  onSelectLevel,
  availableLevels,
}: CycleSidebarProps) {
  return (
    <div className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-[#12121a] rounded-2xl border border-border p-4 sticky top-24">
        <div className="flex items-center gap-3 mb-6 px-2">
          <GraduationCap className="w-6 h-6 text-indigo-400" />
          <h2 className="font-bold text-lg">Cycles</h2>
        </div>

        <div className="space-y-2">
          {CYCLES.map((cycle) => {
            const isActive = selectedCycle === cycle.id;
            const isExpanded = isActive;

            return (
              <div key={cycle.id}>
                <motion.button
                  onClick={() => {
                    if (isActive) {
                      onSelectCycle(null);
                      onSelectLevel(null);
                    } else {
                      onSelectCycle(cycle.id);
                      onSelectLevel(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${cycle.gradient} border border-white/20`
                      : 'hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full bg-gradient-to-r ${cycle.color}`}
                    />
                    <div className="text-left">
                      <div className="font-semibold">{cycle.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {cycle.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </motion.button>

                {/* Sous-niveaux */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-6 mt-2 space-y-1"
                  >
                    {cycle.levels.map((level) => {
                      const hasCourse = availableLevels.includes(level);
                      const isLevelActive = selectedLevel === level;

                      return (
                        <button
                          key={level}
                          onClick={() =>
                            onSelectLevel(hasCourse ? level : null)
                          }
                          disabled={!hasCourse}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                            isLevelActive
                              ? 'bg-white/10 text-white'
                              : hasCourse
                              ? 'text-muted-foreground hover:text-white hover:bg-white/5'
                              : 'text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          <span>{level.toUpperCase()}</span>
                          {!hasCourse && (
                            <span className="text-xs">Bientôt</span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
