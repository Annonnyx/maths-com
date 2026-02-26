'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Ruler, 
  Calculator, 
  Grid3X3, 
  BookOpen,
  ChevronRight,
  Info,
  FunctionSquare,
  Triangle,
  Circle,
  Save,
  Download,
  Share2
} from 'lucide-react';
import GeometryCanvas from '@/components/GeometryCanvas';
import TrigonometryCourse from '@/components/TrigonometryCourse';

export default function GeometryDashboardPage() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'trig' | 'functions' | 'help'>('canvas');
  const [savedDrawings, setSavedDrawings] = useState<{name: string; date: string}[]>([]);

  const tabs = [
    { id: 'canvas', label: 'Géométrie Libre', icon: Ruler },
    { id: 'trig', label: 'Trigonométrie', icon: Triangle },
    { id: 'functions', label: 'Fonctions', icon: FunctionSquare },
    { id: 'help', label: 'Aide', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Ruler className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Atelier de Géométrie</h1>
                <p className="text-sm text-gray-400">Explore, dessine et apprends les mathématiques visuelles</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors" title="Sauvegarder">
                <Save className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors" title="Exporter">
                <Download className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors" title="Partager">
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                  activeTab === tab.id 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'canvas' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Canvas */}
            <div className="lg:col-span-2 space-y-6">
              <GeometryCanvas width={800} height={500} showGrid={true} showAxes={true} />
              
              {/* Quick Tips */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#12121a] rounded-xl p-4 border border-gray-800">
                  <h3 className="font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    Astuces de construction
                  </h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Cliquez sur l'outil Point puis sur le canvas</li>
                    <li>• Les points s'aimantent à la grille</li>
                    <li>• Glissez-déposez pour déplacer</li>
                    <li>• Clic droit sur un point pour le nommer</li>
                  </ul>
                </div>
                
                <div className="bg-[#12121a] rounded-xl p-4 border border-gray-800">
                  <h3 className="font-semibold text-pink-400 mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Calculs automatiques
                  </h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Distances affichées sur les segments</li>
                    <li>• Aires des polygones calculées</li>
                    <li>• Rayons des cercles visibles</li>
                    <li>• Coordonnées des points affichées</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Saved Drawings */}
              <div className="bg-[#12121a] rounded-xl border border-gray-800 p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Dessins sauvegardés
                </h3>
                {savedDrawings.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Aucun dessin sauvegardé</p>
                ) : (
                  <div className="space-y-2">
                    {savedDrawings.map((drawing, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                        <span className="text-sm">{drawing.name}</span>
                        <span className="text-xs text-gray-500">{drawing.date}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="w-full mt-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg transition-colors text-sm">
                  + Nouveau dessin
                </button>
              </div>
              
              {/* Templates */}
              <div className="bg-[#12121a] rounded-xl border border-gray-800 p-4">
                <h3 className="font-semibold mb-4">Templates rapides</h3>
                <div className="space-y-2">
                  <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm transition-colors">
                    📐 Triangle rectangle avec mesures
                  </button>
                  <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm transition-colors">
                    ⭕ Cercle trigonométrique
                  </button>
                  <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm transition-colors">
                    📊 Repère orthonormé
                  </button>
                  <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm transition-colors">
                    🔷 Parallélogramme
                  </button>
                </div>
              </div>
              
              {/* History */}
              <div className="bg-[#12121a] rounded-xl border border-gray-800 p-4">
                <h3 className="font-semibold mb-4">Historique</h3>
                <div className="text-sm text-gray-500">
                  <p>• Point A créé (2,3)</p>
                  <p>• Point B créé (5,7)</p>
                  <p>• Segment AB créé</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'trig' && (
          <TrigonometryCourse />
        )}
        
        {activeTab === 'functions' && (
          <div className="bg-[#12121a] rounded-2xl border border-gray-800 p-8">
            <div className="text-center py-12">
              <FunctionSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Étude de fonctions</h2>
              <p className="text-gray-400 mb-6">Visualisez les fonctions mathématiques et leurs variations</p>
              <p className="text-sm text-gray-500">🚧 Cette section est en cours de développement</p>
            </div>
          </div>
        )}
        
        {activeTab === 'help' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#12121a] rounded-xl border border-gray-800 p-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-400">Comment utiliser l'atelier</h3>
              <div className="space-y-4 text-gray-300">
                <p>L'atelier de géométrie vous permet de :</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Dessiner des figures géométriques précises</li>
                  <li>Visualiser la trigonométrie interactivement</li>
                  <li>Étudier les fonctions mathématiques</li>
                  <li>Sauvegarder et partager vos constructions</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-[#12121a] rounded-xl border border-gray-800 p-6">
              <h3 className="text-xl font-semibold mb-4 text-pink-400">Raccourcis clavier</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-800 rounded">
                  <span>Ctrl + Z</span>
                  <span className="text-gray-400">Annuler</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-800 rounded">
                  <span>Ctrl + S</span>
                  <span className="text-gray-400">Sauvegarder</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-800 rounded">
                  <span>Espace</span>
                  <span className="text-gray-400">Sélectionner</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-800 rounded">
                  <span>Suppr</span>
                  <span className="text-gray-400">Supprimer la sélection</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
