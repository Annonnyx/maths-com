'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Instagram, 
  Mail, 
  MessageCircle, 
  Send,
  CheckCircle,
  X,
  ArrowRight,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface TeacherRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const contactOptions = [
  {
    id: 'instagram',
    icon: Instagram,
    label: 'Instagram',
    description: 'Envoyez-nous un DM sur Instagram',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/30',
    action: () => window.open('https://instagram.com/maths_app', '_blank')
  },
  {
    id: 'email',
    icon: Mail,
    label: 'Email',
    description: 'Contactez-nous par email',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    action: () => window.location.href = 'mailto:contact@maths-app.com?subject=Demande compte enseignant'
  },
  {
    id: 'ticket',
    icon: MessageCircle,
    label: 'Ticket In-App',
    description: 'Créez un ticket depuis votre compte',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/30',
    action: null // Will show ticket form
  },
  {
    id: 'discord',
    icon: Send,
    label: 'Discord',
    description: 'Rejoignez notre serveur Discord',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    action: () => window.open('https://discord.gg/maths-app', '_blank')
  }
];

export default function TeacherRequestModal({ isOpen, onClose }: TeacherRequestModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to an API
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#12121a] rounded-2xl border border-gray-800 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Je suis enseignant</h2>
              <p className="text-sm text-gray-400">Demandez un compte professeur</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Demande envoyée !</h3>
              <p className="text-gray-400 mb-6">
                Nous examinerons votre demande et vous répondrons dans les plus brefs délais.
                Un compte professeur débloque toutes les classes et permet de créer des groupes d'élèves.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : selectedOption === 'ticket' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedOption(null)}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                ← Retour
              </button>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nom complet</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none"
                  placeholder="Votre nom"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none"
                  placeholder="votre@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Établissement</label>
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full p-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none"
                  placeholder="Nom de votre école/institution"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Matière enseignée</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none"
                  placeholder="Mathématiques, Physique..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Message (optionnel)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none resize-none"
                  rows={3}
                  placeholder="Présentez-vous rapidement..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer la demande
              </button>
            </form>
          ) : (
            <>
              <p className="text-gray-400 mb-6">
                Les comptes enseignants permettent de : 
              </p>
              <ul className="space-y-2 mb-6 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Accéder à toutes les classes sans restriction
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Créer des groupes de classe avec messagerie
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Suivre la progression des élèves
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Organiser des défis et compétitions
                </li>
              </ul>
              
              <p className="text-sm text-gray-400 mb-4">Choisissez comment nous contacter :</p>
              
              <div className="grid grid-cols-2 gap-3">
                {contactOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (option.action) {
                        option.action();
                      } else {
                        setSelectedOption(option.id);
                      }
                    }}
                    className={`p-4 rounded-xl border ${option.bgColor} hover:scale-[1.02] transition-all text-left`}
                  >
                    <option.icon className={`w-6 h-6 ${option.color} mb-2`} />
                    <p className="font-semibold text-sm">{option.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
