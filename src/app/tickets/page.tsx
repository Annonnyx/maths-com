'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Plus, MessageSquare, AlertCircle, CheckCircle, Clock, 
  Bug, HelpCircle, FileText, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface Ticket {
  id: string;
  title: string;
  category: 'bug' | 'question' | 'autre';
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'ouvert' | 'en_cours' | 'résolu';
  discord_channel_id?: string;
  created_at: string;
  updated_at: string;
}

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    category: 'question' as 'bug' | 'question' | 'autre',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    if (session) {
      fetchTickets();
    }
  }, [session]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          category: 'question',
          title: '',
          description: '',
          priority: 'medium'
        });
        setShowNewTicketForm(false);
        
        // Refresh tickets list
        await fetchTickets();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création du ticket');
      }
    } catch (error) {
      alert('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ouvert: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      en_cours: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      résolu: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    
    const labels = {
      ouvert: 'Ouvert',
      en_cours: 'En cours',
      résolu: 'Résolu'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    const labels = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      bug: Bug,
      question: HelpCircle,
      autre: FileText
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour accéder aux tickets</h1>
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
            <MessageSquare className="w-6 h-6" />
            <span className="font-bold">maths-app.com</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewTicketForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau ticket
            </button>
            <div className="text-right">
              <div className="text-sm font-semibold">{session.user?.username}</div>
              <div className="text-xs text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* New Ticket Form Modal */}
        {showNewTicketForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewTicketForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Nouveau ticket de support
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="bug">🐛 Bug</option>
                    <option value="question">❓ Question</option>
                    <option value="autre">📄 Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sujet</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Décrivez brièvement votre problème..."
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:border-primary focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez votre problème en détail..."
                    rows={4}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:border-primary focus:outline-none transition-all resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priorité</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="low">🟢 Basse</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🔴 Haute</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketForm(false)}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-card border border-border rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Création...
                      </div>
                    ) : (
                      'Créer le ticket'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Tickets List */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Mes tickets de support</h1>
          <p className="text-muted-foreground">
            Suivez l'état de vos demandes et communiquez avec l'équipe de support.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de vos tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Aucun ticket</h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore créé de ticket de support.
            </p>
            <button
              onClick={() => setShowNewTicketForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer votre premier ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const Icon = getCategoryIcon(ticket.category);
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{ticket.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        {ticket.discord_channel_id && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            Channel Discord
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground mt-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
