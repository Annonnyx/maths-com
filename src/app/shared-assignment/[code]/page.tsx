'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, Clock, Target, AlertCircle, 
  CheckCircle, Users, School
} from 'lucide-react';

interface SharedAssignment {
  id: string;
  title: string;
  description: string | null;
  questionCount: number;
  difficulty: string;
  timeLimit: number | null;
  negativePoints: boolean;
  dueDate: string | null;
  shareCode: string;
  class: {
    id: string;
    name: string;
    teacher: {
      id: string;
      displayName: string | null;
      username: string;
    };
  };
  questions: {
    id: string;
    question: string;
    questionType: string;
    options: string[] | null;
    difficulty: number;
    points: number;
    order: number;
  }[];
}

export default function SharedAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<SharedAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadAssignment();
  }, [params.code]);

  const loadAssignment = async () => {
    try {
      const response = await fetch(`/api/assignments/share?code=${params.code}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du chargement du devoir');
      }
      const data = await response.json();
      setAssignment(data.assignment);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startAssignment = async () => {
    if (!studentName.trim()) {
      alert('Veuillez entrer votre nom pour commencer');
      return;
    }

    setStarting(true);
    try {
      // Créer une soumission anonyme
      const response = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment?.id,
          studentName: studentName.trim(),
          shareCode: params.code,
          answers: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Rediriger vers la page de passage du devoir
        router.push(`/take-assignment/${data.submissionId}`);
      } else {
        alert('Erreur lors du démarrage du devoir');
      }
    } catch (error) {
      console.error('Error starting assignment:', error);
      alert('Erreur réseau');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
        <div className="bg-[#1a1a2e] rounded-lg border border-[#3a3a4a] p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-xl font-bold text-white mb-2">Devoir non trouvé</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Assignment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] overflow-hidden"
        >
          {/* Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-white" />
              <span className="text-white/80 text-sm">Devoir partagé</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{assignment.title}</h1>
            {assignment.description && (
              <p className="text-white/80 mt-2">{assignment.description}</p>
            )}
          </div>

          {/* Info */}
          <div className="p-6">
            {/* Teacher & Class Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-[#2a2a3a] rounded-lg">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <School className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">{assignment.class.name}</p>
                <p className="text-gray-400 text-sm">
                  Professeur: {assignment.class.teacher.displayName || assignment.class.teacher.username}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-[#2a2a3a] rounded-lg text-center">
                <Target className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <p className="text-xl font-bold text-white">{assignment.questionCount}</p>
                <p className="text-gray-400 text-xs">Questions</p>
              </div>
              <div className="p-4 bg-[#2a2a3a] rounded-lg text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                <p className="text-xl font-bold text-white">
                  {assignment.timeLimit ? `${assignment.timeLimit} min` : '∞'}
                </p>
                <p className="text-gray-400 text-xs">Durée</p>
              </div>
              <div className="p-4 bg-[#2a2a3a] rounded-lg text-center">
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <p className="text-xl font-bold text-white capitalize">{assignment.difficulty}</p>
                <p className="text-gray-400 text-xs">Difficulté</p>
              </div>
              <div className="p-4 bg-[#2a2a3a] rounded-lg text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                <p className="text-xl font-bold text-white">
                  {assignment.negativePoints ? 'Oui' : 'Non'}
                </p>
                <p className="text-gray-400 text-xs">Points négatifs</p>
              </div>
            </div>

            {/* Due Date */}
            {assignment.dueDate && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>Date limite:</strong> {new Date(assignment.dueDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {/* Start Form */}
            <div className="border-t border-[#3a3a4a] pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Commencer le devoir</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Votre nom (pour le suivi des résultats)
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Entrez votre nom complet"
                    className="w-full px-4 py-3 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={startAssignment}
                  disabled={starting || !studentName.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
                >
                  {starting ? 'Chargement...' : 'Commencer le devoir'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  En commençant, vous acceptez que vos réponses soient enregistrées et visibles par le professeur.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
