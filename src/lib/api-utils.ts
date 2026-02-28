import { NextResponse } from 'next/server';

// Codes d'erreur standardisés
export const API_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  DISCORD_LINK_EXPIRED: 'DISCORD_LINK_EXPIRED',
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
  GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
  INVALID_ANSWER: 'INVALID_ANSWER',
  ALREADY_ANSWERED: 'ALREADY_ANSWERED',
  USER_NOT_IN_GAME: 'USER_NOT_IN_GAME',
  INVALID_GAME_CODE: 'INVALID_GAME_CODE',
  FRIEND_REQUEST_EXISTS: 'FRIEND_REQUEST_EXISTS',
  FRIENDSHIP_NOT_FOUND: 'FRIENDSHIP_NOT_FOUND',
  CHALLENGE_NOT_FOUND: 'CHALLENGE_NOT_FOUND',
  BADGE_NOT_FOUND: 'BADGE_NOT_FOUND',
  USER_ALREADY_HAS_BADGE: 'USER_ALREADY_HAS_BADGE',
  TEACHER_REQUEST_EXISTS: 'TEACHER_REQUEST_EXISTS',
  CLASS_GROUP_NOT_FOUND: 'CLASS_GROUP_NOT_FOUND',
  ALREADY_MEMBER: 'ALREADY_MEMBER',
  MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
  TICKET_NOT_FOUND: 'TICKET_NOT_FOUND',
  FAQ_SUBMISSION_FAILED: 'FAQ_SUBMISSION_FAILED',
} as const;

// Messages d'erreur standardisés
export const API_ERROR_MESSAGES = {
  [API_ERROR_CODES.UNAUTHORIZED]: 'Non autorisé',
  [API_ERROR_CODES.FORBIDDEN]: 'Accès interdit',
  [API_ERROR_CODES.NOT_FOUND]: 'Ressource non trouvée',
  [API_ERROR_CODES.VALIDATION_ERROR]: 'Erreur de validation',
  [API_ERROR_CODES.INTERNAL_ERROR]: 'Erreur interne du serveur',
  [API_ERROR_CODES.DATABASE_ERROR]: 'Erreur de base de données',
  [API_ERROR_CODES.RATE_LIMIT]: 'Limite de requêtes dépassée',
  [API_ERROR_CODES.CONFLICT]: 'Conflit de données',
  [API_ERROR_CODES.BAD_REQUEST]: 'Requête invalide',
  [API_ERROR_CODES.SESSION_EXPIRED]: 'Session expirée',
  [API_ERROR_CODES.DISCORD_LINK_EXPIRED]: 'La liaison Discord a expiré',
  [API_ERROR_CODES.GAME_NOT_FOUND]: 'Partie non trouvée',
  [API_ERROR_CODES.GAME_FULL]: 'La partie est complète',
  [API_ERROR_CODES.GAME_ALREADY_STARTED]: 'La partie a déjà commencé',
  [API_ERROR_CODES.INVALID_ANSWER]: 'Réponse invalide',
  [API_ERROR_CODES.ALREADY_ANSWERED]: 'Vous avez déjà répondu à cette question',
  [API_ERROR_CODES.USER_NOT_IN_GAME]: 'Vous n\'êtes pas dans cette partie',
  [API_ERROR_CODES.INVALID_GAME_CODE]: 'Code de partie invalide',
  [API_ERROR_CODES.FRIEND_REQUEST_EXISTS]: 'Demande d\'ami déjà envoyée',
  [API_ERROR_CODES.FRIENDSHIP_NOT_FOUND]: 'Amitié non trouvée',
  [API_ERROR_CODES.CHALLENGE_NOT_FOUND]: 'Défi non trouvé',
  [API_ERROR_CODES.BADGE_NOT_FOUND]: 'Badge non trouvé',
  [API_ERROR_CODES.USER_ALREADY_HAS_BADGE]: 'Vous avez déjà ce badge',
  [API_ERROR_CODES.TEACHER_REQUEST_EXISTS]: 'Demande professeur déjà existante',
  [API_ERROR_CODES.CLASS_GROUP_NOT_FOUND]: 'Classe non trouvée',
  [API_ERROR_CODES.ALREADY_MEMBER]: 'Vous êtes déjà membre de cette classe',
  [API_ERROR_CODES.MESSAGE_NOT_FOUND]: 'Message non trouvé',
  [API_ERROR_CODES.TICKET_NOT_FOUND]: 'Ticket non trouvé',
  [API_ERROR_CODES.FAQ_SUBMISSION_FAILED]: 'Échec de la soumission FAQ',
} as const;

// Fonction utilitaire pour créer des réponses d'erreur uniformes
export function createApiError(
  code: keyof typeof API_ERROR_CODES,
  message?: string,
  details?: any
) {
  const errorMessage = message || API_ERROR_MESSAGES[code];
  
  return {
    error: errorMessage,
    code,
    ...(details && { details })
  };
}

// Fonction utilitaire pour envoyer des réponses d'erreur API
export function sendApiError(
  code: keyof typeof API_ERROR_CODES,
  message?: string,
  details?: any,
  status: number = 500
) {
  const errorResponse = createApiError(code, message, details);
  
  return NextResponse.json(errorResponse, { status });
}

// Fonction utilitaire pour les erreurs 400 (Bad Request)
export function sendValidationError(message: string, details?: any) {
  return sendApiError(API_ERROR_CODES.VALIDATION_ERROR, message, details, 400);
}

// Fonction utilitaire pour les erreurs 401 (Unauthorized)
export function sendUnauthorizedError(message?: string) {
  return sendApiError(API_ERROR_CODES.UNAUTHORIZED, message, undefined, 401);
}

// Fonction utilitaire pour les erreurs 403 (Forbidden)
export function sendForbiddenError(message?: string) {
  return sendApiError(API_ERROR_CODES.FORBIDDEN, message, undefined, 403);
}

// Fonction utilitaire pour les erreurs 404 (Not Found)
export function sendNotFoundError(message?: string) {
  return sendApiError(API_ERROR_CODES.NOT_FOUND, message, undefined, 404);
}

// Fonction utilitaire pour les erreurs 409 (Conflict)
export function sendConflictError(message?: string) {
  return sendApiError(API_ERROR_CODES.CONFLICT, message, undefined, 409);
}

// Fonction utilitaire pour les erreurs 500 (Internal Server Error)
export function sendInternalError(message?: string, details?: any) {
  return sendApiError(API_ERROR_CODES.INTERNAL_ERROR, message, details, 500);
}

// Fonctions spécifiques pour le jeu
export function sendGameError(code: keyof typeof API_ERROR_CODES, message?: string) {
  return sendApiError(code, message, undefined, 400);
}

// Fonctions spécifiques pour Discord
export function sendDiscordError(code: keyof typeof API_ERROR_CODES, message?: string) {
  return sendApiError(code, message, undefined, 400);
}
