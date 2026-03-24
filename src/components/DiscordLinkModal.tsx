'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Shield, CheckCircle, AlertCircle, Copy, RefreshCw } from 'lucide-react';

interface DiscordLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLinked?: boolean;
  onLinkSuccess?: () => void;
}

export function DiscordLinkModal({ isOpen, onClose, isLinked = false, onLinkSuccess }: DiscordLinkModalProps) {
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Générer un code de liaison
  const generateCode = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedCode('');

    try {
      const response = await fetch('/api/discord/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId: 'pending' })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCode(data.code);
        setError(null);
      } else {
        setError(data.error || 'Erreur lors de la génération du code');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDiscord = () => {
    window.open('https://discord.gg/HxaakFZAZG', '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Lier compte Discord</h2>
                <p className="text-sm text-muted-foreground">
                  {isLinked ? 'Gérer la liaison' : 'Connecte ton compte Discord'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                Compte lié avec succès !
              </h3>
              <p className="text-muted-foreground">
                Ton compte Discord est maintenant connecté à Maths-App.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Instructions */}
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Comment ça marche ?
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>Clique sur "Générer un code" ci-dessous</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Rejoins notre serveur Discord</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Fais la commande <code className="bg-card px-2 py-1 rounded text-xs">/link code:{generatedCode || 'ABC123'}</code> dans le Discord</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                    <span>Ton compte sera automatiquement lié !</span>
                  </li>
                </ol>
              </div>

              {/* Generate Code Button */}
              {!generatedCode && !isLinked && (
                <button
                  onClick={generateCode}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors mb-6"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Génération en cours...' : 'Générer un code de liaison'}
                </button>
              )}

              {/* Generated Code Display */}
              {generatedCode && !isLinked && (
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/50 rounded-xl p-6 mb-6 text-center">
                  <h3 className="text-lg font-semibold mb-3 text-indigo-400">Ton code de liaison :</h3>
                  <div className="bg-card rounded-lg p-4 mb-4">
                    <div className="text-2xl font-mono tracking-widest text-white font-bold">
                      {generatedCode}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedCode)}
                      className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copier
                    </button>
                    <button
                      onClick={generateCode}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Nouveau code
                    </button>
                  </div>
                </div>
              )}

              {/* Join Discord Button */}
              <button
                onClick={handleOpenDiscord}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors mb-6"
              >
                <ExternalLink className="w-4 h-4" />
                Rejoindre le Discord
              </button>

              {isLinked && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-green-400 font-medium">Compte déjà lié</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ton compte Discord est déjà connecté à Maths-App.
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
