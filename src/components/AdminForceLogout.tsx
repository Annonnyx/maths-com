'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function AdminForceLogout() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  // Vérifier si l'utilisateur est admin
  const isAdmin = session?.user?.email?.includes('admin');

  const handleForceLogout = async () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir déconnecter tous les utilisateurs ?\n\nToutes les sessions actives seront invalidées et les utilisateurs devront se reconnecter.')) {
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/admin/force-logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ ${data.message}\n📊 Sessions supprimées: ${data.sessionsDeleted}\n👥 Utilisateurs mis à jour: ${data.usersUpdated}\n⏰ ${data.timestamp}`);
      } else {
        setResult(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Erreur réseau: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null; // Ne rien afficher si non-admin
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        🔧 Administration
      </h3>
      <p className="text-sm text-yellow-700 mb-4">
        Forcer la déconnexion de tous les utilisateurs (utile après des mises à jour importantes)
      </p>
      
      <button
        onClick={handleForceLogout}
        disabled={isLoading}
        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        {isLoading ? '⏳ Déconnexion...' : '🚪 Déconnecter tous les utilisateurs'}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-white rounded border border-gray-200">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
