'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Send, 
  MoreVertical, 
  Crown,
  LogOut,
  UserPlus,
  Settings,
  Lock,
  Unlock
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ClassGroup {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  members: ClassMember[];
  messages: Message[];
  isPrivate: boolean;
  createdAt: string;
}

interface ClassMember {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: 'teacher' | 'student';
  joinedAt: string;
}

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  type: 'text' | 'system';
}

interface GroupTestModeProps {
  groupId: string;
  members: ClassMember[];
  onClose: () => void;
}

// Group Test Mode Component (Kahoot-style)
function GroupTestMode({ groupId, members, onClose }: GroupTestModeProps) {
  const [phase, setPhase] = useState<'waiting' | 'question' | 'leaderboard' | 'results'>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions] = useState([
    { question: '2 × 15 = ?', options: ['25', '30', '28', '32'], correct: 1 },
    { question: '7² = ?', options: ['45', '49', '56', '42'], correct: 1 },
    { question: '125 ÷ 5 = ?', options: ['25', '20', '30', '15'], correct: 0 },
    { question: '3 + 7 × 2 = ?', options: ['20', '17', '13', '23'], correct: 1 },
  ]);
  const [scores, setScores] = useState<Record<string, { score: number; answers: number[] }>>(() => {
    const initial: Record<string, { score: number; answers: number[] }> = {};
    members.forEach(m => {
      initial[m.userId] = { score: 0, answers: [] };
    });
    return initial;
  });
  const [timeLeft, setTimeLeft] = useState(10);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (phase === 'question' && timeLeft > 0 && !answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && phase === 'question') {
      handleNextQuestion();
    }
  }, [timeLeft, phase, answered]);

  const handleAnswer = (answerIndex: number) => {
    if (answered) return;
    setAnswered(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    const points = isCorrect ? Math.ceil(timeLeft * 10) : 0;
    
    setScores(prev => ({
      ...prev,
      'current-user': {
        score: prev['current-user'].score + points,
        answers: [...prev['current-user'].answers, answerIndex]
      }
    }));

    // Simulate other players answering
    members.filter(m => m.userId !== 'current-user').forEach((member, idx) => {
      setTimeout(() => {
        const randomAnswer = Math.floor(Math.random() * 4);
        const isMemberCorrect = randomAnswer === questions[currentQuestion].correct;
        const memberPoints = isMemberCorrect ? Math.ceil(Math.random() * 5 + 5) * 10 : 0;
        
        setScores(prev => ({
          ...prev,
          [member.userId]: {
            score: (prev[member.userId]?.score || 0) + memberPoints,
            answers: [...(prev[member.userId]?.answers || []), randomAnswer]
          }
        }));
      }, Math.random() * 3000 + 500);
    });

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setPhase('leaderboard');
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setPhase('question');
          setTimeLeft(10);
          setAnswered(false);
        }, 3000);
      } else {
        setPhase('results');
      }
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setPhase('leaderboard');
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setPhase('question');
        setTimeLeft(10);
        setAnswered(false);
      }, 3000);
    } else {
      setPhase('results');
    }
  };

  const sortedScores = Object.entries(scores)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([userId, data], index) => ({
      userId,
      ...data,
      rank: index + 1,
      member: members.find(m => m.userId === userId)
    }));

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] z-50">
      {/* Header */}
      <div className="bg-[#12121a] border-b border-gray-800 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h2 className="text-xl font-bold">Mode Groupe - Défi Maths</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {phase === 'waiting' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Users className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">En attente des joueurs...</h3>
            <p className="text-gray-400 mb-8">{members.length} joueurs prêts</p>
            <div className="flex justify-center gap-4">
              {members.map((m, i) => (
                <div key={m.userId} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mb-2">
                    {m.displayName?.[0] || m.username[0]}
                  </div>
                  <p className="text-sm">{m.displayName || m.username}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPhase('question')}
              className="mt-8 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold text-lg transition-colors"
            >
              Commencer le défi !
            </button>
          </div>
        )}

        {phase === 'question' && (
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Question {currentQuestion + 1} / {questions.length}</span>
                <span className={timeLeft <= 3 ? 'text-red-400 font-bold' : ''}>⏱ {timeLeft}s</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${timeLeft <= 3 ? 'bg-red-500' : 'bg-indigo-500'}`}
                  style={{ width: `${(timeLeft / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="bg-[#12121a] rounded-2xl border border-gray-800 p-8 mb-6">
              <h3 className="text-3xl font-bold text-center mb-8">{questions[currentQuestion].question}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {questions[currentQuestion].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={`p-6 rounded-xl font-bold text-xl transition-all ${
                      answered 
                        ? i === questions[currentQuestion].correct 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-800 text-gray-400'
                        : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Live scores mini */}
            <div className="bg-[#12121a] rounded-xl border border-gray-800 p-4">
              <p className="text-sm text-gray-400 mb-3">Classement en direct</p>
              <div className="flex gap-4 overflow-x-auto">
                {sortedScores.slice(0, 3).map((score) => (
                  <div key={score.userId} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-yellow-400 font-bold">#{score.rank}</span>
                    <span className="text-sm truncate max-w-[100px]">{score.member?.displayName || score.member?.username}</span>
                    <span className="text-indigo-400 font-bold">{score.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === 'leaderboard' && (
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Classement</h3>
            <div className="space-y-3">
              {sortedScores.map((score, i) => (
                <motion.div
                  key={score.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    i === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                    i === 1 ? 'bg-gray-700/50' :
                    i === 2 ? 'bg-orange-900/20' :
                    'bg-gray-800'
                  }`}
                >
                  <span className={`text-2xl font-bold w-8 ${
                    i === 0 ? 'text-yellow-400' :
                    i === 1 ? 'text-gray-300' :
                    i === 2 ? 'text-orange-400' :
                    'text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{score.member?.displayName || score.member?.username}</p>
                    <p className="text-sm text-gray-400">{score.score} points</p>
                  </div>
                  {i === 0 && <Crown className="w-6 h-6 text-yellow-400" />}
                </motion.div>
              ))}
            </div>
            <p className="text-center text-gray-400 mt-6">Prochaine question dans 3 secondes...</p>
          </div>
        )}

        {phase === 'results' && (
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-3xl font-bold mb-8">🏆 Résultats finaux</h3>
            
            {/* Podium */}
            <div className="flex justify-center items-end gap-4 mb-8">
              {sortedScores.slice(0, 3).map((score, i) => (
                <div key={score.userId} className="text-center">
                  <div className={`w-20 rounded-t-xl flex items-center justify-center font-bold text-2xl ${
                    i === 0 ? 'h-32 bg-yellow-500 text-yellow-900' :
                    i === 1 ? 'h-24 bg-gray-400 text-gray-900' :
                    'h-16 bg-orange-600 text-orange-100'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="bg-[#12121a] p-3 rounded-b-xl border border-gray-800">
                    <p className="font-semibold text-sm truncate max-w-[100px]">
                      {score.member?.displayName || score.member?.username}
                    </p>
                    <p className="text-indigo-400 font-bold">{score.score} pts</p>
                  </div>
                </div>
              ))}
            </div>

            {/* All scores */}
            <div className="bg-[#12121a] rounded-xl border border-gray-800 p-4 mb-6">
              <h4 className="font-semibold mb-4">Tous les joueurs</h4>
              <div className="space-y-2">
                {sortedScores.map((score) => (
                  <div key={score.userId} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-6">{score.rank}</span>
                      <span>{score.member?.displayName || score.member?.username}</span>
                    </div>
                    <span className="font-bold text-indigo-400">{score.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-colors"
            >
              Retour au groupe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main ClassGroup Component
interface ClassGroupProps {
  groupId?: string;
}

export default function ClassGroup({ groupId }: ClassGroupProps) {
  const { data: session } = useSession();
  const [group, setGroup] = useState<ClassGroup | null>(null);
  const [message, setMessage] = useState('');
  const [showTestMode, setShowTestMode] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // Mock data - replace with API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGroup({
        id: '1',
        name: 'Classe de Mme Martin - 4ème A',
        teacherId: 'teacher1',
        teacherName: 'Marie Martin',
        isPrivate: false,
        createdAt: '2024-02-01',
        members: [
          { id: '1', userId: 'teacher1', username: 'mme_martin', displayName: 'Mme Martin', role: 'teacher', joinedAt: '2024-02-01' },
          { id: '2', userId: 'student1', username: 'alice_m', displayName: 'Alice', role: 'student', joinedAt: '2024-02-02' },
          { id: '3', userId: 'student2', username: 'bob_d', displayName: 'Bob', role: 'student', joinedAt: '2024-02-02' },
          { id: '4', userId: 'student3', username: 'charlie_l', displayName: 'Charlie', role: 'student', joinedAt: '2024-02-03' },
        ],
        messages: [
          { id: '1', userId: 'teacher1', username: 'Mme Martin', content: 'Bienvenue dans le groupe ! N\'hésitez pas à poser vos questions.', createdAt: '2024-02-01T10:00:00', type: 'system' },
          { id: '2', userId: 'student1', username: 'Alice', content: 'Merci ! Quand est le prochain défi ?', createdAt: '2024-02-01T10:05:00', type: 'text' },
          { id: '3', userId: 'teacher1', username: 'Mme Martin', content: 'Ce vendredi à 14h ! Soyez prêts 😉', createdAt: '2024-02-01T10:10:00', type: 'text' },
        ]
      });
      setIsMember(true);
    }, 500);
  }, [groupId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !group) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      userId: session?.user?.id || 'current-user',
      username: session?.user?.displayName || session?.user?.username || 'Vous',
      content: message,
      createdAt: new Date().toISOString(),
      type: 'text'
    };
    
    setGroup({
      ...group,
      messages: [...group.messages, newMessage]
    });
    setMessage('');
  };

  const handleJoinGroup = () => {
    setIsMember(true);
    // API call to join group
  };

  const handleLeaveGroup = () => {
    setIsMember(false);
    // API call to leave group
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Chargement...</div>
      </div>
    );
  }

  const isTeacher = session?.user?.id === group.teacherId;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{group.name}</h1>
                <p className="text-sm text-gray-400">
                  {group.members.length} membres • Prof: {group.teacherName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isMember ? (
                <button
                  onClick={handleJoinGroup}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Rejoindre la classe
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowTestMode(true)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition-colors"
                  >
                    🎮 Mode Défi
                  </button>
                  {isTeacher && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={handleLeaveGroup}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    title="Quitter le groupe"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {!isMember ? (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Groupe privé</h2>
          <p className="text-gray-400 mb-8">
            Ce groupe est réservé aux élèves de la classe. 
            Demandez à votre professeur l'accès pour rejoindre.
          </p>
          <button
            onClick={handleJoinGroup}
            className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-colors"
          >
            Demander à rejoindre
          </button>
        </div>
      ) : (
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Chat */}
            <div className="md:col-span-2">
              <div className="bg-[#12121a] rounded-xl border border-gray-800 h-[500px] flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.userId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.type === 'system'
                            ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-center w-full'
                            : msg.userId === session?.user?.id
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        {msg.type !== 'system' && msg.userId !== session?.user?.id && (
                          <p className="text-xs text-gray-400 mb-1">{msg.username}</p>
                        )}
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.userId === session?.user?.id ? 'text-indigo-300' : 'text-gray-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Écrivez un message..."
                      className="flex-1 p-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="p-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Members */}
              <div className="bg-[#12121a] rounded-xl border border-gray-800 p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Membres ({group.members.length})
                </h3>
                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {member.displayName?.[0] || member.username[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.displayName || member.username}</p>
                      </div>
                      {member.role === 'teacher' && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Stats */}
              <div className="bg-[#12121a] rounded-xl border border-gray-800 p-4">
                <h3 className="font-semibold mb-4">Statistiques du groupe</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tests collectifs</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Moyenne du groupe</span>
                    <span className="font-semibold text-green-400">1450 ELO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Meilleur joueur</span>
                    <span className="font-semibold text-yellow-400">Alice</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Test Mode */}
      {showTestMode && (
        <GroupTestMode 
          groupId={group.id} 
          members={group.members} 
          onClose={() => setShowTestMode(false)} 
        />
      )}
    </div>
  );
}
