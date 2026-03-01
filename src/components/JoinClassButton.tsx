'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface JoinClassButtonProps {
  teacherId: string;
  teacherName: string;
  acceptJoinRequests: boolean;
  onJoinRequestSent?: () => void;
}

export default function JoinClassButton({ 
  teacherId, 
  teacherName, 
  acceptJoinRequests,
  onJoinRequestSent 
}: JoinClassButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'sent'>('none');
  const [error, setError] = useState<string | null>(null);

  const handleJoinRequest = async () => {
    if (!acceptJoinRequests) {
      setError('Ce professeur n\'accepte pas les nouvelles demandes d\'adhésion');
      return;
    }

    if (!session?.user?.id) {
      setError('Vous devez être connecté pour rejoindre une classe');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userId = session.user.id;

      // Vérifier si une demande existe déjà
      const { data: existingRequest } = await supabase
        .from('class_join_requests')
        .select('*')
        .eq('student_id', userId)
        .eq('teacher_id', teacherId)
        .in('status', ['pending', 'accepted'])
        .single();

      if (existingRequest) {
        setRequestStatus(existingRequest.status === 'pending' ? 'pending' : 'sent');
        return;
      }

      // Créer la nouvelle demande
      const { error: insertError } = await supabase
        .from('class_join_requests')
        .insert({
          student_id: userId,
          teacher_id: teacherId,
          status: 'pending'
        });

      if (insertError) {
        setError('Erreur lors de l\'envoi de la demande');
      } else {
        setRequestStatus('sent');
        onJoinRequestSent?.();
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  if (!acceptJoinRequests) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-400">Demandes fermées</p>
            <p className="text-sm text-gray-400">
              {teacherName} n'accepte pas les nouvelles demandes d'adhésion à sa classe pour le moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (requestStatus === 'pending') {
    return (
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-400">Demande en cours</p>
            <p className="text-sm text-gray-400">
              Votre demande d'adhésion est en attente de validation par {teacherName}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (requestStatus === 'sent') {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-400">Demande envoyée</p>
            <p className="text-sm text-gray-400">
              Votre demande a été envoyée avec succès à {teacherName}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={handleJoinRequest}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-transparent animate-spin rounded-full" />
            <span>Envoi en cours...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" />
            <span>Rejoindre la classe de {teacherName}</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </motion.div>
  );
}
