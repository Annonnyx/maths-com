/**
 * Composant bandeau de gestion des cookies
 * Conforme CNIL délibération 2020-091
 * Maths-app.com - v1.0 - 2 mars 2026
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Shield, Cookie } from 'lucide-react';
import { getConsent, setConsent, hasConsent, CookiePreferences } from '@/lib/cookies-consent';

interface CookieBannerProps {
  className?: string;
}

export default function CookieBanner({ className = '' }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    analytics: false,
    advertising: false
  });

  useEffect(() => {
    // Ne montrer le bandeau que si pas de consentement valide
    if (!hasConsent()) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      analytics: true,
      advertising: true
    };
    setPreferences(allPreferences);
    setConsent(allPreferences);
    setIsVisible(false);
  };

  const handleAcceptNecessaryOnly = () => {
    const necessaryOnlyPreferences: CookiePreferences = {
      analytics: false,
      advertising: false
    };
    setPreferences(necessaryOnlyPreferences);
    setConsent(necessaryOnlyPreferences);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    setConsent(preferences);
    setIsVisible(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay semi-transparent */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      
      {/* Bandeau principal */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl z-50 ${className}`}
      >
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Icône et texte principal */}
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Nous utilisons des cookies pour améliorer votre expérience
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Les cookies nécessaires au fonctionnement du site sont toujours activés. 
                  Les cookies analytiques et publicitaires nécessitent votre consentement.
                </p>
              </div>
            </div>

            {/* Boutons principaux */}
            <div className="flex flex-col sm:flex-row gap-3 min-w-0">
              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Tout accepter
              </button>
              <button
                onClick={handleAcceptNecessaryOnly}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors whitespace-nowrap"
              >
                Tout refuser
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-3 bg-card border border-border rounded-lg font-semibold hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Personnaliser
              </button>
            </div>
          </div>

          {/* Vue détaillée */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-4">
                    Gérez vos préférences de cookies
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Cookies nécessaires */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Cookies nécessaires</p>
                          <p className="text-sm text-muted-foreground">
                            Essentiels au fonctionnement du site
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                        Requis
                      </div>
                    </div>

                    {/* Cookies analytiques */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5" />
                        <div>
                          <p className="font-medium text-foreground">Cookies analytiques</p>
                          <p className="text-sm text-muted-foreground">
                            Nous aident à améliorer le site
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePreference('analytics')}
                        disabled={true} // Les nécessaires sont toujours activés
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                        style={{
                          backgroundColor: preferences.analytics ? 'rgb(34 197 94)' : 'rgb(107 114 128)'
                        }}
                      >
                        <span
                          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          style={{
                            transform: preferences.analytics ? 'translateX(1.25rem)' : 'translateX(0.125rem)'
                          }}
                        />
                      </button>
                    </div>

                    {/* Cookies publicitaires */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5" />
                        <div>
                          <p className="font-medium text-foreground">Cookies publicitaires</p>
                          <p className="text-sm text-muted-foreground">
                            Pour afficher des publicités pertinentes
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePreference('advertising')}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                        style={{
                          backgroundColor: preferences.advertising ? 'rgb(34 197 94)' : 'rgb(107 114 128)'
                        }}
                      >
                        <span
                          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          style={{
                            transform: preferences.advertising ? 'translateX(1.25rem)' : 'translateX(0.125rem)'
                          }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Bouton d'enregistrement */}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleSavePreferences}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Enregistrer mes choix
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
