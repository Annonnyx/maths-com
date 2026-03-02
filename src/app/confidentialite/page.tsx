'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Mail, Users, AlertCircle } from 'lucide-react';

export default function ConfidentialitePage() {
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
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>Dernière mise à jour : 2 mars 2026 (v1.0) - Conforme RGPD</span>
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
            <h2 className="text-2xl font-bold mb-4">Identité du Responsable de Traitement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément au Règlement (UE) 2016/679 (RGPD) :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Nom du responsable</strong> : Noé BARNERON</li>
              <li><strong>Statut juridique</strong> : Particulier</li>
              <li><strong>Adresse e-mail</strong> : Annonyx.contact@gmail.com</li>
              <li><strong>Absence de DPO désigné</strong> : En tant que particulier, le responsable n'est pas tenu de désigner un Délégué à la Protection des Données</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Données Collectées</h2>
            
            <h3 className="text-xl font-semibold mb-3">Données fournies par l'utilisateur</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Adresse e-mail</li>
              <li>Pseudonyme</li>
              <li>Mot de passe chiffré (jamais stocké en clair)</li>
              <li>Âge (déclaration lors de l'inscription)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Données collectées automatiquement</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Adresse IP (anonymisée partiellement)</li>
              <li>Type et version du navigateur</li>
              <li>Système d'exploitation</li>
              <li>Horodatage des connexions</li>
              <li>Pages visitées et temps de consultation</li>
              <li>Version des CGU acceptée</li>
              <li>Case d'âge cochée</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Données relatives aux exercices</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Résultats aux exercices</li>
              <li>Scores obtenus</li>
              <li>Temps de réponse</li>
              <li>Progression dans les niveaux</li>
              <li>Badges obtenus</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Données NON collectées</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Aucune donnée de localisation GPS</li>
              <li>Aucune donnée de géolocalisation</li>
              <li>Aucune donnée biométrique</li>
              <li>Aucune donnée financière ou bancaire</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Bases Légales du Traitement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le traitement des données personnelles est fondé sur les bases légales suivantes :
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Exécution du contrat (Article 6.1.b du RGPD)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Le traitement est nécessaire à l'exécution du contrat d'utilisation du service, notamment pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Authentifier l'utilisateur</li>
              <li>Fournir les exercices personnalisés</li>
              <li>Maintenir le suivi de progression</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Intérêt légitime (Article 6.1.f du RGPD)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Le traitement poursuit les intérêts légitimes suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Assurer la sécurité du service et des données</li>
              <li>Améliorer les fonctionnalités et l'expérience utilisateur</li>
              <li>Établir des statistiques anonymisées</li>
              <li>Prévenir les fraudes et abus</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Durées de Conservation</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Données de compte</strong> : Durée de vie du compte + 30 jours</li>
              <li><strong>Logs de connexion</strong> : 1 an (conformément LCEN)</li>
              <li><strong>Cookies</strong> : Session (7 jours max), persistants (13 mois max)</li>
              <li><strong>Données anonymisées</strong> : Durée indéterminée</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Droits des Utilisateurs</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément aux articles 15 à 22 du RGPD, l'utilisateur dispose des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li><strong>Droit d'accès</strong> (Article 15)</li>
              <li><strong>Droit de rectification</strong> (Article 16)</li>
              <li><strong>Droit d'effacement</strong> (Article 17)</li>
              <li><strong>Droit de limitation</strong> (Article 18)</li>
              <li><strong>Droit de portabilité</strong> (Article 20)</li>
              <li><strong>Droit d'opposition</strong> (Article 21)</li>
              <li><strong>Droit de retrait du consentement</strong></li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Contact pour l'exercice des droits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour exercer ces droits, l'utilisateur doit contacter le responsable à l'adresse :
            </p>
            <div className="bg-muted rounded-lg p-4 mt-4">
              <p className="font-mono text-center text-primary">Annonyx.contact@gmail.com</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Le responsable s'engage à répondre dans un délai maximal de 30 jours conformément à l'article 12.3 du RGPD.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              En cas de réponse insatisfaisante, l'utilisateur dispose d'un droit de recours auprès de la CNIL.
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
