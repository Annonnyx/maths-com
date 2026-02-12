'use client';

import Link from 'next/link';
import { Calculator, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-8xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              404
            </span>
          </div>
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center">
            <Calculator className="w-12 h-12 text-indigo-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-4">Page introuvable</h1>
          <p className="text-gray-400 mb-8">
            Désolé, cette page n'existe pas ou a été déplacée. 
            Retourne à l'accueil pour continuer ton entraînement !
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl font-semibold transition-all"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-xl font-semibold transition-all border border-[#2a2a3a]"
            >
              <ArrowLeft className="w-5 h-5" />
              Page précédente
            </button>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center gap-4 text-4xl"
        >
          <span className="animate-bounce" style={{ animationDelay: '0s' }}>🧮</span>
          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>📊</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🔢</span>
          <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>📐</span>
        </motion.div>
      </div>
    </div>
  );
}
