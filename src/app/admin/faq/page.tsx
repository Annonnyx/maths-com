'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Bug, MessageSquare, Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { isAdminSession } from '@/lib/admin-auth';

interface FAQSubmission {
  id: string;
  type: 'bug' | 'question' | 'suggestion';
  title: string;
  description: string;
  email?: string;
  category: string;
  status: 'pending' | 'resolved' | 'closed';
  createdAt: string;
  userAgent?: string;
  ip?: string;
}

const STATUS_COLORS = {
  pending: 'text-yellow-400 bg-yellow-500/20',
  resolved: 'text-green-400 bg-green-500/20',
  closed: 'text-red-400 bg-red-500/20'
};

const TYPE_ICONS = {
  bug: Bug,
  question: HelpCircle,
  suggestion: MessageSquare
};

export default function FAQAdminPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<FAQSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FAQSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FAQSubmission | null>(null);

  // Mock data pour l'instant (à remplacer par vraie API)
  useEffect(() => {
    // Simulation de chargement des données
    const mockSubmissions: FAQSubmission[] = [
      {
        id: 'faq_1234567890_abc123',
        type: 'bug',
        title: 'Question CE2 trop difficile',
        description: 'La question "907 × 5 = ?" apparaît en niveau CE2, mais c\'est beaucoup trop difficile pour ce niveau. Les enfants en CE2 apprennent les tables de multiplication jusqu\'à 10 maximum.',
        email: 'parent@exemple.com',
        category: 'math',
        status: 'pending',
        createdAt: '2024-02-27T22:30:00Z',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        ip: '192.168.1.100'
      },
      {
        id: 'faq_1234567891_def456',
        type: 'question',
        title: 'Comment lier Discord ?',
        description: 'Bonjour, je n\'arrive pas à lier mon compte Discord. Pouvez-vous m\'expliquer comment faire ?',
        email: 'eleve@gmail.com',
        category: 'technical',
        status: 'resolved',
        createdAt: '2024-02-27T20:15:00Z',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip: '203.0.113.45'
      },
      {
        id: 'faq_1234567892_ghi789',
        type: 'suggestion',
        title: 'Ajouter des exercices de géométrie',
        description: 'Ce serait super d\'avoir plus d\'exercices de géométrie interactive, comme dessiner des formes et calculer des aires.',
        category: 'general',
        status: 'pending',
        createdAt: '2024-02-27T18:45:00Z',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ip: '198.51.100.23'
      }
    ];

    setTimeout(() => {
      setSubmissions(mockSubmissions);
      setFilteredSubmissions(mockSubmissions);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrage des soumissions
  useEffect(() => {
    let filtered = submissions;

    if (searchQuery) {
      filtered = filtered.filter(sub =>
        sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(sub => sub.type === typeFilter);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchQuery, statusFilter, typeFilter]);

  const updateSubmissionStatus = (id: string, status: 'pending' | 'resolved' | 'closed') => {
    setSubmissions(prev =>
      prev.map(sub => sub.id === id ? { ...sub, status } : sub)
    );
  };

  // Vérification admin
  if (!isAdminSession(session)) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Accès refusé</h1>
          <p className="text-gray-400 mt-2">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement des signalements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 cursor-pointer">
              <HelpCircle className="w-5 h-5" />
              <span>Retour Admin</span>
            </div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-400" />
              Signalements FAQ ({filteredSubmissions.length})
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des signalements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtres */}
            <div className="bg-[#12121a] rounded-2xl border border-border p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground placeholder-gray-400"
                  />
                </div>

                {/* Filtre statut */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground"
                >
                  <option value="all">Tous statuts</option>
                  <option value="pending">En attente</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Fermé</option>
                </select>

                {/* Filtre type */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground"
                >
                  <option value="all">Tous types</option>
                  <option value="bug">Bug</option>
                  <option value="question">Question</option>
                  <option value="suggestion">Suggestion</option>
                </select>
              </div>
            </div>

            {/* Liste */}
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => {
                const TypeIcon = TYPE_ICONS[submission.type];
                return (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#12121a] rounded-xl border border-border p-6 hover:border-indigo-500/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          submission.type === 'bug' ? 'bg-red-500/20' :
                          submission.type === 'question' ? 'bg-blue-500/20' : 'bg-green-500/20'
                        }`}>
                          <TypeIcon className="w-5 h-5 text-current" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{submission.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span>{submission.category}</span>
                            <span>{new Date(submission.createdAt).toLocaleDateString('fr-FR')}</span>
                            {submission.email && <span>{submission.email}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[submission.status]}`}>
                          {submission.status === 'pending' ? 'En attente' :
                           submission.status === 'resolved' ? 'Résolu' : 'Fermé'}
                        </span>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-gray-400 line-clamp-2">{submission.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Détails du signalement sélectionné */}
          <div className="lg:col-span-1">
            {selectedSubmission ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#12121a] rounded-2xl border border-border p-6 sticky top-24"
              >
                <h2 className="text-xl font-semibold mb-4">Détails du signalement</h2>

                <div className="space-y-4">
                  {/* Type et statut */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {React.createElement(TYPE_ICONS[selectedSubmission.type], {
                        className: "w-5 h-5 text-current"
                      })}
                      <span className="capitalize">{selectedSubmission.type}</span>
                    </div>
                    <select
                      value={selectedSubmission.status}
                      onChange={(e) => updateSubmissionStatus(selectedSubmission.id, e.target.value as any)}
                      className="px-3 py-1 bg-[#2a2a3a] border border-border rounded text-sm"
                    >
                      <option value="pending">En attente</option>
                      <option value="resolved">Résolu</option>
                      <option value="closed">Fermé</option>
                    </select>
                  </div>

                  {/* Informations */}
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {selectedSubmission.id}</div>
                    <div><strong>Catégorie:</strong> {selectedSubmission.category}</div>
                    <div><strong>Email:</strong> {selectedSubmission.email || 'Non fourni'}</div>
                    <div><strong>Date:</strong> {new Date(selectedSubmission.createdAt).toLocaleString('fr-FR')}</div>
                    {selectedSubmission.userAgent && (
                      <div><strong>Navigateur:</strong> {selectedSubmission.userAgent.split(' ')[0]}</div>
                    )}
                  </div>

                  {/* Description complète */}
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{selectedSubmission.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <button
                      onClick={() => updateSubmissionStatus(selectedSubmission.id, 'resolved')}
                      className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Résoudre
                    </button>
                    <button
                      onClick={() => updateSubmissionStatus(selectedSubmission.id, 'closed')}
                      className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Fermer
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#12121a] rounded-2xl border border-border p-6 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Sélectionnez un signalement pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
