'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Cookie, Settings, AlertCircle, ExternalLink } from 'lucide-react';

export default function CookiesPage() {
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
            <h1 className="text-3xl font-bold">Politique de Cookies</h1>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>Dernière mise à jour : 2 mars 2026 (v1.0) - Conforme CNIL</span>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-invert max-w-none"
        >
          <div className="bg-card border border-border rounded-xl p-8 space-y-8">
            <h2 className="text-2xl font-bold mb-4">Qu'est-ce qu'un cookie ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) lors de la consultation d'un service en ligne. 
              Il permet de conserver des informations techniques et personnelles sur vos visites.
            </p>

            <h2 className="text-2xl font-bold mb-4">Cookies Utilisés</h2>
            
            <h3 className="text-xl font-semibold mb-3">Cookies strictement nécessaires (exemptés de consentement)</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Cookie de session Supabase</strong> : Maintient votre connexion active pendant votre visite. Durée : session ou 7 jours maximum.</li>
              <li><strong>Cookie de mémorisation du consentement</strong> : Enregistre vos choix en matière de cookies. Durée : 6 mois maximum.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Ces cookies sont indispensables au fonctionnement du service et ne peuvent être désactivés.
            </p>

            <h3 className="text-xl font-semibold mb-3">Cookies publicitaires (consentement requis)</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Google AdSense</strong> : Permet l'affichage de publicités personnalisées selon vos centres d'intérêt. Durée maximale : 13 mois.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Ces cookies ne sont chargés qu'après votre consentement explicite via le bandeau de cookies.
            </p>

            <h2 className="text-2xl font-bold mb-4">Recueil du Consentement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lors de votre première visite, un bandeau d'information s'affiche vous informant de l'utilisation de cookies et vous proposant les choix suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Bouton "Accepter"</strong> : Accepte tous les cookies (nécessaires + publicitaires)</li>
              <li><strong>Bouton "Refuser"</strong> : N'accepte que les cookies strictement nécessaires</li>
              <li><strong>Lien "Personnaliser"</strong> : Permet de choisir individuellement chaque catégorie de cookies</li>
            </ul>
            
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mt-4">
              <p className="text-yellow-400 font-semibold mb-2">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Point important
              </p>
              <p className="text-yellow-300 leading-relaxed">
                Les scripts Google AdSense ne sont chargés qu'après avoir cliqué sur le bouton "Accepter". 
                Aucune publicité n'est affichée avant votre consentement explicite.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4">Durées de Conservation</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Cookies de session</strong> : Durée de la session ou 7 jours maximum</li>
              <li><strong>Cookies persistants</strong> : Maximum 13 mois conformément aux recommandations de la CNIL</li>
              <li><strong>Cookie de consentement</strong> : 6 mois maximum</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Gestion des Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vous pouvez à tout moment :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Accepter ou refuser</strong> les cookies via le bandeau d'information</li>
              <li><strong>Modifier vos préférences</strong> via les paramètres de votre navigateur</li>
              <li><strong>Supprimer les cookies</strong> stockés sur votre terminal</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Liens utiles pour la gestion des cookies</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Google Chrome</strong> : chrome://settings/cookies</li>
              <li><strong>Mozilla Firefox</strong> : about:preferences#privacy</li>
              <li><strong>Safari</strong> : safari://preferences/privacy</li>
              <li><strong>Microsoft Edge</strong> : edge://settings/cookies</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Opt-out Publicitaire</h2>
            <p className="text-muted-foreground leading-relaxed">
              Si vous ne souhaitez plus recevoir de publicités personnalisées basées sur votre navigation :
            </p>
            <div className="bg-muted rounded-lg p-4 mt-4">
              <a 
                href="https://www.google.com/settings/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>https://www.google.com/settings/ads</span>
              </a>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Ce paramètre s'applique à l'ensemble des sites utilisant les services publicitaires Google.
            </p>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Version :</strong> v1.0 – 2 mars 2026
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
