'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Clock, Target, X, Check, AlertCircle, Trophy } from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { TIME_CONTROLS } from '@/lib/multiplayer';

interface ChallengeModalProps {
  friendId: string;
  friendName: string;
  isOpen: boolean;
  onClose: () => void;
}

function ChallengeModal({ friendId, friendName, isOpen, onClose }: ChallengeModalProps) {
  const { createChallenge } = useChallenges();
  const [gameType, setGameType] = useState<'ranked' | 'friendly'>('ranked');
  const [timeControl, setTimeControl] = useState<string>('blitz');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChallenge = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedTimeControl = TIME_CONTROLS[timeControl as keyof typeof TIME_CONTROLS];
      if (!selectedTimeControl) {
        throw new Error('Invalid time control');
      }

      await createChallenge(
        friendId,
        gameType,
        timeControl,
        selectedTimeControl.timeLimit,
        20,
        'mixed'
      );

      setSuccess(`Défi envoyé à ${friendName} !`);
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du défi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1e1e2e] rounded-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5 text-indigo-400" />
              Défier {friendName}
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">{success}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Game Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type de partie
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGameType('ranked')}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      gameType === 'ranked' 
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' 
                        : 'bg-[#12121a] border-[#2a2a3a] text-foreground hover:border-[#3a3a4a]'
                    }`}
                  >
                    <Trophy className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-sm">Classé</div>
                  </button>
                  <button
                    onClick={() => setGameType('friendly')}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      gameType === 'friendly' 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                        : 'bg-[#12121a] border-[#2a2a3a] text-foreground hover:border-[#3a3a4a]'
                    }`}
                  >
                    <Target className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-sm">Amical</div>
                  </button>
                </div>
              </div>
              
              {/* Time Control */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Temps de jeu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TIME_CONTROLS).map(([key, tc]) => (
                    <button
                      key={key}
                      onClick={() => setTimeControl(key)}
                      className={`px-3 py-2 rounded-lg border transition-all ${
                        timeControl === key 
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' 
                          : 'bg-[#12121a] border-[#2a2a3a] text-foreground hover:border-[#3a3a4a]'
                      }`}
                    >
                      <Clock className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-sm font-medium">{tc.name}</div>
                      <div className="text-xs text-gray-500">{tc.timeLimit}s</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleChallenge}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-indigo-500 text-foreground rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isLoading ? 'Envoi...' : 'Lancer le défi'}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-[#2a2a3a] text-foreground rounded-xl hover:bg-[#3a3a4a] transition-all font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ChallengesListProps {
  title: string;
  challenges: any[];
  onRespond?: (challengeId: string, action: 'accept' | 'decline') => void;
  showActions?: boolean;
}

function ChallengesList({ title, challenges, onRespond, showActions = false }: ChallengesListProps) {
  if (challenges.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1e1e2e] rounded-xl p-4"
    >
      <h4 className="font-semibold text-foreground mb-3">{title}</h4>
      <div className="space-y-2">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                {challenge.opponent.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium">{challenge.opponent.username}</div>
                <div className="text-xs text-gray-500">
                  {challenge.gameType === 'ranked' ? 'Classé' : 'Amical'} • {challenge.timeControl}
                </div>
              </div>
            </div>
            {showActions && onRespond && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRespond(challenge.id, 'accept')}
                  className="px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-all text-xs"
                >
                  Accepter
                </button>
                <button
                  onClick={() => onRespond(challenge.id, 'decline')}
                  className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all text-xs"
                >
                  Refuser
                </button>
              </div>
            )}
            <div className="text-xs text-gray-500">
              {new Date(challenge.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ChallengesManager() {
  const { 
    pendingReceived, 
    pendingSent, 
    accepted, 
    declined, 
    expired, 
    respondToChallenge 
  } = useChallenges();
  
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; name: string } | null>(null);

  const handleChallenge = (friendId: string, friendName: string) => {
    setSelectedFriend({ id: friendId, name: friendName });
    setShowChallengeModal(true);
  };

  const handleRespond = async (challengeId: string, action: 'accept' | 'decline') => {
    try {
      await respondToChallenge(challengeId, action);
    } catch (error) {
      console.error('Error responding to challenge:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Challenges */}
      <ChallengesList
        title="Défis en attente"
        challenges={pendingReceived}
        onRespond={handleRespond}
        showActions={true}
      />

      {/* Sent Challenges */}
      <ChallengesList
        title="Défis envoyés"
        challenges={pendingSent}
      />

      {/* Accepted Challenges */}
      <ChallengesList
        title="Défis acceptés"
        challenges={accepted}
      />

      {/* Challenge Modal */}
      {selectedFriend && (
        <ChallengeModal
          friendId={selectedFriend.id}
          friendName={selectedFriend.name}
          isOpen={showChallengeModal}
          onClose={() => {
            setShowChallengeModal(false);
            setSelectedFriend(null);
          }}
        />
      )}
    </div>
  );
}
