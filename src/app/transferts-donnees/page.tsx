'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Database, Globe, Shield, AlertCircle, ExternalLink } from 'lucide-react';

export default function TransfertsDonneesPage() {
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
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Transferts de Données hors UE</h1>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>Clause spécifique - v1.0 – 2 mars 2026</span>
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
            <h2 className="text-2xl font-bold mb-4">Contexte et Sous-traitants Identifiés</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le service Maths-app.com utilise les sous-traitants suivants implantés hors de l'Union Européenne :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Vercel Inc.</strong> (États-Unis) : Hébergement et infrastructure</li>
              <li><strong>Google LLC</strong> (États-Unis) : Services d'authentification OAuth2 et publicité AdSense</li>
              <li><strong>Discord Inc.</strong> (États-Unis) : Services d'authentification OAuth2</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Garanties Applicables</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les transferts de données vers ces sous-traitants sont encadrés par :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Les Clauses Contractuelles Types (CCT) conformes à la décision d'exécution de la Commission européenne 2021/914 du 4 juin 2021</li>
              <li>Le Règlement (UE) 2016/679 (RGPD)</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Données Concernées par les Transferts</h2>
            
            <h3 className="text-xl font-semibold mb-3">Données transférées vers Vercel</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Adresse IP (anonymisée)</li>
              <li>Données de navigation (navigateur, système d'exploitation)</li>
              <li>Logs techniques et de sécurité</li>
              <li>Métadonnées des requêtes HTTP</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Données transférées vers Google</h3>
            <p className="text-muted-foreground leading-relaxed">
              Uniquement après consentement explicite de l'utilisateur :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Adresse e-mail (pour OAuth2)</li>
              <li>Identifiants publicitaires (cookies AdSense)</li>
              <li>Données de profil publicitaire (limitées et anonymisées)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Données transférées vers Discord</h3>
            <p className="text-muted-foreground leading-relaxed">
              Uniquement après consentement explicite de l'utilisateur :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Adresse e-mail (pour OAuth2)</li>
              <li>Pseudonyme Discord</li>
              <li>Avatar Discord</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Données NON transférées hors UE</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Données de la base de données principale Supabase (hébergée en Irlande, UE)</li>
              <li>Résultats aux exercices et statistiques (conservées en Irlande, UE)</li>
              <li>Contenu des messages et communications (conservés en Irlande, UE)</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Droits des Utilisateurs</h2>
            <p className="text-muted-foreground leading-relaxed">
              En cas de transfert de données vers des sous-traitants non-européens, l'utilisateur conserve l'ensemble de ses droits RGPD :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Droit de retrait du consentement</strong> : Le retrait du consentement cookies entraîne immédiatement la cessation des transferts publicitaires vers Google</li>
              <li><strong>Droit d'accès et de rectification</strong> : Via l'interface Google et Discord pour les données transférées</li>
              <li><strong>Droit de suppression du compte</strong> : La suppression entraîne la suppression des données chez tous les sous-traitants</li>
              <li><strong>Droit d'exercer un recours</strong> : Possibilité de saisir l'autorité de contrôle compétente</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Politiques de Confidentialité des Sous-traitants</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour plus d'informations sur le traitement de vos données par les sous-traitants :
            </p>
            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-4">
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Politique de confidentialité Google</span>
                </a>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <a 
                  href="https://discord.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Politique de confidentialité Discord</span>
                </a>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <a 
                  href="https://vercel.com/legal/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Politique de confidentialité Vercel</span>
                </a>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Mise à Jour</h2>
            <p className="text-muted-foreground leading-relaxed">
              La présente clause sera mise à jour en cas de modification des sous-traitants ou de leur localisation. Les utilisateurs seront informés de toute modification substantielle par email ou notification via le service.
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
