'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calculator, Trophy, BookOpen, Target, Zap, TrendingUp, Users, BarChart3 } from 'lucide-react';
import Footer from '@/components/Footer';
import { HomePageSideAds } from '@/components/ResponsiveSideAd';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <span className="px-4 py-2 bg-[#1e1e2e] rounded-full text-sm text-indigo-400 border border-indigo-500/20">
                Le chess.com des maths 🧮
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Maîtrise le{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                calcul mental
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Entraîne-toi avec un système adaptatif et gamifié. Progresse de F- à S+,
              débloque de nouvelles opérations et deviens un maître des maths.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/test"
                className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all font-semibold text-lg glow-primary flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Test d'évaluation
              </Link>
              <Link
                href="/practice"
                className="px-8 py-4 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-xl transition-all font-semibold text-lg border border-[#2a2a3a] flex items-center justify-center gap-2"
              >
                <Target className="w-5 h-5" />
                Exercices libres
              </Link>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-3 gap-6 mt-24"
          >
            {[
              {
                icon: Trophy,
                title: "Système de classe",
                description: "Progresse de F- à S+ avec un système de ranking inspiré des jeux compétitifs"
              },
              {
                icon: TrendingUp,
                title: "Progression adaptative",
                description: "La difficulté s'ajuste automatiquement à ton niveau pour une progression optimale"
              },
              {
                icon: BookOpen,
                title: "Apprentissage guidé",
                description: "Accède à des cours, méthodes et corrections détaillées pour progresser efficacement"
              },
              {
                icon: Users,
                title: "Multijoueur",
                description: "Affronte des joueurs du monde entier en temps réel"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a] hover:border-indigo-500/30 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-indigo-500/30 group-hover:to-purple-600/30 transition-all">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-24 text-center"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold text-lg glow-primary shadow-xl transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Accéder à ton dashboard</span>
            </Link>
          </motion.div>

          {/* Rank Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-24 text-center"
          >
            <h2 className="text-3xl font-bold mb-12">Système de classement</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['F-', 'F', 'F+', 'E-', 'E', 'E+', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+'].map((rank, index) => {
                const tier = rank.charAt(0);
                const colors: Record<string, string> = {
                  'F': 'text-gray-400 border-gray-400/30 bg-gray-400/10',
                  'E': 'text-green-400 border-green-400/30 bg-green-400/10',
                  'D': 'text-teal-400 border-teal-400/30 bg-teal-400/10',
                  'C': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
                  'B': 'text-purple-400 border-purple-400/30 bg-purple-400/10',
                  'A': 'text-orange-400 border-orange-400/30 bg-orange-400/10',
                  'S': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                };
                return (
                  <motion.div
                    key={rank}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.02 }}
                    className={`px-4 py-2 rounded-lg font-bold border ${colors[tier]}`}
                  >
                    {rank}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Responsive Side Ads - Desktop/Tablet Only */}
      <HomePageSideAds />

      <Footer />
    </div>
  );
}
