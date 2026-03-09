'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, CheckCircle, AlertCircle, 
  ChevronLeft, ChevronRight, Flag
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  questionType: string;
  options: string[] | null;
  difficulty: number;
  points: number;
  order: number;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentName: string;
  status: string;
  assignment: {
    title: string;
    description: string | null;
    timeLimit: number | null;
    negativePoints: boolean;
    questions: Question[];
  };
  answers: {
    id: string;
    questionId: string;
    answer: string;
  }[];
}

export default function TakeAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    loadSubmission();
  }, [params.id]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const loadSubmission = async () => {
    try {
      const response = await fetch(`/api/assignments/submit?id=${params.id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du chargement');
      }
      const data = await response.json();
      setSubmission(data.submission);
      
      // Initialize answers from existing answers
      const initialAnswers: Record<string, string> = {};
      data.submission.answers.forEach((a: any) => {
        if (a.answer) initialAnswers[a.questionId] = a.answer;
      });
      setAnswers(initialAnswers);

      // Set timer if time limit exists
      if (data.submission.assignment.timeLimit) {
        const startedAt = new Date(data.submission.startedAt).getTime();
        const now = Date.now();
        const elapsedMinutes = (now - startedAt) / 1000 / 60;
        const remainingMinutes = data.submission.assignment.timeLimit - elapsedMinutes;
        setTimeLeft(Math.max(0, remainingMinutes * 60));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-save to server
    try {
      await fetch('/api/assignments/submit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: params.id,
          answers: [{ questionId, value }]
        })
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Calculate scores for each answer
      const answersWithScores = submission?.assignment.questions.map(q => {
        const answer = answers[q.id] || '';
        let isCorrect = false;
        let points = 0;

        if (q.questionType === 'single') {
          // Simple string comparison for single answer
          isCorrect = answer.toLowerCase().trim() === q.question.toLowerCase().trim();
          points = isCorrect ? q.points : (submission.assignment.negativePoints ? -q.points : 0);
        } else if (q.questionType === 'multiple' && q.options) {
          // For multiple choice, check if answer matches correct options
          // This is simplified - you'd need to store correct answers in the question
          isCorrect = answer.length > 0;
          points = isCorrect ? q.points : 0;
        } else {
          // Free text - requires manual grading
          points = 0;
        }

        return {
          questionId: q.id,
          value: answer,
          isCorrect,
          points: Math.max(0, points)
        };
      }) || [];

      const response = await fetch('/api/assignments/submit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: params.id,
          answers: answersWithScores,
          completed: true
        })
      });

      if (response.ok) {
        router.push(`/assignment-result/${params.id}`);
      } else {
        alert('Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
        <div className="bg-[#1a1a2e] rounded-lg border border-[#3a3a4a] p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-xl font-bold text-white mb-2">Erreur</h1>
          <p className="text-gray-400 mb-6">{error || 'Devoir non trouvé'}</p>
          <button
            onClick={() => router.push('/')}
            className="text-purple-400 hover:text-purple-300"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const questions = submission.assignment.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <header className="bg-[#1a1a2e] border-b border-[#2a2a3a] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-[#2a2a3a] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-white">{submission.assignment.title}</h1>
                <p className="text-sm text-gray-400">Élève: {submission.studentName}</p>
              </div>
            </div>
            
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                timeLeft < 300 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Question {currentQuestionIndex + 1} sur {questions.length}</span>
              <span>{answeredCount} répondues</span>
            </div>
            <div className="h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Question */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6"
        >
          <div className="mb-6">
            <span className="text-xs text-purple-400 font-medium">
              Question {currentQuestionIndex + 1}
            </span>
            <h2 className="text-xl text-white mt-2">{currentQuestion.question}</h2>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <span>Difficulté: {currentQuestion.difficulty}/10</span>
              <span>Points: {currentQuestion.points}</span>
            </div>
          </div>

          {/* Answer Input */}
          <div className="space-y-4">
            {currentQuestion.questionType === 'single' && (
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                placeholder="Votre réponse..."
                className="w-full px-4 py-3 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            )}

            {currentQuestion.questionType === 'multiple' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-[#2a2a3a] rounded-lg cursor-pointer hover:bg-[#3a3a4a] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(answers[currentQuestion.id] || '').split(',').includes(String(idx))}
                      onChange={(e) => {
                        const currentAnswers = (answers[currentQuestion.id] || '').split(',').filter(Boolean);
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, String(idx)]
                          : currentAnswers.filter(a => a !== String(idx));
                        saveAnswer(currentQuestion.id, newAnswers.join(','));
                      }}
                      className="w-4 h-4 rounded border-gray-500"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.questionType === 'free_text' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                placeholder="Votre réponse..."
                rows={4}
                className="w-full px-4 py-3 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            )}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a3a] hover:bg-[#3a3a4a] disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>

          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  idx === currentQuestionIndex
                    ? 'bg-purple-600 text-white'
                    : answers[questions[idx].id]
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-[#2a2a3a] text-gray-400 hover:bg-[#3a3a4a]'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white rounded-lg transition-colors"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-lg transition-all"
            >
              <Flag className="w-4 h-4" />
              {submitting ? 'Envoi...' : 'Terminer'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
