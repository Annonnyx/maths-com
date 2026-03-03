/**
 * Modal de vérification d'âge pour connexions OAuth
 * Maths-app.com - v1.0 - 3 mars 2026
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgeVerificationModal({ isOpen, onClose }: AgeVerificationModalProps) {
  const [isOver15, setIsOver15] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleAccept = async () => {
    if (!isOver15) return;
    
    setIsLoading(true);
    
    try {
      // Marquer l'utilisateur comme ayant vérifié son âge
      // On pourrait stocker cela en base de données ou dans un cookie sécurisé
      
      // Rediriger vers le dashboard ou la page d'onboarding
      router.push('/test?onboarding=true');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    // Déconnecter l'utilisateur s'il refuse la certification
    await signOut({ redirect: false });
    router.push('/');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#12121a] border border-border rounded-2xl p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Vérification d'âge requise
                </h2>
                <p className="text-muted-foreground">
                  Bienvenue {session?.user?.displayName || session?.user?.username || session?.user?.email} !
                </p>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-400 font-medium mb-1">
                      Obligation légale
                    </p>
                    <p className="text-muted-foreground">
                      Conformément à nos conditions générales d'utilisation, 
                      l'accès à Maths-app.com est réservé aux personnes de plus de 15 ans.
                    </p>
                  </div>
                </div>
              </div>

              {/* Certification */}
              <div className="space-y-4 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOver15}
                    onChange={(e) => setIsOver15(e.target.checked)}
                    className="mt-1 w-4 h-4 text-indigo-500 bg-card border-border rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    Je certifie être âgé(e) de plus de 15 ans et avoir lu et accepté les{' '}
                    <Link href="/cgu" className="text-indigo-400 hover:text-indigo-300 underline">
                      conditions générales d'utilisation
                    </Link>
                    {' '}et la{' '}
                    <Link href="/confidentialite" className="text-indigo-400 hover:text-indigo-300 underline">
                      politique de confidentialité
                    </Link>
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleAccept}
                  disabled={!isOver15 || isLoading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Continuer sur Maths-app'
                  )}
                </button>
                
                <button
                  onClick={handleReject}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all"
                >
                  Je n'ai pas 15 ans
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={handleReject}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
