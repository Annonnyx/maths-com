'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Trophy, BookOpen, ArrowLeft, Clock, Target, 
  ChevronRight, Calculator, Lightbulb, CheckCircle,
  ChevronDown, ChevronUp, Lock, Search, Triangle,
  Ruler, AlertCircle
} from 'lucide-react';
import { COURSES_BY_CLASS, CourseSection } from '@/lib/courses-data';
import { FrenchClass, FRENCH_CLASSES, formatClassName } from '@/lib/french-classes';
import { CycleSidebar, CYCLES, Cycle } from '@/components/courses/CycleSidebar';
import { InteractiveCourseSection } from '@/components/courses/InteractiveCourseSection';
import { getExampleGenerator } from '@/components/courses/ExampleGenerators';
import TrigonometryCourse from '@/components/TrigonometryCourse';

const CLASS_ICONS: Record<FrenchClass, string> = {
  'CP': '🌱', 'CE1': '🌿', 'CE2': '🍃', 'CM1': '🌳', 'CM2': '🌲',
  '6e': '📚', '5e': '📖', '4e': '📐', '3e': '🎓', '2de': '🏆',
  '1re': '⭐', 'Tle': '🎯', 'Sup1': '📚', 'Sup2': '📚', 'Sup3': '📚', 'Pro': '💼'
};

const CLASS_COLORS: Record<FrenchClass, string> = {
  'CP': 'from-green-500/20 to-green-600/20 border-green-500/30',
  'CE1': 'from-green-500/20 to-emerald-600/20 border-green-500/30',
  'CE2': 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  'CM1': 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  'CM2': 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
  '6e': 'from-red-500/20 to-red-600/20 border-red-500/30',
  '5e': 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
  '4e': 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  '3e': 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
  '2de': 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  '1re': 'from-violet-500/20 to-violet-600/20 border-violet-500/30',
  'Tle': 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
  'Sup1': 'from-rose-500/20 to-rose-600/20 border-rose-500/30',
  'Sup2': 'from-fuchsia-500/20 to-fuchsia-600/20 border-fuchsia-500/30',
  'Sup3': 'from-teal-500/20 to-teal-600/20 border-teal-500/30',
  'Pro': 'from-slate-500/20 to-slate-600/20 border-slate-500/30'
};

// Fonction pour déterminer le cycle d'un niveau
function getCycleForLevel(level: string): Cycle | null {
  return CYCLES.find(cycle => cycle.levels.includes(level)) || null;
}

function MultiplicationTableSection({ tableData }: { tableData: { table: number; values: number[]; tip: string }[] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 hover:border-indigo-500/50 transition-all mb-4"
      >
        <div className="flex items-center gap-3">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-white">Tables complètes (2-10)</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5 text-indigo-400" />}
      </button>

      {isExpanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
          {tableData.map((table) => (
            <div key={table.table} className="bg-[#1a1a2e] rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setSelectedTable(selectedTable === table.table ? null : table.table)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#252540] transition-colors"
              >
                <span className="font-medium text-white">Table de {table.table}</span>
                {selectedTable === table.table ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {selectedTable === table.table && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4">
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-3">
                    {table.values.map((value, idx) => (
                      <div key={idx} className="bg-[#0f0f1a] rounded-lg p-2 text-center border border-border">
                        <div className="text-xs text-muted-foreground">{table.table}×{idx + 1}</div>
                        <div className="font-bold text-indigo-400">{value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function CourseSectionComponent({ section, index }: { section: CourseSection; index: number }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-[#12121a] rounded-2xl border border-border overflow-hidden">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-6 border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold">{index + 1}</div>
          <h2 className="text-xl font-bold">{section.title}</h2>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {isExpanded && (
        <div className="p-6">
          <p className="text-muted-foreground mb-6">{section.content}</p>
          {section.isCollapsible && section.tableData && <MultiplicationTableSection tableData={section.tableData} />}
          {section.examples.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-indigo-400 uppercase mb-4">Exemples</h3>
              <div className="space-y-3">
                {section.examples.map((example, idx) => (
                  <div key={idx} className="bg-[#1a1a2e] rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-lg text-white">{example.problem}</span>
                      <span className="text-green-400 font-bold">= {example.solution}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{example.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-yellow-400 uppercase mb-4">Astuces</h3>
            <ul className="space-y-2">
              {section.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-yellow-400">▸</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function CoursesPage() {
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrigCourse, setShowTrigCourse] = useState(false);
  const userClass = '6e' as FrenchClass;
  const coursesList = Object.values(COURSES_BY_CLASS);
  const availableLevels = coursesList.map(c => c.className.toLowerCase());

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return coursesList;
    
    const query = searchQuery.toLowerCase();
    return coursesList.filter(course => {
      // Search in title and description
      if (course.title.toLowerCase().includes(query) || 
          course.description.toLowerCase().includes(query)) {
        return true;
      }
      // Search in sections
      return course.sections.some(section => 
        section.title.toLowerCase().includes(query) ||
        section.content.toLowerCase().includes(query) ||
        section.examples.some(ex => 
          ex.problem.toLowerCase().includes(query) ||
          ex.explanation.toLowerCase().includes(query)
        ) ||
        section.tips.some(tip => tip.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, coursesList]);

  // Vue détaillée d'un cours
  if (selectedLevel) {
    const frenchClass = selectedLevel.toLowerCase() as FrenchClass;
    const course = COURSES_BY_CLASS[frenchClass];
    
    // Fallback si le cours n'existe pas
    if (!course) {
      return (
        <div className="min-h-screen bg-background text-white">
          <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <button 
                onClick={() => setSelectedLevel(null)} 
                className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />Retour
              </button>
              <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                <Trophy className="w-6 h-6" /><span className="font-bold">maths-app.com</span>
              </Link>
            </div>
          </header>
          
          <main className="max-w-4xl mx-auto px-4 py-16 text-center">
            <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Cours bientôt disponible</h1>
            <p className="text-muted-foreground mb-8">Le programme pour {formatClassName(frenchClass)} est en cours de rédaction.</p>
            <button 
              onClick={() => setSelectedLevel(null)}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-all"
            >
              Retour aux cours
            </button>
          </main>
        </div>
      );
    }

    const cycle = getCycleForLevel(selectedLevel);

    return (
    <div className="min-h-screen bg-background text-white">
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                <Trophy className="w-6 h-6" /><span className="font-bold">maths-app.com</span>
              </Link>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Cours par niveau</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un cours, une technique, une formule..."
              className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Cours et Méthodes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Apprends les techniques de calcul mental adaptées à ton niveau scolaire.</p>
        </motion.div>
        
        {/* Special Courses Section */}
        {!searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Triangle className="w-5 h-5 text-pink-400" />
              Cours Spéciaux
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowTrigCourse(true)}
                className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 cursor-pointer hover:scale-[1.02] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">📐</span>
                  <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm font-semibold">Interactive</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Trigonométrie</h3>
                <p className="text-sm opacity-75 mb-4">Cours complet sur sinus, cosinus et le cercle trigonométrique avec démonstrations interactives.</p>
                <div className="flex items-center gap-2 text-sm text-pink-400">
                  <Triangle className="w-4 h-4" />
                  <span>Sinus & Cosinus • Cercle unité • Triangles</span>
                </div>
              </motion.div>
              
              <Link href="/dashboard/geometry">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 cursor-pointer hover:scale-[1.02] transition-all h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">📏</span>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold">Atelier</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Atelier de Géométrie</h3>
                  <p className="text-sm opacity-75 mb-4">Dessinez, construisez et explorez la géométrie comme avec GeoGebra.</p>
                  <div className="flex items-center gap-2 text-sm text-cyan-400">
                    <Ruler className="w-4 h-4" />
                    <span>Figures • Mesures • Constructions</span>
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        )}
        
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-400">
              {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} pour "{searchQuery}"
            </h2>
            {searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun cours trouvé. Essayez avec d'autres termes comme "addition", "table de 7", "pythagore"...</p>
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(searchQuery ? searchResults : coursesList).map((course, index) => {
            const frenchClass = course.className as FrenchClass;
            const classIndex = FRENCH_CLASSES.indexOf(frenchClass);
            const isCurrent = frenchClass === userClass;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedLevel(frenchClass)}
                className={`p-6 rounded-2xl bg-gradient-to-br ${CLASS_COLORS[frenchClass]} border cursor-pointer hover:scale-[1.02] transition-all relative ${isCurrent ? 'ring-2 ring-indigo-500' : ''}`}
              >
                {isCurrent && <div className="absolute top-4 right-4"><span className="px-2 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">Ton niveau</span></div>}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{CLASS_ICONS[frenchClass]}</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">{formatClassName(frenchClass)}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-sm opacity-75 mb-4">{course.description}</p>
                <div className="flex items-center gap-4 text-sm opacity-75">
                  <span>{course.duration}</span>
                  <span>{course.sections.length} leçons</span>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Trig Course Modal */}
        {showTrigCourse && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="min-h-screen px-4 py-8">
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => setShowTrigCourse(false)}
                  className="fixed top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white z-50"
                >
                  ✕
                </button>
                <TrigonometryCourse />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
}
