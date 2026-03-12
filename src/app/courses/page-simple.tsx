'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">maths-app.com</span>
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">Cours de Mathématiques</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Cours de Mathématiques</h1>
        <p className="text-gray-400 text-lg mb-8">
          Explore nos cours interactifs par niveau scolaire, du CP à la Terminale
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <h3 className="text-xl font-bold mb-2">CP - Cours Préparatoire</h3>
            <p className="text-sm opacity-75 mb-4">Premiers pas avec les nombres et additions simples</p>
            <div className="text-sm opacity-75">15 min • 5 leçons</div>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <h3 className="text-xl font-bold mb-2">CE1 - Cours Élémentaire 1</h3>
            <p className="text-sm opacity-75 mb-4">Additions, soustractions et logique</p>
            <div className="text-sm opacity-75">20 min • 7 leçons</div>
          </div>
        </div>
      </main>
    </div>
  );
}
