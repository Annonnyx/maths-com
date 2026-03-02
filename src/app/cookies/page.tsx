/**
 * Page de gestion des préférences de cookies
 * Conforme CNIL délibération 2020-091 et RGPD
 * Maths-app.com - v1.0 - 2 mars 2026
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Cookie, Settings, Shield, Trash2, Check, X } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { getConsent } from '@/lib/cookies-consent';
import ToggleSwitch from '@/components/ToggleSwitch';

export default function CookiesPage() {
  const { consent, updateConsent, revokeAllConsent, isAdvertisingAllowed, isAnalyticsAllowed } = useCookieConsent();
  const [preferences, setPreferences] = useState({
    analytics: false,
    advertising: false
  });
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  useEffect(() => {
    if (consent) {
      setPreferences({
        analytics: consent.analytics,
        advertising: consent.advertising
      });
    }
  }, [consent]);

  const handleSavePreferences = () => {
    updateConsent(preferences);
    setShowRevokeConfirm(false);
  };

  const handleRevokeAll = () => {
    revokeAllConsent();
    setPreferences({ analytics: false, advertising: false });
    setShowRevokeConfirm(false);
  };

  const togglePreference = (key: 'analytics' | 'advertising') => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const cookiesList = [
    {
      name: 'Cookies de session',
      provider: 'Maths-app.com',
      purpose: 'Maintenir votre connexion et préserver vos préférences',
      duration: 'Session ou 7 jours',
      category: 'necessary',
      required: true
    },
    {
      name: 'Cookie de consentement',
      provider: 'Maths-app.com',
      purpose: 'Mémoriser vos choix en matière de cookies',
      duration: '6 mois',
      category: 'necessary',
      required: true
    },
    {
      name: 'Cookies Google AdSense',
      provider: 'Google LLC',
      purpose: 'Afficher des publicités personnalisées selon vos centres d\'intérêt',
      duration: 'Jusqu\'à 13 mois',
      category: 'advertising',
      required: false,
      link: 'https://policies.google.com/privacy'
    },
    {
      name: 'Cookies analytiques',
      provider: 'Maths-app.com',
      purpose: 'Nous aider à comprendre comment vous utilisez le site pour l\'améliorer',
      duration: 'Session ou 30 jours',
      category: 'analytics',
      required: false
    }
  ];

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Gestion des Cookies</h1>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings className="w-4 h-4" />
              <span>Conforme CNIL délibération 2020-091</span>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Tableau récapitulatif */}
          <div className="bg-card border border-border rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Cookies utilisés sur Maths-app.com</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold text-foreground">Nom du cookie</th>
                    <th className="text-left p-3 font-semibold text-foreground">Fournisseur</th>
                    <th className="text-left p-3 font-semibold text-foreground">Finalité</th>
                    <th className="text-left p-3 font-semibold text-foreground">Durée de conservation</th>
                    <th className="text-left p-3 font-semibold text-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {cookiesList.map((cookie, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="p-3 text-foreground">{cookie.name}</td>
                      <td className="p-3 text-foreground">
                        {cookie.link ? (
                          <a 
                            href={cookie.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {cookie.provider}
                          </a>
                        ) : (
                          cookie.provider
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{cookie.purpose}</td>
                      <td className="p-3 text-muted-foreground">{cookie.duration}</td>
                      <td className="p-3">
                        {cookie.required ? (
                          <span className="inline-flex items-center gap-2 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                            <Shield className="w-3 h-3" />
                            Requis
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${
                            preferences[cookie.category as keyof typeof preferences] 
                              ? 'bg-green-500/10 text-green-400' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {preferences[cookie.category as keyof typeof preferences] ? (
                              <>
                                <Check className="w-3 h-3" />
                                Activé
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" />
                                Désactivé
                              </>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panneau de contrôle */}
          <div className="bg-card border border-border rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Vos préférences</h2>
            
            <div className="space-y-6">
              {/* Cookies nécessaires - toujours activés */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Cookies nécessaires</p>
                    <p className="text-sm text-muted-foreground">
                      Essentiels au fonctionnement du site (toujours activés)
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                  <Shield className="w-3 h-3 inline mr-1" />
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
                <ToggleSwitch
                  checked={preferences.analytics}
                  onChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked }))}
                />
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
                <ToggleSwitch
                  checked={preferences.advertising}
                  onChange={(checked) => setPreferences(prev => ({ ...prev, advertising: checked }))}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Enregistrer mes choix
              </button>
              
              <button
                onClick={() => setShowRevokeConfirm(true)}
                className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-semibold hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Tout révoquer
              </button>
            </div>
          </div>

          {/* Informations sur le consentement actuel */}
          {consent && (
            <div className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Votre consentement actuel</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Version des CGU</p>
                  <p className="font-medium text-foreground">{consent.version}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Date du consentement</p>
                  <p className="font-medium text-foreground">
                    {new Date(consent.date).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Confirmation de révocation */}
        <AnimatePresence>
          {showRevokeConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border rounded-xl p-8 max-w-md w-full"
              >
                <h3 className="text-xl font-bold mb-4">Confirmer la révocation</h3>
                <p className="text-muted-foreground mb-6">
                  Êtes-vous sûr de vouloir révoquer l'ensemble de vos consentements ? 
                  Cela désactivera les cookies analytiques et publicitaires.
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowRevokeConfirm(false)}
                    className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleRevokeAll}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Confirmer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
