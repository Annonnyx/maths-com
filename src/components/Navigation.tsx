'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Home, LayoutDashboard, Trophy, Users, BookOpen, 
  User, LogOut, Menu, X, Settings, Target, Bell, GraduationCap
} from 'lucide-react';
import { useNotifications } from '@/components/NotificationToast';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { unreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Éviter l'erreur pendant le SSR
  if (typeof window === 'undefined') {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  // Navigation conditionnelle selon le rôle de l'utilisateur
  const navigation = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Tests', href: '/test', icon: Target },
    { name: 'Multijoueur', href: '/multiplayer', icon: Users },
    { name: 'Cours', href: '/courses', icon: BookOpen },
    // Bouton conditionnel pour les classes
    ...(session?.user?.isTeacher || (session?.user as any)?.isAdmin ? [
      { name: 'Mes classes', href: '/class-management', icon: GraduationCap }
    ] : [
      { name: 'Ma classe', href: '/class-management', icon: GraduationCap }
    ]),
    { name: 'Classement', href: '/leaderboard', icon: Trophy },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-foreground hover:text-purple-400 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-foreground font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-xl">maths-app.com</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-purple-500/20 text-purple-400 border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-border'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {session ? (
                <div className="flex items-center gap-3">
                  {/* Notifications */}
                  <Link
                    href="/notifications"
                    className="relative flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-border rounded-lg transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 bg-border hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm">Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 bg-border hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Profil</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Déconnexion</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-foreground rounded-lg font-medium transition-all"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-border hover:bg-muted text-foreground rounded-lg font-medium transition-all"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-foreground hover:text-purple-400 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-foreground font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-xl">maths-app.com</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-purple-500/20 text-purple-400 border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-border'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-border pt-3 mt-3 space-y-1">
                {session ? (
                  <>
                    {/* Notifications */}
                    <Link
                      href="/notifications"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-foreground hover:bg-border transition-all relative"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-foreground hover:bg-border transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-foreground hover:bg-border transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Profil</span>
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 bg-purple-500 hover:bg-purple-600 text-foreground rounded-lg font-medium transition-all text-center"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 bg-border hover:bg-[#3a3a4a] text-foreground rounded-lg font-medium transition-all text-center"
                    >
                      Inscription
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-16"></div>
    </>
  );
}
