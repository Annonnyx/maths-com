import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Vérifie si l'utilisateur est administrateur (côté serveur uniquement)
 * @param email - Email de l'utilisateur (optionnel)
 * @returns boolean - true si l'utilisateur est admin
 */
export async function isAdminServer(email?: string): Promise<boolean> {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'noe.barneron@gmail.com';
  const ADMIN_EMAILS = process.env.ADMIN_EMAILS 
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim())
    : [ADMIN_EMAIL];

  // Si email fourni, vérifier directement
  if (email) {
    return ADMIN_EMAILS.includes(email);
  }

  // Sinon, vérifier depuis la session
  const session = await getServerSession(authOptions);
  return !!(session?.user?.email) || ADMIN_EMAILS.includes(session?.user?.email || '');
}
