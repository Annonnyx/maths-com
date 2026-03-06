'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface JoinClassSectionProps {
  onClassJoined: () => void;
}

export default function JoinClassSection({ onClassJoined }: JoinClassSectionProps) {
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinClass = async () => {
    if (!joinCode.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/class-groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: joinCode.trim() })
      });
      
      if (response.ok) {
        setJoinCode('');
        onClassJoined();
        alert('Vous avez rejoint la classe avec succès !');
      } else {
        const error = await response.json();
        alert(error.error || 'Code invalide');
      }
    } catch (error) {
      alert('Erreur lors de la tentative de rejoindre la classe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-[#1e1e2e] rounded-xl border border-[#3a3a4a]">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-purple-400" />
        Rejoindre une classe
      </h3>
      <p className="text-gray-400 mb-4">
        Entrez le code d'invitation fourni par votre professeur pour rejoindre une classe.
      </p>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Code d'invitation (ex: ABC123)"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJoinClass()}
          className="flex-1 px-4 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handleJoinClass}
          disabled={isLoading || !joinCode.trim()}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Rejoindre...' : 'Rejoindre'}
        </button>
      </div>
    </div>
  );
}
