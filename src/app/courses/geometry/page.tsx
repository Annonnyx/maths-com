'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Info, ArrowLeft } from 'lucide-react';
import GeometryCanvas from '@/components/GeometryCanvas';
import Link from 'next/link';

export default function GeometryCoursePage() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'help'>('canvas');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Ruler className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Laboratoire de Géométrie</h1>
                <p className="text-sm text-muted-foreground">Dessine, explore et trace des fonctions</p>
              </div>
            </div>

            <Link href="/courses" className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'canvas'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
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
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Info className="w-5 h-5" />
              Guide d'utilisation
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {activeTab === 'canvas' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={<div className="h-[600px] bg-muted rounded-lg animate-pulse flex items-center justify-center"><span className="text-muted-foreground">Chargement...</span></div>}>
              <div className="rounded-lg border border-border overflow-hidden">
                <GeometryCanvas
                  width={1200}
                  height={600}
                  showGrid={true}
                  showAxes={true}
                />
              </div>
            </Suspense>
          </motion.div>
        )}

        {activeTab === 'help' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl"
          >
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <h2 className="text-2xl font-semibold">Guide d'utilisation</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-indigo-400 mb-2">Points</h3>
                  <p className="text-sm text-muted-foreground">Sélectionnez l'outil Point et cliquez sur le canvas. Déplacez les points en les glissant.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">Segments & Droites</h3>
                  <p className="text-sm text-muted-foreground">Sélectionnez Segment ou Droite, puis cliquez sur 2 points pour les relier.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-400 mb-2">Cercles & Triangles</h3>
                  <p className="text-sm text-muted-foreground">Cercle: centre puis rayon. Triangle: 3 points. Saisissez les points pour créer.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-green-400 mb-2">Tracer des Fonctions</h3>
                  <p className="text-sm text-muted-foreground">Activez le bouton Fonctions et entrez: 2*x+1, x^2, sin(x), sqrt(x), abs(x)...</p>
                </div>

                <div>
                  <h3 className="font-semibold text-yellow-400 mb-2">Zoom & Déplacement</h3>
                  <p className="text-sm text-muted-foreground">Molette souris pour zoomer. Shift+Clic pour déplacer. Reset pour revenir à l'origine.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-cyan-400 mb-2">Outils spéciaux</h3>
                  <p className="text-sm text-muted-foreground">Symétrie, Pythagore, Vecteurs, Mesures. Chaque outil a des instructions affichées.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
