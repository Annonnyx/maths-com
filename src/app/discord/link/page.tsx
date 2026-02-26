'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Link2, 
  Unlink, 
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw
} from 'lucide-react';

export default function DiscordLinkPage() {
  const { data: session } = useSession();
  const [linkCode, setLinkCode] = useState('');
  const [linked, setLinked] = useState(false);
  const [discordUsername, setDiscordUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Vérifier le statut de liaison au chargement
  useEffect(() => {
    checkLinkStatus();
  }, []);

  const checkLinkStatus = async () => {
    try {
      const response = await fetch('/api/discord/link');
      const data = await response.json();
      
      if (data.linked) {
        setLinked(true);
        setDiscordUsername(data.discordUsername);
      }
    } catch (error) {
      console.error('Error checking link status:', error);
    }
  };

  // Lier le compte
  const linkAccount = async () => {
    if (!linkCode.trim() || linkCode.length !== 6) {
      setResult({ type: 'error', message: 'Veuillez entrer un code valide de 6 caractères' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/discord/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: linkCode.toUpperCase() })
      });

      const data = await response.json();

      if (data.success) {
        setLinked(true);
        setDiscordUsername(data.discordUsername);
        setResult({ type: 'success', message: data.message });
        setLinkCode('');
      } else {
        setResult({ type: 'error', message: data.error || 'Erreur lors de la liaison' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  // Délier le compte
  const unlinkAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir délier votre compte Discord ?')) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/discord/link', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setLinked(false);
        setDiscordUsername('');
        setResult({ type: 'success', message: data.message });
      } else {
        setResult({ type: 'error', message: data.error || 'Erreur lors du déliage' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Connexion requise</h1>
          <p className="text-gray-400 mt-2">Connectez-vous pour lier votre compte Discord.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Link2 className="w-8 h-8 text-indigo-400" />
            Lier Discord
          </h1>
          <p className="text-gray-400">
            Liez votre compte Discord pour obtenir des rôles automatiques et rejoindre la communauté
          </p>
        </motion.div>

        {linked ? (
          // Compte déjà lié
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#12121a] rounded-xl p-8 border border-green-500/30 text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-green-400">Compte lié !</h2>
            <p className="text-gray-400 mb-6">
              Votre compte est lié à Discord: <span className="text-white font-semibold">{discordUsername}</span>
            </p>
            
            <div className="bg-[#1a1a2e] rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                Avantages du lien
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✅ Rôles automatiques selon vos badges</li>
                <li>✅ Accès au classement Discord</li>
                <li>✅ Support prioritaire via tickets</li>
                <li>✅ Notifications de nouveaux défis</li>
              </ul>
            </div>

            <button
              onClick={unlinkAccount}
              disabled={loading}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <Unlink className="w-4 h-4" />
              {loading ? 'Traitement...' : 'Délier le compte'}
            </button>
          </motion.div>
        ) : (
          // Formulaire de liaison
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#12121a] rounded-xl p-8 border border-gray-800"
          >
            {/* Instructions */}
            <div className="bg-[#1a1a2e] rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-4 text-indigo-400">Comment lier votre compte :</h3>
              <ol className="text-gray-400 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>Rejoignez notre serveur Discord: <a href="https://discord.gg/maths-app" target="_blank" className="text-indigo-400 hover:underline">discord.gg/maths-app</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>Dans Discord, utilisez la commande <code className="bg-[#0a0a0f] px-2 py-0.5 rounded text-white">/link</code></span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>Copiez le code de 6 caractères reçu en MP</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>Collez le code ci-dessous</span>
                </li>
              </ol>
            </div>

            {/* Input du code */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Code de liaison (6 caractères)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="flex-1 bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3 text-white text-center tracking-widest font-mono text-lg focus:border-indigo-500 outline-none uppercase"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.readText().then(text => {
                        setLinkCode(text.trim().toUpperCase().slice(0, 6));
                      });
                    }}
                    className="bg-[#1a1a2e] hover:bg-[#252536] border border-gray-700 px-4 rounded-lg transition-colors"
                    title="Coller depuis le presse-papiers"
                  >
                    <Copy className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <button
                onClick={linkAccount}
                disabled={loading || linkCode.length !== 6}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Link2 className="w-5 h-5" />
                {loading ? 'Liaison en cours...' : 'Lier mon compte'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Résultat */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
              result.type === 'success'
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}
          >
            {result.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {result.message}
          </motion.div>
        )}
      </div>
    </div>
  );
}
