'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, MessageSquare, AlertTriangle, Bug, HelpCircle, CheckCircle, 
  Clock, User, Filter, Search, Eye, EyeOff, Trash2, Check, X
} from 'lucide-react';

interface Report {
  id: string;
  type: 'question' | 'bug' | 'suggestion';
  title: string;
  description: string;
  email: string | null;
  category: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  createdAt: string;
  userAgent: string | null;
  ip: string | null;
}

const typeColors = {
  question: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  bug: 'bg-red-500/20 text-red-400 border-red-500/30',
  suggestion: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  reviewed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeIcons = {
  question: HelpCircle,
  bug: Bug,
  suggestion: AlertTriangle,
};

export default function ReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, selectedType, selectedStatus, searchQuery]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/faq-submissions');
      if (response.ok) {
        const data = await response.json();
        setReports(data.submissions || []);
      } else {
        console.error('Failed to load reports');
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/faq-submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: reportId, status }),
      });

      if (response.ok) {
        setReports(prev => prev.map(report => 
          report.id === reportId ? { ...report, status: status as any } : report
        ));
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/faq-submissions/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReports(prev => prev.filter(report => report.id !== reportId));
      }
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const IconComponent = typeIcons[type as keyof typeof typeIcons] || MessageSquare;
    return <IconComponent className="w-4 h-4" />;
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Accès réservé</h1>
          <p className="text-gray-400">Vous devez être connecté pour accéder à cette page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-red-400" />
              Signalements & Questions
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-[#12121a] rounded-2xl border border-border"
        >
          <div className="flex flex-wrap gap-4">
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Tous les types</option>
                <option value="question">Questions</option>
                <option value="bug">Bugs</option>
                <option value="suggestion">Suggestions</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="reviewed">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-64">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-gray-400">
              Total: <span className="text-white font-medium">{filteredReports.length}</span>
            </span>
            <span className="text-yellow-400">
              En attente: <span className="font-medium">{filteredReports.filter(r => r.status === 'pending').length}</span>
            </span>
            <span className="text-green-400">
              Résolus: <span className="font-medium">{filteredReports.filter(r => r.status === 'resolved').length}</span>
            </span>
          </div>
        </motion.div>

        {/* Reports List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucun signalement</h3>
            <p className="text-gray-500">
              {searchQuery || selectedType !== 'all' || selectedStatus !== 'all' 
                ? 'Aucun signalement ne correspond à vos filtres' 
                : 'Aucun signalement n\'a été reçu pour le moment'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[#12121a] rounded-2xl border border-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${typeColors[report.type as keyof typeof typeColors]}`}>
                        {getTypeIcon(report.type)}
                        <span className="ml-1">
                          {report.type === 'question' ? 'Question' : 
                           report.type === 'bug' ? 'Bug' : 'Suggestion'}
                        </span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[report.status as keyof typeof statusColors]}`}>
                        {report.status === 'pending' ? 'En attente' :
                         report.status === 'reviewed' ? 'En cours' :
                         report.status === 'resolved' ? 'Résolu' : 'Rejeté'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')} à {new Date(report.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-2">{report.title}</h3>

                    {/* Description */}
                    <div className="text-gray-300 mb-3">
                      {expandedReport === report.id ? (
                        <div>
                          <p className="whitespace-pre-wrap">{report.description}</p>
                          <button
                            onClick={() => setExpandedReport(null)}
                            className="text-red-400 hover:text-red-300 text-sm mt-2 flex items-center gap-1"
                          >
                            <EyeOff className="w-3 h-3" />
                            Masquer
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="line-clamp-2">{report.description}</p>
                          {report.description.length > 200 && (
                            <button
                              onClick={() => setExpandedReport(report.id)}
                              className="text-blue-400 hover:text-blue-300 text-sm mt-1 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Voir plus
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      {report.email && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {report.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {report.category}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateReportStatus(report.id, 'reviewed')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            En cours
                          </button>
                          <button
                            onClick={() => updateReportStatus(report.id, 'resolved')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Résolu
                          </button>
                          <button
                            onClick={() => updateReportStatus(report.id, 'rejected')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Rejeter
                          </button>
                        </>
                      )}
                      {report.status === 'reviewed' && (
                        <>
                          <button
                            onClick={() => updateReportStatus(report.id, 'resolved')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Résolu
                          </button>
                          <button
                            onClick={() => updateReportStatus(report.id, 'rejected')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Rejeter
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
