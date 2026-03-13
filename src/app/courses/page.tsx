'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Trophy, BookOpen, ArrowLeft, Clock, Target, 
  ChevronRight, Calculator, Lightbulb, CheckCircle,
  ChevronDown, ChevronUp, Lock, Search, Triangle,
  Ruler, AlertCircle, Users, GraduationCap, Grid3X3,
  Star, TrendingUp, Sparkles
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
  'CM2': 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  '6e': 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  '5e': 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  '4e': 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
  '3e': 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  '2de': 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  '1re': 'from-rose-500/20 to-red-500/20 border-rose-500/30',
  'Tle': 'from-red-500/20 to-orange-500/20 border-red-500/30',
  'Sup1': 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
  'Sup2': 'from-yellow-500/20 to-lime-500/20 border-yellow-500/30',
  'Sup3': 'from-lime-500/20 to-green-500/20 border-lime-500/30',
  'Pro': 'from-slate-500/20 to-slate-600/20 border-slate-500/30'
};

// Fonction pour déterminer le cycle d'un niveau
function getCycleForLevel(level: FrenchClass): Cycle | null {
  return CYCLES.find(cycle => cycle.levels.includes(level)) || null;
}

// Tables de multiplication
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
                    {table.values.map((value, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-400">{index + 1}</div>
                        <div className="font-semibold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 italic">{table.tip}</p>
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<FrenchClass | null>(null);
  const [showTrigCourse, setShowTrigCourse] = useState(false);
  const [userClass] = useState<FrenchClass>('4e'); // Simuler l'utilisateur connecté

  // Filtrage des cours
  const { coursesList, searchResults, showPiLink } = useMemo(() => {
    let allCourses = Object.entries(COURSES_BY_CLASS).flatMap(([className, course]) => ({
      ...course,
      className
    }));

    // Filtrage par cycle
    if (selectedCycle) {
      allCourses = allCourses.filter(course => 
        selectedCycle.levels.includes(course.className as FrenchClass)
      );
    }

    // Recherche normale
    const searchResults = searchQuery 
      ? allCourses.filter(course => 
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.sections.some(section => 
            section.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      : [];

    // Détection du mode caché Pi
    const showPiLink = searchQuery === '3.14' || searchQuery === 'pi' || searchQuery === 'π';

    return {
      coursesList: allCourses,
      searchResults,
      showPiLink
    };
  }, [selectedCycle, searchQuery]);

  // Si un niveau est sélectionné, afficher le détail
  if (selectedLevel) {
    const course = COURSES_BY_CLASS[selectedLevel];
    if (!course) {
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
            </div>
          </header>
          
          <main className="max-w-4xl mx-auto px-4 py-16 text-center">
            <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Cours bientôt disponible</h1>
            <p className="text-muted-foreground mb-8">Le programme pour {formatClassName(selectedLevel)} est en cours de rédaction.</p>
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
                <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-bold">maths-app.com</span>
                </Link>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">Cours de {formatClassName(selectedLevel)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{CLASS_ICONS[selectedLevel]}</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">{formatClassName(selectedLevel)}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-muted-foreground mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.sections.length} leçons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>{course.skills.length} compétences</span>
                </div>
              </div>
            </div>

            {/* Compétences acquises */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Compétences acquises</h2>
              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Bouton d'entraînement */}
            <div className="mb-8">
              <Link 
                href={`/courses/${course.className.toLowerCase()}/practice`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg"
              >
                <Target className="w-6 h-6" />
                S'entraîner sur ce cours
              </Link>
              <p className="text-sm text-gray-400 mt-2">
                Teste tes connaissances avec des exercices basés sur ce cours
              </p>
            </div>

            {/* Sections du cours */}
            <div className="space-y-8">
              {course.sections.map((section, index) => (
                <InteractiveCourseSection
                  key={index}
                  title={section.title}
                  content={section.content}
                  examples={(section.examples || []).map((ex, i) => ({ ...ex, id: `${selectedLevel}-${index}-${i}` }))}
                  tips={section.tips || []}
                  courseId={`${selectedLevel}-${index}`}
                  difficulty="intermediate"
                />
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Vue principale des cours
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">maths-app.com</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un cours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Cours de Mathématiques
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Explore nos cours interactifs par niveau scolaire, du CP à la Terminale. 
            Apprends à ton rythme avec des exercices pratiques et des explications claires.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/practice" className="group">
              <div className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition-all hover:scale-[1.02]">
                <Calculator className="w-8 h-8 text-blue-400 mb-3" />
                <div className="font-semibold text-white mb-1">Exercices</div>
                <div className="text-sm text-gray-400">Entraînement libre</div>
              </div>
            </Link>

            <Link href="/test" className="group">
              <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-[1.02]">
                <Target className="w-8 h-8 text-green-400 mb-3" />
                <div className="font-semibold text-white mb-1">Tests</div>
                <div className="text-sm text-gray-400">Évaluation chronométrée</div>
              </div>
            </Link>

            <Link href="/courses/geometry" className="group">
              <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all hover:scale-[1.02]">
                <Grid3X3 className="w-8 h-8 text-purple-400 mb-3" />
                <div className="font-semibold text-white mb-1">Géométrie</div>
                <div className="text-sm text-gray-400">Laboratoire interactif</div>
              </div>
            </Link>

            <button
              onClick={() => setShowTrigCourse(true)}
              className="p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30 hover:border-orange-500/50 transition-all hover:scale-[1.02] text-left"
            >
              <Triangle className="w-8 h-8 text-orange-400 mb-3" />
              <div className="font-semibold text-white mb-1">Trigonométrie</div>
              <div className="text-sm text-gray-400">Cours avancé</div>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CycleSidebar
                selectedCycle={selectedCycle}
                onSelectCycle={setSelectedCycle}
                selectedLevel={selectedLevel}
                onSelectLevel={setSelectedLevel}
                availableLevels={[...FRENCH_CLASSES]}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-300">
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} pour "{searchQuery}"
                </h2>
              </div>
            )}

            {/* Lien caché vers le mode Pi */}
            {showPiLink && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <Link href="/courses/pi-memory" className="block">
                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 hover:border-purple-500/50 p-6 transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-600/30 rounded-lg">
                        <span className="text-2xl font-bold">π</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">Défi Secret : Maîtrise de π</h3>
                        <p className="text-gray-300 text-sm">
                          Mode caché débloqué ! Teste ta mémoire avec les décimales de Pi
                        </p>
                      </div>
                      <div className="text-purple-400">
                        <Sparkles className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-purple-300">
                      🎯 Mode Caché : Mémorise les décimales sans les voir • 🎮 Mode Révélation : Teste ta vitesse de frappe
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {searchQuery && searchResults.length === 0 && !showPiLink && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
                <p className="text-gray-400">Essaie avec d'autres termes comme "addition", "multiplication", "géométrie"...</p>
              </div>
            )}

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(searchQuery ? searchResults : coursesList).map((course, index) => {
                const frenchClass = course.className as FrenchClass;
                const isCurrent = frenchClass === userClass;

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedLevel(frenchClass)}
                    className={`p-6 rounded-2xl bg-gradient-to-br ${CLASS_COLORS[frenchClass]} border cursor-pointer hover:scale-[1.02] transition-all relative ${isCurrent ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    {isCurrent && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Ton niveau
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-3xl">{CLASS_ICONS[frenchClass]}</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                        {formatClassName(frenchClass)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-sm opacity-75 mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between text-sm opacity-75">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.sections.length}</span>
                        </div>
                      </div>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Multiplication Tables */}
            <div className="mt-12">
              <MultiplicationTableSection tableData={[
                { table: 2, values: [2,4,6,8,10,12,14,16,18,20], tip: 'Le plus facile : doublez chaque nombre' },
                { table: 3, values: [3,6,9,12,15,18,21,24,27,30], tip: 'Comptez de 3 en 3' },
                { table: 4, values: [4,8,12,16,20,24,28,32,36,40], tip: 'Doublez la table de 2' },
                { table: 5, values: [5,10,15,20,25,30,35,40,45,50], tip: 'Termine toujours par 0 ou 5' },
                { table: 6, values: [6,12,18,24,30,36,42,48,54,60], tip: 'Doublez la table de 3' },
                { table: 7, values: [7,14,21,28,35,42,49,56,63,70], tip: 'La plus difficile, entraîtez-vous !' },
                { table: 8, values: [8,16,24,32,40,48,56,64,72,80], tip: 'Doublez la table de 4' },
                { table: 9, values: [9,18,27,36,45,54,63,72,81,90], tip: 'La somme des chiffres fait 9' },
                { table: 10, values: [10,20,30,40,50,60,70,80,90,100], tip: 'Ajoutez un 0 après le nombre' }
              ]} />
            </div>
          </div>
        </div>
      </main>
      
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
    </div>
  );
}
