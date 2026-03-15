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
  Share2,
  Plus,
  FolderOpen
} from 'lucide-react';
import GeometryCanvas from '@/components/geometry/GeometryCanvas';
import TrigonometryTool from '@/components/geometry/TrigonometryTool';
import FunctionPlotter from '@/components/geometry/FunctionPlotter';
import TemplateGallery from '@/components/geometry/TemplateGallery';
import HistoryPanel from '@/components/geometry/HistoryPanel';
import Link from 'next/link';

export default function GeometryCoursePage() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'trig' | 'functions' | 'help'>('canvas');
  const [savedDrawings, setSavedDrawings] = useState<{name: string; date: string; data: any}[]>([]);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const tabs = [
    { id: 'canvas', label: 'Géométrie Libre', icon: Ruler },
    { id: 'trig', label: 'Trigonométrie', icon: Triangle },
    { id: 'functions', label: 'Fonctions', icon: FunctionSquare },
    { id: 'help', label: 'Aide', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gradient-to-r from-[#12121a] to-[#1a1a2e] backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Ruler className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Laboratoire de Mathématiques</h1>
                <p className="text-sm text-gray-400">Crée des figures géométriques, trace des fonctions et explore les mathématiques de manière interactive</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium" title="Sauvegarder">
                <Save className="w-4 h-4 text-indigo-400" />
                Sauvegarder
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium" title="Exporter">
                <Download className="w-4 h-4 text-green-400" />
                Exporter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-sm font-medium" title="Partager">
                <Share2 className="w-4 h-4" />
                Partager
              </button>
              <Link href="/courses" className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium">
                Retour aux cours
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-[#0f0f15]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 rounded-t-lg mt-2 ${
                  activeTab === tab.id 
                    ? 'border-indigo-500 text-indigo-400 bg-[#12121a]' 
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-400' : 'text-gray-500'}`} />
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
                    <li>• Utilisez les templates pour démarrer rapidement</li>
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
                    <li>• Fonctions trigonométriques en temps réel</li>
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
                  <Plus className="w-3 h-3 inline mr-1" />
                  Nouveau dessin
                </button>
              </div>
              
              {/* Templates */}
              <div className="bg-[#12121a] rounded-xl border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Templates rapides</h3>
                  <button
                    onClick={() => setShowTemplateGallery(!showTemplateGallery)}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                </div>
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
                  <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm transition-colors">
                    ➡️ Vecteur avec coordonnées
                  </button>
                  <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm transition-colors">
                    🔄 Symétrie axiale
                  </button>
                  <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm transition-colors">
                    📐 Théorème de Pythagore
                  </button>
                </div>
              </div>
              
              {/* History */}
              <HistoryPanel history={history} />
            </div>
          </div>
        )}
        
        {/* Template Gallery Overlay */}
        {showTemplateGallery && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <TemplateGallery
              onTemplateSelect={(template) => {
                console.log('Template selected:', template);
                setShowTemplateGallery(false);
              }}
              onClose={() => setShowTemplateGallery(false)}
            />
          </div>
        )}
        
        {activeTab === 'trig' && (
          <TrigonometryTool width={800} height={600} showGrid={true} showAxes={true} />
        )}
        
        {activeTab === 'functions' && (
          <div className="space-y-6">
            <FunctionPlotter 
              width={800} 
              height={500} 
              showGrid={true} 
              showAxes={true}
              showVariationTable={true}
            />
            
            {/* Function Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#12121a] rounded-xl p-4 border border-gray-800">
                <h4 className="font-semibold text-indigo-400 mb-2">Fonction affine</h4>
                <p className="text-sm text-gray-400 mb-3">f(x) = 2x + 1</p>
                <div className="bg-gray-800 rounded-lg p-3">
                  <FunctionPlotter 
                    width={300} 
                    height={200} 
                    initialFunctions={[{
                      id: 'linear_example',
                      name: 'f',
                      expression: '2*x + 1',
                      color: '#3b82f6',
                      visible: true
                    }]}
                    readOnly={true}
                  />
                </div>
              </div>
              
              <div className="bg-[#12121a] rounded-xl p-4 border border-gray-800">
                <h4 className="font-semibold text-green-400 mb-2">Parabole</h4>
                <p className="text-sm text-gray-400 mb-3">f(x) = x² - 4x + 3</p>
                <div className="bg-gray-800 rounded-lg p-3">
                  <FunctionPlotter 
                    width={300} 
                    height={200} 
                    initialFunctions={[{
                      id: 'quadratic_example',
                      name: 'f',
                      expression: 'x^2 - 4*x + 3',
                      color: '#10b981',
                      visible: true
                    }]}
                    readOnly={true}
                  />
                </div>
              </div>
              
              <div className="bg-[#12121a] rounded-xl p-4 border border-gray-800">
                <h4 className="font-semibold text-cyan-400 mb-2">Sinus</h4>
                <p className="text-sm text-gray-400 mb-3">f(x) = 2sin(x)</p>
                <div className="bg-gray-800 rounded-lg p-3">
                  <FunctionPlotter 
                    width={300} 
                    height={200} 
                    initialFunctions={[{
                      id: 'sine_example',
                      name: 'f',
                      expression: '2*sin(x)',
                      color: '#06b6d4',
                      visible: true
                    }]}
                    readOnly={true}
                  />
                </div>
              </div>
              
              <div className="bg-[#12121a] rounded-xl p-4 border border-gray-800">
                <h4 className="font-semibold text-yellow-400 mb-2">Exponentielle</h4>
                <p className="text-sm text-gray-400 mb-3">f(x) = e^x</p>
                <div className="bg-gray-800 rounded-lg p-3">
                  <FunctionPlotter 
                    width={300} 
                    height={200} 
                    initialFunctions={[{
                      id: 'exp_example',
                      name: 'f',
                      expression: 'exp(x)',
                      color: '#f59e0b',
                      visible: true
                    }]}
                    readOnly={true}
                  />
                </div>
              </div>
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
                  <li>Créer des vecteurs avec coordonnées</li>
                  <li>Appliquer des symétries axiales</li>
                  <li>Visualiser le théorème de Pythagore</li>
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
                <div className="flex justify-between p-2 bg-gray-800 rounded">
                  <span>F</span>
                  <span className="text-gray-400">Plein écran</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-800 rounded">
                  <span>G</span>
                  <span className="text-gray-400">Grille on/off</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
