import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Vérifie si l'utilisateur est administrateur
 * @param email - Email de l'utilisateur (optionnel)
 * @returns boolean - true si l'utilisateur est admin
 */
export async function isAdmin(email?: string): Promise<boolean> {
  // Si email fourni, vérifier directement
  if (email) {
    return email === 'noe.barneron@gmail.com';
  }

  // Sinon, vérifier depuis la session
  const session = await getServerSession(authOptions);
  return session?.user?.email === 'noe.barneron@gmail.com';
}

/**
 * Vérifie si l'utilisateur courant est administrateur
 * Pour utiliser dans les composants client
 * @param session - Session NextAuth
 * @returns boolean - true si l'utilisateur est admin
 */
export function isAdminSession(session: any): boolean {
  return session?.user?.email === 'noe.barneron@gmail.com';
}

/**
 * Middleware pour protéger les routes admin
 * @param session - Session NextAuth
 * @returns boolean - true si accès autorisé
 */
export function requireAdmin(session: any): boolean {
  return !!session?.user && session.user.email === 'noe.barneron@gmail.com';
}

// Email admin principal (pour configuration future)
export const ADMIN_EMAIL = 'noe.barneron@gmail.com';

// Liste des emails admin (pour configuration future)
export const ADMIN_EMAILS = [
  'noe.barneron@gmail.com',
  // Ajouter d'autres admins ici si nécessaire
];
