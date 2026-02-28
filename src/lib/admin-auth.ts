import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Email admin principal (depuis les variables d'environnement)
 */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'noe.barneron@gmail.com';

/**
 * Liste des emails admin (pour configuration future)
 */
export const ADMIN_EMAILS = process.env.ADMIN_EMAILS 
  ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim())
  : [ADMIN_EMAIL];

/**
 * Vérifie si l'utilisateur est administrateur
 * @param email - Email de l'utilisateur (optionnel)
 * @returns boolean - true si l'utilisateur est admin
 */
export async function isAdmin(email?: string): Promise<boolean> {
  // Si email fourni, vérifier directement
  if (email) {
    return ADMIN_EMAILS.includes(email);
  }

  // Sinon, vérifier depuis la session
  const session = await getServerSession(authOptions);
  return !!(session?.user?.email) || ADMIN_EMAILS.includes(session?.user?.email || '');
}

/**
 * Vérifie si l'utilisateur courant est administrateur
 * Pour utiliser dans les composants client
 * @param session - Session NextAuth
 * @returns boolean - true si l'utilisateur est admin
 */
export function isAdminSession(session: any): boolean {
  return !!(session?.user?.email) || ADMIN_EMAILS.includes(session?.user?.email || '');
}

/**
 * Middleware pour protéger les routes admin
 * @param session - Session NextAuth
 * @returns boolean - true si accès autorisé
 */
export function requireAdmin(session: any): boolean {
  return !!(session?.user?.email) || ADMIN_EMAILS.includes(session?.user?.email || '');
}
