'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Trophy, 
  Mail, 
  MessageCircle, 
  Instagram, 
  GraduationCap,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import TeacherRequestModal from '@/components/TeacherRequestModal';

export default function ContactPage() {
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, send to API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-gray-800 bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 w-fit">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Retour</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-400">
            Une question ? Une suggestion ? Nous sommes là pour vous aider.
          </p>
        </motion.div>

        {/* Teacher Button - Featured */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Je suis enseignant</h2>
                <p className="text-gray-300 mb-4">
                  Vous souhaitez utiliser Maths-App avec vos élèves ? Demandez un compte enseignant 
                  pour débloquer toutes les classes, créer des groupes et suivre la progression de vos élèves.
                </p>
                <button
                  onClick={() => setShowTeacherModal(true)}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <GraduationCap className="w-5 h-5" />
                  Demander un compte enseignant
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#12121a] rounded-2xl border border-gray-800 p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" />
              Envoyer un message
            </h2>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-lg font-semibold">Message envoyé !</p>
                <p className="text-gray-400">Nous vous répondrons rapidement.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nom</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full p-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full p-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Sujet</label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full p-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="">Choisir un sujet</option>
                    <option value="question">Question générale</option>
                    <option value="bug">Signaler un bug</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message</label>
                  <textarea
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full p-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none resize-none"
                    rows={4}
                    placeholder="Votre message..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </form>
            )}
          </motion.div>

          {/* Other Contact Methods */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold mb-6">Autres moyens de contact</h2>

            <a 
              href="mailto:contact@maths-app.com"
              className="flex items-center gap-4 p-4 bg-[#12121a] border border-gray-800 rounded-xl hover:border-blue-500/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm text-gray-400">contact@maths-app.com</p>
              </div>
            </a>

            <a 
              href="https://instagram.com/maths_app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-[#12121a] border border-gray-800 rounded-xl hover:border-pink-500/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <Instagram className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <p className="font-semibold">Instagram</p>
                <p className="text-sm text-gray-400">@maths_app</p>
              </div>
            </a>

            <a 
              href="https://discord.gg/maths-app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-[#12121a] border border-gray-800 rounded-xl hover:border-cyan-500/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="font-semibold">Discord</p>
                <p className="text-sm text-gray-400">Rejoignez notre communauté</p>
              </div>
            </a>

            {/* FAQ Link */}
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-400">Besoin d'aide rapidement ?</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Consultez notre{' '}
                    <Link href="/faq" className="text-indigo-400 hover:underline">
                      FAQ
                    </Link>{' '}
                    pour trouver des réponses aux questions les plus courantes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Teacher Modal */}
      <TeacherRequestModal 
        isOpen={showTeacherModal} 
        onClose={() => setShowTeacherModal(false)} 
      />
    </div>
  );
}
