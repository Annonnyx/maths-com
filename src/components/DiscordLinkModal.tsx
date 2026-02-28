'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface DiscordLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLinked?: boolean;
  onLinkSuccess?: () => void;
}

export function DiscordLinkModal({ isOpen, onClose, isLinked = false, onLinkSuccess }: DiscordLinkModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/discord/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setCode('');
        onLinkSuccess?.();
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        setError(data.error || 'Erreur lors de la liaison du compte');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
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
                    <span>Rejoins notre serveur Discord</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Fais la commande <code className="bg-card px-2 py-1 rounded text-xs">/link</code> dans le Discord</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Entre le code reçu ci-dessous</span>
                  </li>
                </ol>
              </div>

              {/* Join Discord Button */}
              <button
                onClick={handleOpenDiscord}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors mb-6"
              >
                <ExternalLink className="w-4 h-4" />
                Rejoindre le Discord
              </button>

              {/* Code Input Form */}
              {!isLinked && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium mb-2">
                      Code de liaison
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-center text-lg font-mono tracking-wider"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Le code fait 6 caractères et est valide 15 minutes
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Vérification...
                      </div>
                    ) : (
                      'Valider le code'
                    )}
                  </button>
                </form>
              )}

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
