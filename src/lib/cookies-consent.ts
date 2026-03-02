/**
 * Utilitaire de gestion du consentement des cookies
 * Conforme CNIL délibération 2020-091 et RGPD
 * Maths-app.com - v1.0 - 2 mars 2026
 */

export interface CookieConsent {
  version: string;
  date: string; // ISO string
  necessary: boolean; // toujours true, non modifiable
  analytics: boolean;
  advertising: boolean;
}

export interface CookiePreferences {
  analytics: boolean;
  advertising: boolean;
}

const CONSENT_COOKIE_NAME = 'maths_cookie_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_DURATION_MONTHS = 6; // 6 mois maximum CNIL

/**
 * Récupère le consentement actuel depuis les cookies
 */
export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${CONSENT_COOKIE_NAME}=`))
      ?.split('=')[1];

    if (!cookieValue) {
      return null;
    }

    const consent = JSON.parse(decodeURIComponent(cookieValue)) as CookieConsent;
    
    // Vérifier la version et l'expiration
    if (consent.version !== CONSENT_VERSION) {
      return null;
    }

    const consentDate = new Date(consent.date);
    const expirationDate = new Date(consentDate.getTime() + (CONSENT_DURATION_MONTHS * 30 * 24 * 60 * 60 * 1000));
    
    if (new Date() > expirationDate) {
      return null;
    }

    return consent;
  } catch (error) {
    console.warn('Erreur lors de la lecture du consentement:', error);
    return null;
  }
}

/**
 * Sauvegarde le consentement dans un cookie HTTP
 */
export function setConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    date: new Date().toISOString(),
    necessary: true, // toujours true
    ...preferences
  };

  const cookieValue = encodeURIComponent(JSON.stringify(consent));
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + CONSENT_DURATION_MONTHS);

  // Configuration du cookie HTTP sécurisé
  document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax; ${
    window.location.protocol === 'https:' ? 'Secure;' : ''
  }`;

  // Déclencher un événement pour les composants React
  window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
    detail: consent 
  }));
}

/**
 * Vérifie si un consentement existe et est valide
 */
export function hasConsent(): boolean {
  return getConsent() !== null;
}

/**
 * Révoque l'ensemble du consentement
 */
export function revokeConsent(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Supprimer le cookie de consentement
  document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; ${
    window.location.protocol === 'https:' ? 'Secure;' : ''
  }`;

  // Déclencher un événement pour les composants React
  window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
    detail: null 
  }));
}

/**
 * Helper pour vérifier si la publicité est autorisée
 */
export function isAdvertisingAllowed(): boolean {
  const consent = getConsent();
  return consent?.advertising ?? false;
}

/**
 * Helper pour vérifier si les analytics sont autorisés
 */
export function isAnalyticsAllowed(): boolean {
  const consent = getConsent();
  return consent?.analytics ?? false;
}

/**
 * Helper pour obtenir les préférences actuelles
 */
export function getCurrentPreferences(): CookiePreferences | null {
  const consent = getConsent();
  if (!consent) {
    return null;
  }

  return {
    analytics: consent.analytics,
    advertising: consent.advertising
  };
}
