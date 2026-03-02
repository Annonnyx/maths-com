'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, FileText, Building, Globe, Mail, Shield, AlertCircle } from 'lucide-react';

export default function MentionsLegalesPage() {
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
            <h1 className="text-3xl font-bold">Mentions Légales</h1>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>Conformes à la loi n°2004-575 du 21 juin 2004</span>
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
            <h2 className="text-2xl font-bold mb-4">Éditeur du Service</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground"><strong>Nom</strong></p>
                  <p className="text-foreground">Noé BARNERON</p>
                </div>
                <div>
                  <p className="text-muted-foreground"><strong>Statut</strong></p>
                  <p className="text-foreground">Particulier</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground"><strong>Qualité</strong></p>
                  <p className="text-foreground">Particulier (personne physique, non-professionnel)</p>
                </div>
                <div>
                  <p className="text-muted-foreground"><strong>Pays de résidence</strong></p>
                  <p className="text-foreground">France</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground"><strong>Adresse e-mail</strong></p>
                <p className="text-foreground">Annonyx.contact@gmail.com</p>
              </div>
              <div>
                <p className="text-muted-foreground"><strong>Adresse postale</strong></p>
                <p className="text-foreground">Particulier – adresse postale non communiquée (disponible sur demande motivée)</p>
              </div>
            </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Directeur de la Publication</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground"><strong>Nom</strong></p>
                  <p className="text-foreground">Noé BARNERON</p>
                </div>
                <div>
                  <p className="text-muted-foreground"><strong>Qualité</strong></p>
                  <p className="text-foreground">Particulier agissant en nom propre</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground"><strong>Coordonnées</strong></p>
                <p className="text-foreground">Identiques à celles de l'éditeur</p>
              </div>
            </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Hébergeur</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground"><strong>Nom</strong></p>
                  <p className="text-foreground">Vercel Inc.</p>
                </div>
                <div>
                  <p className="text-muted-foreground"><strong>Adresse</strong></p>
                  <p className="text-foreground">440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground"><strong>Téléphone</strong></p>
                <p className="text-foreground">Non communiqué</p>
              </div>
              <div>
                <p className="text-muted-foreground"><strong>Site web</strong></p>
                <a 
                  href="https://vercel.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  https://vercel.com
                </a>
              </div>
            </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Base de Données</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground"><strong>Nom</strong></p>
                  <p className="text-foreground">Supabase</p>
                </div>
                <div>
                  <p className="text-muted-foreground"><strong>Adresse</strong></p>
                  <p className="text-foreground">Irlande, Union Européenne</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground"><strong>Site web</strong></p>
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  https://supabase.com
                </a>
              </div>
            </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Propriété Intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'ensemble des contenus du site Maths-app.com est protégé par le droit de la propriété intellectuelle.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Tous droits réservés. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable de l'éditeur.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le code source de l'application reste la propriété exclusive de l'éditeur.
            </p>

            <h2 className="text-2xl font-bold mb-4">Données Personnelles</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les données personnelles collectées font l'objet d'un traitement conforme au Règlement (UE) 2016/679 du 27 avril 2016 (RGPD).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Pour plus d'informations sur le traitement de vos données personnelles, veuillez consulter la{' '}
              <Link 
                href="/confidentialite" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Politique de Confidentialité
              </Link>
              {' '}disponible à l'adresse : https://maths-app.com/confidentialite
            </p>

            <h2 className="text-2xl font-bold mb-4">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le site utilise des cookies. Pour plus d'informations, veuillez consulter la{' '}
              <Link 
                href="/cookies" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Politique de Cookies
              </Link>
              {' '}disponible à l'adresse : https://maths-app.com/cookies
            </p>

            <h2 className="text-2xl font-bold mb-4">Médiation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément à l'article L. 612-1 du Code de la consommation, tout consommateur a le droit de recourir gratuitement à un médiateur de la consommation.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              En cas de litige non résolu avec le service client, l'utilisateur peut saisir la plateforme de médiation européenne :
            </p>
            <div className="bg-muted rounded-lg p-4 mt-4">
              <a 
                href="https://ec.europa.eu/consumers/odr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>https://ec.europa.eu/consumers/odr</span>
              </a>
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
