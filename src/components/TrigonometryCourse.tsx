'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Triangle,
  Circle,
  Calculator,
  BookOpen,
  Play,
  ChevronRight
} from 'lucide-react';

export default function TrigonometryCourse() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      id: 'basics',
      title: 'Bases de la Trigonométrie',
      icon: <Triangle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Le Cercle Trigonométrique</h3>
            <p className="text-gray-300 mb-4">
              Le cercle trigonométrique est un cercle de rayon 1 centré à l'origine (0,0) d'un repère orthonormé.
            </p>
            <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
              Visualisation du cercle trigonométrique
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-indigo-400 mb-3">Définitions</h4>
              <div className="space-y-3 text-gray-300">
                <div>
                  <span className="text-green-400 font-medium">sin(θ)</span>
                  <p className="text-sm">Ordonnée du point M sur le cercle</p>
                </div>
                <div>
                  <span className="text-amber-400 font-medium">cos(θ)</span>
                  <p className="text-sm">Abscisse du point M sur le cercle</p>
                </div>
                <div>
                  <span className="text-purple-400 font-medium">tan(θ)</span>
                  <p className="text-sm">sin(θ) / cos(θ)</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
              <h4 className="text-lg font-semibold text-pink-400 mb-3">Valeurs Remarquables</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>sin(0) = 0</span>
                  <span>cos(0) = 1</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>sin(π/6) = 1/2</span>
                  <span>cos(π/6) = √3/2</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>sin(π/4) = √2/2</span>
                  <span>cos(π/4) = √2/2</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>sin(π/3) = √3/2</span>
                  <span>cos(π/3) = 1/2</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>sin(π/2) = 1</span>
                  <span>cos(π/2) = 0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'identities',
      title: 'Identités Trigonométriques',
      icon: <Calculator className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Formules Fondamentales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-indigo-400 mb-3">Identités de Base</h4>
                <div className="space-y-2 text-gray-300 font-mono">
                  <div>sin²(θ) + cos²(θ) = 1</div>
                  <div>1 + tan²(θ) = 1/cos²(θ)</div>
                  <div>1 + cot²(θ) = 1/sin²(θ)</div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">Formules d'Addition</h4>
                <div className="space-y-2 text-gray-300 font-mono text-sm">
                  <div>sin(a + b) = sin(a)cos(b) + cos(a)sin(b)</div>
                  <div>cos(a + b) = cos(a)cos(b) - sin(a)sin(b)</div>
                  <div>sin(a - b) = sin(a)cos(b) - cos(a)sin(b)</div>
                  <div>cos(a - b) = cos(a)cos(b) + sin(a)sin(b)</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
            <h4 className="text-lg font-semibold text-purple-400 mb-3">Formules de Duplication</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300 font-mono text-sm">
              <div>
                <div className="font-medium text-white mb-2">sin(2θ)</div>
                <div>2 sin(θ) cos(θ)</div>
              </div>
              <div>
                <div className="font-medium text-white mb-2">cos(2θ)</div>
                <div>cos²(θ) - sin²(θ)</div>
                <div>2cos²(θ) - 1</div>
                <div>1 - 2sin²(θ)</div>
              </div>
              <div>
                <div className="font-medium text-white mb-2">tan(2θ)</div>
                <div>2tan(θ) / (1 - tan²(θ))</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'applications',
      title: 'Applications',
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Applications Pratiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-cyan-400 mb-3">Triangle Rectangle</h4>
                <p className="text-gray-300 mb-3">
                  Dans un triangle rectangle, les relations trigonométriques permettent de calculer
                  des longueurs et des angles.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>• SOH : sin = Opposé / Hypoténuse</div>
                  <div>• CAH : cos = Adjacent / Hypoténuse</div>
                  <div>• TOA : tan = Opposé / Adjacent</div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-emerald-400 mb-3">Ondes et Signaux</h4>
                <p className="text-gray-300 mb-3">
                  Les fonctions trigonométriques modélisent les phénomènes périodiques
                  comme les ondes sonores, lumineuses et électriques.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>• Son: y = A sin(2πft + φ)</div>
                  <div>• Courant alternatif: i = I sin(ωt + φ)</div>
                  <div>• Mouvements oscillatoires</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
            <h4 className="text-lg font-semibold text-amber-400 mb-3">Exercices Pratiques</h4>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300 mb-2">
                  <strong>Exercice 1:</strong> Calculer la hauteur d'un arbre sachant que l'angle
                  d'élévation est de 30° et la distance à l'arbre est de 20m.
                </p>
                <p className="text-sm text-gray-400">
                  tan(30°) = h/20 → h = 20 × tan(30°) ≈ 11.55m
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300 mb-2">
                  <strong>Exercice 2:</strong> Vérifier l'identité sin²(θ) + cos²(θ) = 1 pour θ = π/4.
                </p>
                <p className="text-sm text-gray-400">
                  sin(π/4) = √2/2, cos(π/4) = √2/2
                  <br />
                  (√2/2)² + (√2/2)² = 1/2 + 1/2 = 1 ✓
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Cours de Trigonométrie
          </h1>
          <p className="text-gray-400">
            Apprenez les bases de la trigonométrie avec des visualisations interactives
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === index
                    ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {sections[activeSection].content}
        </motion.div>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Précédent
          </button>
          
          {activeSection < sections.length - 1 ? (
            <button
              onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setActiveSection(0)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
            >
              <Play className="w-4 h-4" />
              Recommencer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
