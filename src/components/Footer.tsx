'use client';

import Link from 'next/link';
import { Trophy, MessageCircle, Mail, Instagram } from 'lucide-react';

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
      { label: 'Contact', href: 'mailto:ballisos.contact@gmail.com' },
    ],
    legal: [
      { label: 'Confidentialité', href: '#' },
      { label: 'Conditions', href: '#' },
    ],
  };

  return (
    <footer className="border-t border-[#2a2a3a] bg-[#12121a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-indigo-400 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Math.com</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Plateforme d&apos;entraînement au calcul mental gamifiée. Le chess.com des maths !
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Créé par <span className="text-indigo-400 font-medium">Ballisos Studio</span>
            </p>
            <div className="flex gap-4">
              <a 
                href="https://discord.gg/FYbYK4nK7p" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#5865F2] hover:text-[#5865F2]/80 transition-colors"
                title="Discord Ballisos"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/ballisos_official/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#E4405F] hover:text-[#E4405F]/80 transition-colors"
                title="Instagram Ballisos"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="mailto:ballisos.contact@gmail.com" 
                className="text-gray-400 hover:text-white transition-colors"
                title="Email Ballisos"
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
                    className="text-gray-400 hover:text-white text-sm transition-colors"
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
                    className="text-gray-400 hover:text-white text-sm transition-colors"
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
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#2a2a3a] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Math.com. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-sm">
            Fait avec ❤️ par{' '}
            <a 
              href="https://www.instagram.com/ballisos_official/"
              target="_blank"
              rel="noopener noreferrer" 
              className="text-indigo-400 hover:text-indigo-300"
            >
              Ballisos Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
