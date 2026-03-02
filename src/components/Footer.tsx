'use client';

import Link from 'next/link';
import { Trophy, MessageCircle, Mail, Instagram, Cookie, FileText, Shield, Users } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Tests', href: '/test' },
      { label: 'Exercices', href: '/practice' },
      { label: 'Cours', href: '/courses' },
      { label: 'Classement', href: '/leaderboard' },
      { label: 'Amis', href: '/friends' },
      { label: 'Messages', href: '/messages' },
    ],
    support: [
      { label: 'Aide', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Contact', href: 'mailto:Annonyx.contact@gmail.com' },
    ],
    legal: [
      { label: 'CGU', href: '/cgu', icon: FileText },
      { label: 'Confidentialité', href: '/confidentialite', icon: Shield },
      { label: 'Mentions légales', href: '/mentions-legales' },
      { label: 'Protection mineurs', href: '/mineurs', icon: Users },
      { label: 'Transferts de données', href: '/transferts-donnees' },
      { label: 'Gérer mes cookies', href: '/cookies', icon: Cookie },
    ],
  };

  return (
    <footer className="border-t border-border bg-[#12121a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-indigo-400 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-foreground" />
              </div>
              <span className="font-bold text-lg">maths-app.com</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              Plateforme d&apos;entraînement au calcul mental gamifiée. Le chess.com des maths !
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              Créé par <span className="text-indigo-400 font-medium">Noé BARNERON</span>
            </p>
            <div className="flex gap-4">
              <a 
                href="https://discord.gg/FYbYK4nK7p" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#5865F2] hover:text-[#5865F2]/80 transition-colors"
                title="Discord Maths-app"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/maths_app_com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#E4405F] hover:text-[#E4405F]/80 transition-colors"
                title="Instagram Maths-app"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="mailto:Annonyx.contact@gmail.com" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Email Maths-app"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Produit</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2"
                  >
                    {link.icon && <link.icon className="w-3 h-3" />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} maths-app.com. Tous droits réservés.
          </p>
          <p className="text-muted-foreground text-sm">
            Conforme RGPD et CNIL - Version v1.0
          </p>
        </div>
      </div>
    </footer>
  );
}
