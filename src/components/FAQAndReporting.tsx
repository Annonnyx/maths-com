'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Bug, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'math';
}

interface ReportForm {
  type: 'bug' | 'question' | 'suggestion';
  title: string;
  description: string;
  email: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Comment créer un compte ?",
    answer: "Cliquez sur 'S'inscrire' en haut à droite et remplissez le formulaire avec votre email et mot de passe.",
    category: 'general'
  },
  {
    question: "Comment voir mes progrès ?",
    answer: "Votre progression est visible sur votre tableau de bord avec votre ELO, votre classe actuelle et vos badges débloqués.",
    category: 'general'
  },
  {
    question: "Les cours sont-ils gratuits ?",
    answer: "Oui ! Tous les cours et exercices sont gratuits. Certaines fonctionnalités premium pourraient être ajoutées plus tard.",
    category: 'general'
  },
  {
    question: "Comment fonctionne le système de niveaux ?",
    answer: "Votre niveau évolue selon vos performances aux exercices. Plus vous réussissez, plus votre ELO augmente et vous débloquez de nouvelles classes.",
    category: 'general'
  },
  {
    question: "Puis-je jouer avec mes amis ?",
    answer: "Oui ! Utilisez la section 'Multijoueur' pour créer ou rejoindre des parties avec d'autres élèves.",
    category: 'general'
  },
  {
    question: "Comment lier mon compte Discord ?",
    answer: "Allez dans Paramètres > Connexions et cliquez sur 'Lier Discord' pour synchroniser vos rôles et badges.",
    category: 'technical'
  },
  {
    question: "L'application fonctionne-t-elle sur mobile ?",
    answer: "Oui, le site est responsive et fonctionne sur tous les appareils : ordinateur, tablette et smartphone.",
    category: 'technical'
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, nous utilisons le chiffrement SSL et ne stockons que les données nécessaires à votre apprentissage.",
    category: 'technical'
  },
  {
    question: "Comment résoudre une équation ?",
    answer: "Pour x + 5 = 12, soustrais 5 des deux côtés : x = 12 - 5 = 7. La même valeur doit être ajoutée/retranchée des deux côtés.",
    category: 'math'
  },
  {
    question: "Comment calculer un pourcentage ?",
    answer: "Pour trouver 25% de 80 : (80 × 25) ÷ 100 = 2000 ÷ 100 = 20. Ou plus simplement : 80 × 0,25 = 20.",
    category: 'math'
  },
  {
    question: "Comment trouver l'aire d'un rectangle ?",
    answer: "Aire = longueur × largeur. Pour un rectangle de 5cm × 3cm : 5 × 3 = 15cm².",
    category: 'math'
  }
];

export default function FAQAndReporting() {
  const [activeTab, setActiveTab] = useState<'faq' | 'report'>('faq');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [reportForm, setReportForm] = useState<ReportForm>({
    type: 'question',
    title: '',
    description: '',
    email: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const filteredFAQs = selectedCategory === 'all'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter(item => item.category === selectedCategory);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/faq/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setReportForm({
          type: 'question',
          title: '',
          description: '',
          email: '',
          category: 'general'
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-6 py-3 rounded-full mb-4"
        >
          <HelpCircle className="w-6 h-6 text-indigo-400" />
          <span className="text-lg font-semibold text-indigo-400">Centre d'Aide</span>
        </motion.div>
        <h2 className="text-3xl font-bold mb-2">Questions Fréquentes & Signalements</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Trouvez des réponses à vos questions ou signalez un problème pour améliorer votre expérience d'apprentissage.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#1a1a2e] p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'faq'
              ? 'bg-indigo-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 inline mr-2" />
          FAQ
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'report'
              ? 'bg-indigo-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Bug className="w-4 h-4 inline mr-2" />
          Signaler
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'faq' ? (
          <motion.div
            key="faq"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'Toutes', icon: HelpCircle },
                { key: 'general', label: 'Général', icon: MessageSquare },
                { key: 'technical', label: 'Technique', icon: Bug },
                { key: 'math', label: 'Mathématiques', icon: HelpCircle }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === key
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#12121a] rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.question ? null : faq.question)}
                    className="w-full p-4 text-left hover:bg-[#1a1a2e] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{faq.question}</span>
                      <div className={`transform transition-transform ${expandedFAQ === faq.question ? 'rotate-180' : ''}`}>
                        ▼
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedFAQ === faq.question && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        <p className="text-gray-400">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="report"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-[#12121a] rounded-2xl border border-border p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bug className="w-5 h-5 text-red-400" />
              Signaler un problème ou poser une question
            </h3>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Type de demande</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'question', label: 'Question', icon: HelpCircle },
                    { value: 'bug', label: 'Bug', icon: Bug },
                    { value: 'suggestion', label: 'Suggestion', icon: MessageSquare }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReportForm(prev => ({ ...prev, type: value as any }))}
                      className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                        reportForm.type === value
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-border hover:border-gray-500 text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Catégorie</label>
                <select
                  value={reportForm.category}
                  onChange={(e) => setReportForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground"
                >
                  <option value="general">Général</option>
                  <option value="math">Mathématiques</option>
                  <option value="technical">Technique</option>
                  <option value="account">Compte</option>
                  <option value="multiplayer">Multijoueur</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Titre</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Résumez votre question ou problème..."
                  className="w-full px-3 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description détaillée</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre problème ou question en détail..."
                  rows={4}
                  className="w-full px-3 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground resize-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email (optionnel)</label>
                <input
                  type="email"
                  value={reportForm.email}
                  onChange={(e) => setReportForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Pour vous contacter si nécessaire..."
                  className="w-full px-3 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </button>

              {/* Status Messages */}
              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Merci ! Votre demande a été envoyée à notre équipe.
                  </motion.div>
                )}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-3 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Erreur lors de l'envoi. Réessayez plus tard.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
