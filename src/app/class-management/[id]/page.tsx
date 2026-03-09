'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Settings, BarChart3, MessageSquare, 
  BookOpen, Calendar, Award, Target, TrendingUp, Check, X, Plus, Trophy, Clock,
  Share2, QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Composant pour créer des questions manuelles
function ManualQuestionEditor({ onAdd }: { onAdd: (question: any) => void }) {
  const [questionType, setQuestionType] = useState<'single' | 'multiple' | 'free_text'>('single');
  const [questionText, setQuestionText] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState<{ id: string; text: string }[]>([{ id: '1', text: '' }, { id: '2', text: '' }]);
  const [correctOptions, setCorrectOptions] = useState<string[]>([]);
  const [points, setPoints] = useState(1);
  const [difficulty, setDifficulty] = useState(5);

  const resetForm = () => {
    setQuestionText('');
    setAnswer('');
    setOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
    setCorrectOptions([]);
    setPoints(1);
    setDifficulty(5);
  };

  const handleAddOption = () => {
    setOptions([...options, { id: String(options.length + 1), text: '' }]);
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter(opt => opt.id !== id));
    setCorrectOptions(correctOptions.filter(cid => cid !== id));
  };

  const toggleCorrectOption = (id: string) => {
    if (questionType === 'single') {
      setCorrectOptions([id]);
    } else {
      setCorrectOptions(
        correctOptions.includes(id) 
          ? correctOptions.filter(cid => cid !== id)
          : [...correctOptions, id]
      );
    }
  };

  const handleSubmit = () => {
    if (!questionText.trim()) return;

    const question: any = {
      type: questionType,
      question: questionText,
      points,
      difficulty,
    };

    if (questionType === 'single') {
      question.answer = answer;
    } else if (questionType === 'multiple') {
      question.options = options.filter(opt => opt.text.trim());
      question.correctAnswers = correctOptions;
    } else if (questionType === 'free_text') {
      question.requiresManualGrading = true;
      question.acceptedAnswers = answer.split(',').map(a => a.trim()).filter(Boolean);
    }

    onAdd(question);
    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setQuestionType('single')}
          className={`px-3 py-1 rounded text-sm ${questionType === 'single' ? 'bg-purple-600 text-white' : 'bg-[#2a2a3a] text-gray-400'}`}
        >
          Réponse unique
        </button>
        <button
          type="button"
          onClick={() => setQuestionType('multiple')}
          className={`px-3 py-1 rounded text-sm ${questionType === 'multiple' ? 'bg-purple-600 text-white' : 'bg-[#2a2a3a] text-gray-400'}`}
        >
          Choix multiples
        </button>
        <button
          type="button"
          onClick={() => setQuestionType('free_text')}
          className={`px-3 py-1 rounded text-sm ${questionType === 'free_text' ? 'bg-purple-600 text-white' : 'bg-[#2a2a3a] text-gray-400'}`}
        >
          Réponse libre
        </button>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Question</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded text-white text-sm"
          rows={2}
          placeholder="Entrez votre question..."
        />
      </div>

      {questionType === 'single' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Réponse correcte</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded text-white text-sm"
            placeholder="Réponse attendue..."
          />
        </div>
      )}

      {questionType === 'multiple' && (
        <div className="space-y-2">
          <label className="block text-xs text-gray-400">Options (cochez les correctes)</label>
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={correctOptions.includes(opt.id)}
                onChange={() => toggleCorrectOption(opt.id)}
                className="rounded"
              />
              <input
                type="text"
                value={opt.text}
                onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                className="flex-1 px-3 py-1 bg-[#2a2a3a] border border-[#3a3a4a] rounded text-white text-sm"
                placeholder={`Option ${opt.id}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(opt.id)}
                  className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
          >
            <Plus className="w-3 h-3" />
            Ajouter une option
          </button>
        </div>
      )}

      {questionType === 'free_text' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Réponses acceptées (séparées par des virgules, laisser vide pour correction manuelle)
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded text-white text-sm"
            placeholder="ex: Paris, paris, capitale de la France"
          />
          <p className="text-xs text-gray-500 mt-1">
            Laissez vide si vous souhaitez corriger manuellement chaque réponse.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Points</label>
          <input
            type="number"
            min="1"
            max="10"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Difficulté (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={difficulty}
            onChange={(e) => setDifficulty(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded text-white text-sm"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!questionText.trim()}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
      >
        Ajouter la question
      </button>
    </div>
  );
}

interface ClassDetails {
  id: string;
  name: string;
  description: string;
  level: string;
  subject: string;
  maxStudents: number;
  isPrivate: boolean;
  studentCount: number;
  createdAt: string;
  inviteCode?: string;
  teacher?: {
    id: string;
    username: string;
    displayName?: string;
  };
}

export default function ClassDetailsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [userClasses, setUserClasses] = useState<any[]>([]);
  const [userClassesLoading, setUserClassesLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    maxStudents: 30,
    isPrivate: false
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [newAssignment, setNewAssignment] = useState<{ 
    title: string; 
    description: string; 
    dueDate: string;
    questionCount?: number;
    difficulty?: string;
    schoolLevel?: string;
    operationTypes?: string[];
    timeLimit?: number | null;
    negativePoints?: boolean;
    questionSource?: 'auto' | 'manual';
    manualQuestions?: any[];
    shareEnabled?: boolean;
  }>({ 
    title: '', 
    description: '', 
    dueDate: '', 
    questionCount: 10, 
    difficulty: 'mixed',
    schoolLevel: '6eme',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    timeLimit: null,
    negativePoints: false,
    questionSource: 'auto',
    manualQuestions: [],
    shareEnabled: false
  });
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedAssignmentForShare, setSelectedAssignmentForShare] = useState<any>(null);

  // Déterminer si professeur ou élève (après chargement des données)
  const isTeacher = session?.user && (classDetails?.teacher?.id === session.user.id || (session.user as any)?.isAdmin);
  const isStudent = session?.user && !isTeacher;
  const isClassOwner = classDetails?.teacher?.id === session?.user?.id;

  const tabs = [
    { id: 'overview', name: 'Aperçu', icon: BarChart3, showFor: 'all' },
    { id: 'students', name: 'Élèves', icon: Users, showFor: 'teacher' },
    { id: 'assignments', name: 'Devoirs', icon: BookOpen, showFor: 'all' },
    { id: 'messages', name: 'Messages', icon: MessageSquare, showFor: 'all' },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, showFor: 'teacher' },
    { id: 'settings', name: 'Paramètres', icon: Settings, showFor: 'teacher' },
  ].filter(tab => {
    if (tab.showFor === 'all') return true;
    if (tab.showFor === 'teacher') return isTeacher;
    return true;
  });

  const loadAnalytics = async () => {
    if (!params.id) return;
    
    setAnalyticsLoading(true);
    try {
      const response = await fetch(`/api/class-groups/${params.id}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadUserClasses = async () => {
    if (!session?.user) return;
    
    setUserClassesLoading(true);
    try {
      const response = await fetch('/api/class-groups/my-classes');
      if (response.ok) {
        const data = await response.json();
        setUserClasses(data.classes || []);
      } else {
        console.error('Failed to load user classes');
      }
    } catch (error) {
      console.error('Error loading user classes:', error);
    } finally {
      setUserClassesLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadClassDetails();
    }
  }, [params.id]);

  useEffect(() => {
    if (activeTab === 'analytics' && params.id) {
      loadAnalytics();
    }
  }, [activeTab, params.id]);

  useEffect(() => {
    if (activeTab === 'messages' && params.id) {
      loadMessages();
    }
  }, [activeTab, params.id]);

  useEffect(() => {
    if (activeTab === 'assignments' && params.id) {
      console.log('[Frontend] useEffect assignments triggered, loading assignments...');
      loadAssignments();
    }
  }, [activeTab, params.id]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/class-messages?classId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch('/api/class-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: params.id, content: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        setShowMessageForm(false);
        loadMessages();
      } else {
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erreur réseau');
    } finally {
      setSendingMessage(false);
    }
  };

  const loadAssignments = async () => {
    console.log('[Frontend] loadAssignments called, classId:', params.id);
    try {
      const response = await fetch(`/api/class-assignments?classId=${params.id}`);
      console.log('[Frontend] API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[Frontend] API returned data:', data);
        console.log('[Frontend] Assignments count:', data.assignments?.length);
        setAssignments(data.assignments || []);
      } else {
        const errorText = await response.text();
        console.error('[Frontend] API error:', errorText);
      }
    } catch (error) {
      console.error('[Frontend] Error loading assignments:', error);
    }
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title.trim()) return;

    setCreatingAssignment(true);
    try {
      const response = await fetch('/api/class-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          classId: params.id, 
          title: newAssignment.title,
          description: newAssignment.description,
          dueDate: newAssignment.dueDate,
          questionCount: newAssignment.questionCount,
          difficulty: newAssignment.difficulty,
          schoolLevel: newAssignment.schoolLevel,
          operationTypes: newAssignment.operationTypes,
          timeLimit: newAssignment.timeLimit,
          negativePoints: newAssignment.negativePoints,
          questionSource: newAssignment.questionSource,
          manualQuestions: newAssignment.manualQuestions,
          shareEnabled: newAssignment.shareEnabled
        })
      });

      if (response.ok) {
        setNewAssignment({ 
          title: '', 
          description: '', 
          dueDate: '', 
          questionCount: 10, 
          difficulty: 'mixed',
          schoolLevel: '6eme',
          operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
          timeLimit: null,
          negativePoints: false,
          questionSource: 'auto',
          manualQuestions: [],
          shareEnabled: false
        });
        setShowAssignmentForm(false);
        loadAssignments();
        alert('Devoir créé avec succès !');
      } else {
        alert('Erreur lors de la création du devoir');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Erreur réseau');
    } finally {
      setCreatingAssignment(false);
    }
  };

  const loadClassDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/class-groups/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setClassDetails(data.group);
        
        // Initialiser le formulaire d'édition
        setEditForm({
          name: data.group.name,
          description: data.group.description || '',
          maxStudents: data.group.maxStudents,
          isPrivate: data.group.isPrivate
        });
        
        // Extraire les élèves et les demandes d'adhésion
        const members = data.group?.members || [];
        const actualStudents = members.filter((m: any) => m.role === 'student');
        const pendingRequests = members.filter((m: any) => m.role === 'pending');
        
        setStudents(actualStudents);
        setJoinRequests(pendingRequests);
      }
    } catch (error) {
      console.error('Error loading class details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateClass = async () => {
    if (!classDetails) return;
    
    try {
      // Vérifier si la visibilité change
      const isVisibilityChanging = classDetails.isPrivate !== editForm.isPrivate;
      
      if (isVisibilityChanging) {
        const action = editForm.isPrivate ? 'rendre privée' : 'rendre publique';
        const consequence = editForm.isPrivate 
          ? "Seuls les élèves ayant le code d'invitation pourront la rejoindre"
          : "Tous les élèves pourront la retrouver et la rejoindre";
        
        if (!confirm(
          `Êtes-vous sûr de vouloir ${action} cette classe ?\n\n${consequence}.\n\nCette action affectera la façon dont les élèves peuvent accéder à votre classe.`
        )) {
          return;
        }
      }

      const response = await fetch(`/api/class-groups/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        setIsEditing(false);
        loadClassDetails();
        
        if (isVisibilityChanging) {
          const newStatus = editForm.isPrivate ? 'privée' : 'publique';
          alert(`Classe mise à jour avec succès !\n\nVotre classe est maintenant ${newStatus}.`);
        } else {
          alert('Classe mise à jour avec succès !');
        }
      }
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const deleteClass = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/class-groups/${params.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        router.push('/class-management');
        alert('Classe supprimée avec succès');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const acceptStudent = async (studentId: string) => {
    try {
      const response = await fetch('/api/class-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', requestId: studentId, classId: params.id })
      });
      
      if (response.ok) {
        loadClassDetails();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'acceptation');
      }
    } catch (error) {
      console.error('Error accepting student:', error);
      alert('Erreur lors de l\'acceptation de l\'élève');
    }
  };

  const rejectStudent = async (studentId: string) => {
    try {
      const response = await fetch('/api/class-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', requestId: studentId, classId: params.id })
      });
      
      if (response.ok) {
        loadClassDetails();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors du refus');
      }
    } catch (error) {
      console.error('Error rejecting student:', error);
      alert('Erreur lors du refus de l\'élève');
    }
  };

  const leaveClass = async () => {
    if (!confirm('Êtes-vous sûr de vouloir quitter cette classe ?')) return;
    
    try {
      const response = await fetch(`/api/class-members?classId=${params.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        router.push('/classes');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la tentative de quitter');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  const removeStudent = async (memberId: string, studentName: string) => {
    if (!confirm(`Exclure ${studentName} de la classe ?`)) return;
    
    try {
      const response = await fetch(`/api/class-members?classId=${params.id}&memberId=${memberId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadClassDetails();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'exclusion');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Classe non trouvée</h2>
          <Link
            href="/class-management"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retour aux classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="bg-[#1a1a2e] border-b border-[#2a2a3a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/class-management"
                className="p-2 hover:bg-[#2a2a3a] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{classDetails.name}</h1>
                <p className="text-gray-400">{classDetails.level} • {classDetails.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                classDetails.isPrivate 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {classDetails.isPrivate ? 'Privée' : 'Publique'}
              </span>
              {classDetails.inviteCode && (
                <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                  Code: {classDetails.inviteCode}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#1a1a2e] border-b border-[#2a2a3a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0a0a0f] text-purple-400 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-[#2a2a3a]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Bouton quitter pour élèves */}
              {isStudent && (
                <div className="flex justify-end">
                  <button
                    onClick={leaveClass}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Quitter la classe
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a3a]">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{classDetails.studentCount}</span>
                  </div>
                  <p className="text-gray-400">Élèves inscrits</p>
                  <p className="text-sm text-gray-500 mt-1">sur {classDetails.maxStudents === 0 ? 'illimité' : classDetails.maxStudents}</p>
                </div>
                
                <div className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a3a]">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bold text-white">0</span>
                  </div>
                  <p className="text-gray-400">Devoirs actifs</p>
                  <p className="text-sm text-gray-500 mt-1">À configurer</p>
                </div>
                
                <div className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a3a]">
                  <div className="flex items-center justify-between mb-2">
                    <MessageSquare className="w-8 h-8 text-purple-400" />
                    <span className="text-2xl font-bold text-white">0</span>
                  </div>
                  <p className="text-gray-400">Messages</p>
                  <p className="text-sm text-gray-500 mt-1">Aucun nouveau message</p>
                </div>
                
                <div className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a3a]">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-orange-400" />
                    <span className="text-2xl font-bold text-white">--</span>
                  </div>
                  <p className="text-gray-400">Progression moyenne</p>
                  <p className="text-sm text-gray-500 mt-1">Données à venir</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-classes' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Mes Classes</h2>
                <p className="text-gray-400">Toutes les classes dans lesquelles tu es inscrit</p>
              </div>

              {userClassesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-gray-400">Chargement de tes classes...</span>
                </div>
              ) : userClasses.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">Tu n'es inscrit dans aucune classe pour le moment.</p>
                  <div className="text-sm text-gray-500">
                    Utilise un code d'invitation pour rejoindre une classe.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userClasses.map((classItem: any) => (
                    <div key={classItem.id} className="bg-[#2a2a3a] rounded-lg border border-[#3a3a4a] p-4 hover:border-[#4a4a5a] transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{classItem.name}</h3>
                            <p className="text-sm text-gray-400">
                              Professeur: {classItem.teacher?.displayName || classItem.teacher?.username || 'Inconnu'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {classItem.studentCount || 0} élèves • Code: {classItem.inviteCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/class-management/${classItem.id}`}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            Voir
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'view-class' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Vue Élève</h2>
                <p className="text-gray-400">Tu consultes cette classe en tant qu'élève</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#2a2a3a] p-4 rounded-lg border border-[#3a3a4a]">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Informations</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nom de la classe</span>
                      <span className="text-white font-medium">{classDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Professeur</span>
                      <span className="text-white font-medium">{classDetails.teacher?.displayName || classDetails.teacher?.username || 'Inconnu'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nombre d'élèves</span>
                      <span className="text-white font-medium">{students.length}/{classDetails.maxStudents === 0 ? 'illimité' : classDetails.maxStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Code d'invitation</span>
                      <span className="text-white font-mono">{classDetails.inviteCode}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#2a2a3a] p-4 rounded-lg border border-[#3a3a4a]">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Devoirs</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Devoirs actifs</span>
                      <span className="text-white font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Devoirs complétés</span>
                      <span className="text-white font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Moyenne</span>
                      <span className="text-white font-medium">-</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#2a2a3a] p-4 rounded-lg border border-[#3a3a4a]">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Classement</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ton rang</span>
                      <span className="text-white font-medium">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Points</span>
                      <span className="text-white font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participation</span>
                      <span className="text-white font-medium">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Liste des élèves ({students.length})</h3>
                <div className="text-sm text-gray-400">
                  {classDetails.studentCount}/{classDetails.maxStudents === 0 ? 'illimité' : classDetails.maxStudents} places
                </div>
              </div>
              
              {/* Demandes en attente - visible uniquement pour le prof */}
              {isTeacher && joinRequests.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Demandes en attente ({joinRequests.length})
                  </h4>
                  <div className="space-y-2">
                    {joinRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-[#2a2a3a] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <span className="text-yellow-400 text-sm">
                              {request.user.displayName?.[0] || request.user.username?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-sm">{request.user.displayName || request.user.username}</p>
                            <p className="text-xs text-gray-400">@{request.user.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => acceptStudent(request.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Accepter
                          </button>
                          <button
                            onClick={() => rejectStudent(request.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Refuser
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">Aucun élève inscrit pour le moment.</p>
                  <div className="text-sm text-gray-500">
                    Partagez le code d'invitation <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded font-mono">
                      {classDetails.inviteCode}
                    </span> pour que les élèves puissent rejoindre.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-[#2a2a3a] rounded-lg border border-[#3a3a4a]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <span className="text-purple-400 font-medium">
                            {student.user.displayName?.[0] || student.user.username?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {student.user.displayName || student.user.username}
                          </p>
                          <p className="text-sm text-gray-400">@{student.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Élève
                        </span>
                        {isTeacher && (
                          <button 
                            onClick={() => removeStudent(student.id, student.user.displayName || student.user.username)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            title="Exclure de la classe"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Devoirs et exercices ({assignments.length})</h3>
                {isTeacher && (
                  <button 
                    onClick={() => setShowAssignmentForm(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Créer un devoir
                  </button>
                )}
              </div>

              {showAssignmentForm && (
                <form onSubmit={createAssignment} className="mb-6 p-4 bg-[#2a2a3a] rounded-lg border border-[#3a3a4a]">
                  <h4 className="text-lg font-semibold text-white mb-4">Nouveau devoir</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Titre</label>
                      <input
                        type="text"
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#3a3a4a] rounded text-white"
                        placeholder="Titre du devoir"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Description</label>
                      <textarea
                        value={newAssignment.description}
                        onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#3a3a4a] rounded text-white"
                        placeholder="Description du devoir"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre de questions</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={newAssignment.questionCount || 10}
                          onChange={(e) => setNewAssignment({...newAssignment, questionCount: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#3a3a4a] rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Durée (minutes)</label>
                        <input
                          type="number"
                          min="1"
                          max="180"
                          placeholder="Sans limite"
                          value={newAssignment.timeLimit || ''}
                          onChange={(e) => setNewAssignment({...newAssignment, timeLimit: e.target.value ? parseInt(e.target.value) : null})}
                          className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#3a3a4a] rounded text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Niveau scolaire</label>
                        <select
                          value={newAssignment.schoolLevel || '6eme'}
                          onChange={(e) => setNewAssignment({...newAssignment, schoolLevel: e.target.value})}
                          className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#3a3a4a] rounded text-white"
                        >
                          <option value="CP">CP</option>
                          <option value="CE1">CE1</option>
                          <option value="CE2">CE2</option>
                          <option value="CM1">CM1</option>
                          <option value="CM2">CM2</option>
                          <option value="6eme">6ème</option>
                          <option value="5eme">5ème</option>
                          <option value="4eme">4ème</option>
                          <option value="3eme">3ème</option>
                          <option value="2nde">Seconde</option>
                          <option value="1ere">Première</option>
                          <option value="Terminale">Terminale</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Difficulté</label>
                        <select
                          value={newAssignment.difficulty || 'mixed'}
                          onChange={(e) => setNewAssignment({...newAssignment, difficulty: e.target.value})}
                          className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#3a3a4a] rounded text-white"
                        >
                          <option value="easy">Facile</option>
                          <option value="medium">Moyen</option>
                          <option value="hard">Difficile</option>
                          <option value="mixed">Mixte</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Types d'opérations</label>
                      <div className="flex flex-wrap gap-2">
                        {['addition', 'subtraction', 'multiplication', 'division'].map((op) => (
                          <label key={op} className="flex items-center gap-1 text-sm text-gray-300">
                            <input
                              type="checkbox"
                              checked={newAssignment.operationTypes?.includes(op) ?? true}
                              onChange={(e) => {
                                const current = newAssignment.operationTypes || ['addition', 'subtraction', 'multiplication', 'division'];
                                if (e.target.checked) {
                                  setNewAssignment({...newAssignment, operationTypes: [...current, op]});
                                } else {
                                  setNewAssignment({...newAssignment, operationTypes: current.filter(o => o !== op)});
                                }
                              }}
                              className="rounded"
                            />
                            {op === 'addition' && '+'}
                            {op === 'subtraction' && '-'}
                            {op === 'multiplication' && '×'}
                            {op === 'division' && '÷'}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Source des questions</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                          <input
                            type="radio"
                            name="questionSource"
                            value="auto"
                            checked={newAssignment.questionSource === 'auto'}
                            onChange={(e) => setNewAssignment({...newAssignment, questionSource: e.target.value as 'auto' | 'manual'})}
                            className="rounded"
                          />
                          Générées automatiquement
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                          <input
                            type="radio"
                            name="questionSource"
                            value="manual"
                            checked={newAssignment.questionSource === 'manual'}
                            onChange={(e) => setNewAssignment({...newAssignment, questionSource: e.target.value as 'auto' | 'manual'})}
                            className="rounded"
                          />
                          Créées manuellement
                        </label>
                      </div>
                    </div>
                    {newAssignment.questionSource === 'manual' && (
                      <div className="p-4 bg-[#1a1a2e] rounded border border-[#3a3a4a]">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-white">Questions manuelles</h5>
                          <span className="text-xs text-gray-400">{newAssignment.manualQuestions?.length || 0} questions</span>
                        </div>
                        
                        {newAssignment.manualQuestions && newAssignment.manualQuestions.length > 0 && (
                          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                            {newAssignment.manualQuestions.map((q: any, idx: number) => (
                              <div key={idx} className="p-3 bg-[#2a2a3a] rounded flex items-center justify-between">
                                <div>
                                  <span className="text-xs text-purple-400">Q{idx + 1}</span>
                                  <p className="text-sm text-white truncate max-w-md">{q.question}</p>
                                  <span className="text-xs text-gray-400">{q.type === 'single' ? 'Réponse unique' : q.type === 'multiple' ? 'Choix multiples' : 'Réponse libre'}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = newAssignment.manualQuestions?.filter((_, i) => i !== idx) || [];
                                    setNewAssignment({...newAssignment, manualQuestions: updated});
                                  }}
                                  className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <ManualQuestionEditor
                          onAdd={(question: any) => {
                            setNewAssignment({
                              ...newAssignment,
                              manualQuestions: [...(newAssignment.manualQuestions || []), question]
                            });
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAssignment.negativePoints || false}
                          onChange={(e) => setNewAssignment({...newAssignment, negativePoints: e.target.checked})}
                          className="rounded"
                        />
                        Points négatifs
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAssignment.shareEnabled || false}
                          onChange={(e) => setNewAssignment({...newAssignment, shareEnabled: e.target.checked})}
                          className="rounded"
                        />
                        Partage via lien/QR
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Date de rendu</label>
                      <input
                        type="date"
                        value={newAssignment.dueDate}
                        onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#3a3a4a] rounded text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={creatingAssignment}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                      >
                        {creatingAssignment ? 'Création...' : 'Créer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAssignmentForm(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </form>
              )}
              
              {assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment: any) => (
                    <div key={assignment.id} className="p-4 bg-[#2a2a3a] rounded-lg border border-[#3a3a4a]">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{assignment.title}</h4>
                          <p className="text-sm text-gray-400">{assignment.description || 'Pas de description'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          assignment.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {assignment.status === 'active' ? 'Actif' : 'Fermé'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {assignment.questionCount} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          Difficulté: {assignment.difficulty}
                        </span>
                        {assignment.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            À rendre le: {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {isTeacher && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <Users className="w-4 h-4" />
                            {assignment.totalSubmissions || 0} rendus
                          </span>
                        )}
                      </div>

                      {/* Progression pour l'élève */}
                      {!isTeacher && assignment.mySubmission && (
                        <div className="mb-3 p-3 bg-[#1a1a2e] rounded">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">
                              {assignment.mySubmission.status === 'submitted' ? 'Rendu' : 
                               assignment.mySubmission.status === 'graded' ? 'Noté' : 'En cours'}
                            </span>
                            {assignment.mySubmission.score !== null && (
                              <span className={`text-lg font-bold ${
                                assignment.mySubmission.score >= 70 ? 'text-green-400' :
                                assignment.mySubmission.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {assignment.mySubmission.score}%
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-gray-400">
                            {assignment.mySubmission.correctCount}/{assignment.mySubmission.totalAnswered} correct
                          </div>
                        </div>
                      )}

                      {/* Liste des questions (visible par le prof) */}
                      {isTeacher && assignment.questions && assignment.questions.length > 0 && (
                        <div className="mt-3 border-t border-[#3a3a4a] pt-3">
                          <h5 className="text-sm font-medium text-gray-300 mb-2">Questions ({assignment.questions.length})</h5>
                          <div className="grid grid-cols-5 gap-2">
                            {assignment.questions.slice(0, 10).map((q: any, idx: number) => (
                              <div 
                                key={q.id} 
                                className={`p-2 rounded text-center text-xs ${
                                  q.difficulty <= 3 ? 'bg-green-500/20 text-green-400' :
                                  q.difficulty <= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}
                                title={`${q.question} = ${q.answer} (difficulté: ${q.difficulty})`}
                              >
                                Q{idx + 1}
                              </div>
                            ))}
                            {assignment.questions.length > 10 && (
                              <div className="p-2 rounded text-center text-xs bg-gray-500/20 text-gray-400">
                                +{assignment.questions.length - 10}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {isTeacher ? (
                          <>
                            <button
                              onClick={() => {/* TODO: View submissions */}}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                            >
                              Voir les rendus
                            </button>
                            <button
                              onClick={() => router.push(`/assignment-analytics/${assignment.id}`)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center gap-1"
                            >
                              <BarChart3 className="w-3 h-3" />
                              Analytiques
                            </button>
                            {assignment.shareEnabled && assignment.shareCode && (
                              <button
                                onClick={() => {
                                  setSelectedAssignmentForShare(assignment);
                                  setShareModalOpen(true);
                                }}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center gap-1"
                              >
                                <Share2 className="w-3 h-3" />
                                Partager
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => {/* TODO: Start/take assignment */}}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                          >
                            {assignment.mySubmission ? 'Continuer' : 'Commencer'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">Aucun devoir créé pour le moment.</p>
                  {isTeacher ? (
                    <p className="text-sm text-gray-500">Commencez par créer votre premier devoir pour cette classe.</p>
                  ) : (
                    <p className="text-sm text-gray-500">Votre professeur n&apos;a pas encore créé de devoirs.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Messages de la classe</h3>
                {isTeacher && (
                  <button 
                    onClick={() => setShowMessageForm(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Envoyer un message
                  </button>
                )}
              </div>

              {showMessageForm && (
                <form onSubmit={sendMessage} className="mb-6 p-4 bg-[#2a2a3a] rounded-lg border border-[#3a3a4a]">
                  <h4 className="text-lg font-semibold text-white mb-4">Nouveau message</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Message</label>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#3a3a4a] rounded text-white"
                        placeholder="Votre message pour la classe..."
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={sendingMessage}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                      >
                        {sendingMessage ? 'Envoi...' : 'Envoyer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMessageForm(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </form>
              )}
              
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg: any) => (
                    <div key={msg.id} className="p-4 bg-[#2a2a3a] rounded-lg border border-[#3a3a4a]">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <span className="text-purple-400 text-sm">
                            {msg.user?.displayName?.[0] || msg.user?.username?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {msg.user?.displayName || msg.user?.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(msg.createdAt).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">Aucun message pour le moment.</p>
                  {isTeacher ? (
                    <p className="text-sm text-gray-500">Communiquez avec vos élèves en envoyant un message à la classe.</p>
                  ) : (
                    <p className="text-sm text-gray-500">Le professeur n&apos;a pas encore envoyé de messages.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Analytiques de la classe</h3>
                <button 
                  onClick={loadAnalytics}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Actualiser
                </button>
              </div>
              
              {analyticsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : analyticsData ? (
                <div className="space-y-8">
                  {/* Statistiques globales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#2a2a3a] p-4 rounded-lg border border-[#3a3a4a]">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        <span className="text-2xl font-bold text-white">
                          {analyticsData.globalStats.averageScore.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">Score moyen</p>
                    </div>
                    
                    <div className="bg-[#2a2a3a] p-4 rounded-lg border border-[#3a3a4a]">
                      <div className="flex items-center justify-between mb-2">
                        <Target className="w-6 h-6 text-blue-400" />
                        <span className="text-2xl font-bold text-white">
                          {analyticsData.globalStats.accuracy.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">Taux de réussite</p>
                    </div>
                    
                    <div className="bg-[#2a2a3a] p-4 rounded-lg border border-[#3a3a4a]">
                      <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-6 h-6 text-purple-400" />
                        <span className="text-2xl font-bold text-white">
                          {analyticsData.globalStats.totalQuestions}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">Total questions</p>
                    </div>
                    
                    <div className="bg-[#2a2a3a] p-4 rounded-lg border border-[#3a3a4a]">
                      <div className="flex items-center justify-between mb-2">
                        <Award className="w-6 h-6 text-yellow-400" />
                        <span className="text-2xl font-bold text-white">
                          {(analyticsData.globalStats.averageTime / 1000).toFixed(1)}s
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">Temps moyen</p>
                    </div>
                  </div>

                  {/* Performance par matière */}
                  <div className="bg-[#2a2a3a] rounded-lg border border-[#3a3a4a] p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Performance par matière</h4>
                    <div className="space-y-3">
                      {analyticsData.subjectPerformance.map((subject: any) => (
                        <div key={subject.subject} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="text-white capitalize">{subject.subject}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400 text-sm">
                              {subject.correctAnswers}/{subject.totalQuestions}
                            </span>
                            <span className="text-green-400 font-semibold">
                              {subject.accuracy.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top élèves */}
                  <div className="bg-[#2a2a3a] rounded-lg border border-[#3a3a4a] p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Top des élèves</h4>
                    <div className="space-y-3">
                      {analyticsData.studentsStats.slice(0, 5).map((student: any, index: number) => (
                        <div key={student.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-white font-medium">{student.displayName}</p>
                              <p className="text-gray-400 text-sm">@{student.username}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-semibold">
                              {student.averageScore.toFixed(1)}%
                            </p>
                            <p className="text-gray-400 text-sm">
                              {student.totalQuestions} questions
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Évolution temporelle */}
                  {analyticsData.timeEvolution.length > 0 && (
                    <div className="bg-[#2a2a3a] rounded-lg border border-[#3a3a4a] p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Progression (30 derniers jours)</h4>
                      <div className="space-y-2">
                        {analyticsData.timeEvolution.slice(-7).map((day: any) => (
                          <div key={day.date} className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">
                              {new Date(day.date).toLocaleDateString('fr-FR', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-400">
                                {day.totalQuestions} q
                              </span>
                              <span className="text-green-400">
                                {day.accuracy.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">Aucune donnée analytique disponible</p>
                  <p className="text-sm text-gray-500">
                    Les élèves doivent commencer à répondre à des questions pour voir les analytiques.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Paramètres de la classe</h3>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Modifier
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            name: classDetails.name,
                            description: classDetails.description || '',
                            maxStudents: classDetails.maxStudents,
                            isPrivate: classDetails.isPrivate
                          });
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={updateClass}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Sauvegarder
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Informations de base */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nom de la classe</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                      />
                    ) : (
                      <input
                        type="text"
                        value={classDetails.name}
                        className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                        readOnly
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nombre maximum d'élèves</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.maxStudents}
                        onChange={(e) => setEditForm({...editForm, maxStudents: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                      />
                    ) : (
                      <input
                        type="text"
                        value={classDetails.maxStudents === 0 ? 'Illimité' : classDetails.maxStudents}
                        className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                        readOnly
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                      rows={3}
                    />
                  ) : (
                    <textarea
                      value={classDetails.description || ''}
                      className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                      rows={3}
                      readOnly
                    />
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-[#2a2a3a] rounded-lg border border-[#3a3a4a]">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="private"
                      checked={isEditing ? editForm.isPrivate : classDetails.isPrivate}
                      onChange={(e) => isEditing && setEditForm({...editForm, isPrivate: e.target.checked})}
                      disabled={!isEditing}
                      className="w-4 h-4 text-purple-600 bg-[#2a2a3a] border border-[#3a3a4a] rounded focus:ring-purple-500"
                    />
                    <div>
                      <label htmlFor="private" className="text-sm font-medium text-white">
                        Classe privée
                      </label>
                      <p className="text-xs text-gray-400">
                        {isEditing ? editForm.isPrivate : classDetails.isPrivate 
                          ? "Uniquement accessible avec un code d'invitation" 
                          : "Visible et rejoignable par tous les élèves"
                        }
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (isEditing ? editForm.isPrivate : classDetails.isPrivate)
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {(isEditing ? editForm.isPrivate : classDetails.isPrivate) ? 'Privée' : 'Publique'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Code d'invitation</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={classDetails.inviteCode || 'Aucun'}
                      className="flex-1 px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                      readOnly
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(classDetails.inviteCode || '');
                        alert('Code copié dans le presse-papiers !');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Copier
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                  <div>
                    <span className="font-medium">Niveau:</span> {classDetails.level || 'Non défini'}
                  </div>
                  <div>
                    <span className="font-medium">Matière:</span> {classDetails.subject}
                  </div>
                  <div>
                    <span className="font-medium">Élèves actuels:</span> {classDetails.studentCount}
                  </div>
                  <div>
                    <span className="font-medium">Créée le:</span> {new Date(classDetails.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Actions dangereuses */}
              <div className="mt-8 pt-6 border-t border-[#3a3a4a]">
                <h4 className="text-lg font-semibold text-red-400 mb-4">Actions dangereuses</h4>
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Une fois supprimée, la classe ne pourra pas être récupérée. Tous les élèves seront retirés et les données associées seront perdues.
                  </p>
                  <button
                    onClick={deleteClass}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Supprimer la classe
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de partage */}
      {shareModalOpen && selectedAssignmentForShare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-lg border border-[#3a3a4a] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Partager le devoir
              </h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center p-4 bg-white rounded-lg">
                <QRCodeSVG 
                  value={`${window.location.origin}/shared-assignment/${selectedAssignmentForShare.shareCode}`}
                  size={200}
                  level="H"
                />
                <p className="mt-2 text-sm text-gray-600">Scannez pour accéder au devoir</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Lien de partage</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/shared-assignment/${selectedAssignmentForShare.shareCode}`}
                    className="flex-1 px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded text-white text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/shared-assignment/${selectedAssignmentForShare.shareCode}`);
                      alert('Lien copié !');
                    }}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                  >
                    Copier
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Code de partage</label>
                <div className="px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded text-center">
                  <span className="text-2xl font-mono font-bold text-purple-400 tracking-wider">
                    {selectedAssignmentForShare.shareCode}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setShareModalOpen(false)}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
