'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Info, ArrowLeft } from 'lucide-react';
import GeometryCanvas from '@/components/GeometryCanvas';
import Link from 'next/link';

export default function GeometryCoursePage() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'help'>('canvas');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gradient-to-r from-[#12121a] to-[#1a1a2e] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Ruler className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Laboratoire de Géométrie</h1>
                <p className="text-sm text-gray-400">Dessine, explore et trace des fonctions</p>
              </div>
            </div>
            
            <Link href="/courses" className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-[#0f0f15]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'canvas' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Ruler className="w-5 h-5" />
              Géométrie & Fonctions
            </button>
            
            <button
              onClick={() => setActiveTab('help')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'help' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Info className="w-5 h-5" />
              Guide d'utilisation
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'canvas' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2">✨ Toolkit Complet</h2>
              <p className="text-gray-300 text-sm">Points, lignes, cercles, triangles, mesures, et tracez des fonctions mathématiques en temps réel. Utilisez le zoom (molette), déplacez (Shift+Clic) et tracez avec précision.</p>
            </div>
            
            <Suspense fallback={<div className="h-96 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center"><span className="text-gray-400">Chargement...</span></div>}>
              <GeometryCanvas 
                width={1200} 
                height={600} 
                showGrid={true} 
                showAxes={true}
              />
            </Suspense>
          </motion.div>
        )}

        {activeTab === 'help' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 max-w-3xl"
          >
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Guide d'utilisation</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-indigo-400 mb-2">🔵 Points</h3>
                  <p className="text-sm text-gray-300">Sélectionnez l'outil Point et cliquez sur le canvas. Déplacez les points en les glissant.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">📏 Segments & Droites</h3>
                  <p className="text-sm text-gray-300">Sélectionnez Segment ou Droite, puis cliquez sur 2 points pour les relier.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-2">⭕ Cercles & Triangles</h3>
                  <p className="text-sm text-gray-300">Cercle: centre puis rayon. Triangle: 3 points. Saisissez les points pour créer.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-green-400 mb-2">📊 Tracer des Fonctions</h3>
                  <p className="text-sm text-gray-300">Activez le bouton Fonctions et entrez: 2*x+1, x^2, sin(x), sqrt(x), abs(x)...</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-2">🔍 Zoom & Déplacement</h3>
                  <p className="text-sm text-gray-300">Molette souris pour zoomer. Shift+Clic pour déplacer. Reset pour revenir à l'origine.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-2">🛠️ Outils spéciaux</h3>
                  <p className="text-sm text-gray-300">Symétrie, Pythagore, Vecteurs, Mesures. Chaque outil a des instructions affichées.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
