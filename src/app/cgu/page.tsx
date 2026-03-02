'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, FileText, Shield, Users, AlertCircle } from 'lucide-react';

export default function CGUPage() {
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
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Conditions Générales d'Utilisation</h1>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>Dernière mise à jour : 2 mars 2026 (v1.0)</span>
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
            <h2 className="text-2xl font-bold mb-4">Préambule</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'accès et l'utilisation du service Maths-app.com, édité par M. Noé BARNERON, particulier résidant en France.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le service Maths-app.com est une plateforme éducative en ligne permettant aux utilisateurs de s'entraîner au calcul mental à travers des exercices adaptatifs et gamifiés. L'accès au service est gratuit et ne requiert aucune installation préalable.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              L'utilisation du service vaut acceptation pleine et entière des présentes CGU par l'utilisateur.
            </p>

            <h2 className="text-2xl font-bold mb-4">Article 1 — Objet du Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Maths-app.com est une application web éducative proposant :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
              <li>Des exercices de calcul mental adaptatifs</li>
              <li>Un système de progression par niveaux</li>
              <li>Des fonctionnalités de multijoueur</li>
              <li>Un suivi statistique des performances</li>
              <li>Des badges et récompenses</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Le service est actuellement fourni gratuitement. L'éditeur se réserve le droit d'introduire à l'avenir des fonctionnalités payantes, lesquelles feront l'objet d'une modification des présentes CGU et d'une information préalable des utilisateurs.
            </p>

            <h2 className="text-2xl font-bold mb-4">Article 2 — Conditions d'âge et protection des mineurs</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément à l'article 45 de la loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés, l'accès au service est réservé aux personnes âgées d'au moins 15 ans.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Lors de l'inscription, l'utilisateur doit obligatoirement cocher la case : <strong>"Je certifie avoir au moins 15 ans et accepter les CGU"</strong>. Cette case ne peut être pré-cochée.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              En cas de découverte d'un utilisateur mineur de moins de 15 ans ayant créé un compte sans autorisation parentale, l'éditeur procédera immédiatement à la suspension du compte.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Pour les utilisateurs mineurs de 15 à 18 ans, l'accès au service est subordonné à l'autorisation préalable d'un titulaire de l'autorité parentale.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              En cas de suspension du compte d'un mineur, les responsables légaux disposent d'un délai de 30 jours pour régulariser la situation en contactant l'éditeur à l'adresse <strong>Annonyx.contact@gmail.com</strong>.
            </p>

            <h2 className="text-2xl font-bold mb-4">Article 3 — Propriété Intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'ensemble des contenus présents sur Maths-app.com (textes, graphismes, logos, exercices, algorithmes, structure du site) est protégé par le droit de la propriété intellectuelle.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              L'utilisateur obtient un droit d'usage personnel, non exclusif et non transférable des contenus du service aux seules fins de son utilisation conforme aux présentes CGU.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Toute reproduction, représentation, modification, adaptation, traduction, distribution ou exploitation des contenus, par quelque procédé que ce soit, sans autorisation écrite préalable de l'éditeur, est strictement interdite et constitue une contrefaçon.
            </p>

            <h2 className="text-2xl font-bold mb-4">Article 4 — Responsabilité Limitée</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le service est fourni "en l'état". L'éditeur ne garantit pas que le fonctionnement du service sera ininterrompu ou exempt d'erreurs.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              L'éditeur ne pourra être tenu pour responsable des dommages directs ou indirects, matériels ou immatériels, résultant de l'utilisation ou de l'impossibilité d'utiliser le service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La responsabilité de l'éditeur est limitée aux dommages directs prouvés résultant d'une faute lourde de sa part. En aucun cas, la responsabilité de l'éditeur ne pourra excéder le montant payé par l'utilisateur, le cas échéant, pour l'accès au service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              L'éditeur décline toute responsabilité pour les contenus provenant de tiers vers lesquels le service pourrait contenir des liens.
            </p>

            <h2 className="text-2xl font-bold mb-4">Article 5 — Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question relative aux présentes CGU, vous pouvez contacter l'éditeur à l'adresse :
            </p>
            <div className="bg-muted rounded-lg p-4 mt-4">
              <p className="font-mono text-center text-primary">Annonyx.contact@gmail.com</p>
            </div>

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
