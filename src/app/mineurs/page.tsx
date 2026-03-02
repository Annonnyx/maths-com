'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, Users, AlertCircle, Mail } from 'lucide-react';

export default function MineursPage() {
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
            <h1 className="text-3xl font-bold">Protection des Mineurs</h1>
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
            <h2 className="text-2xl font-bold mb-4">Âge Minimum et Base Légale</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément à l'article 45 de la loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés, l'accès au service est réservé aux personnes âgées d'au moins 15 ans.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Toute déclaration fausse sur l'âge constitue une infraction pénale passible des sanctions prévues par l'article 226-4-1 du Code pénal.
            </p>

            <h2 className="text-2xl font-bold mb-4">Mécanisme de Vérification</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lors du processus d'inscription, l'utilisateur est confronté à une case obligatoire non pré-cochée :
            </p>
            <div className="bg-muted rounded-lg p-4 mt-4">
              <p className="font-semibold text-center">
                "Je certifie avoir au moins 15 ans et accepter les Conditions Générales d'Utilisation"
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Cette déclaration est enregistrée dans la base de données avec :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>L'horodatage précis de la validation</li>
              <li>L'adresse IP de l'utilisateur (anonymisée partiellement)</li>
              <li>La version des CGU acceptées</li>
              <li>L'état de la case d'âge (cochée)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Cette déclaration constitue une vérification sur l'honneur jugée "raisonnable" par la CNIL.
            </p>

            <h2 className="text-2xl font-bold mb-4">Procédure Parentale</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour les utilisateurs mineurs de 15 à 18 ans, l'accès au service nécessite l'autorisation préalable d'un titulaire de l'autorité parentale.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              En cas de découverte d'un utilisateur mineur non autorisé :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Le compte est immédiatement suspendu</li>
              <li>Les responsables légaux sont informés dans les plus brefs délais</li>
              <li>L'utilisateur mineur ne peut plus accéder au service</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Contact des responsables légaux</h3>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question relative à la protection des mineurs ou pour exercer les droits parentaux :
            </p>
            <div className="bg-muted rounded-lg p-4 mt-4">
              <p className="font-mono text-center text-primary">Annonyx.contact@gmail.com</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Objet à mentionner</strong> : "Protection mineur - Maths-app.com"
            </p>

            <h3 className="text-xl font-semibold mb-3">Délai de traitement</h3>
            <p className="text-muted-foreground leading-relaxed">
              Le responsable s'engage à traiter toute demande relative à un mineur dans un délai maximum de 30 jours à compter de la réception de l'email.
            </p>

            <h3 className="text-xl font-semibold mb-3">Absence de justificatif lourd</h3>
            <p className="text-muted-foreground leading-relaxed">
              Conformément aux recommandations de la CNIL, aucune pièce d'identité officielle (CNI, passeport, livret de famille) n'est requise pour la procédure parentale. Une simple déclaration sur l'honneur suffit.
            </p>

            <h2 className="text-2xl font-bold mb-4">Publicité et Mineurs</h2>
            <p className="text-muted-foreground leading-relaxed">
              Aucun cookie publicitaire ni aucune publicité ciblée n'est déployé pour les utilisateurs identifiés comme mineurs.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le service ne collecte aucune donnée à des fins de publicité ciblée sur les mineurs. Les publicités éventuellement affichées sont basées sur le contexte général et non sur le profil comportemental.
            </p>

            <h2 className="text-2xl font-bold mb-4">Bouton "Responsable Légal"</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un bouton "Responsable légal" est accessible depuis :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Le footer du site</li>
              <li>La page profil de l'utilisateur</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Ce bouton redirige vers la page de contact avec une explication détaillée de la procédure parentale et un lien direct vers l'adresse email : Annonyx.contact@gmail.com
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
