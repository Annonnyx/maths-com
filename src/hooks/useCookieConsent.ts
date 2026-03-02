/**
 * Hook React pour la gestion du consentement des cookies
 * Conforme CNIL délibération 2020-091 et RGPD
 * Maths-app.com - v1.0 - 2 mars 2026
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getConsent, setConsent, revokeConsent, CookiePreferences, CookieConsent } from '@/lib/cookies-consent';

export function useCookieConsent() {
  const [consent, setConsentState] = useState<CookieConsent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le consentement au montage
  useEffect(() => {
    const currentConsent = getConsent();
    setConsentState(currentConsent);
    setIsLoading(false);

    // Écouter les changements de consentement
    const handleConsentUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      setConsentState(customEvent.detail);
    };

    window.addEventListener('cookieConsentUpdated', handleConsentUpdate);
    
    // Synchroniser entre onglets via storage event
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'maths_cookie_consent') {
        const updatedConsent = getConsent();
        setConsentState(updatedConsent);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateConsent = useCallback((preferences: CookiePreferences) => {
    setConsent(preferences);
  }, []);

  const revokeAllConsent = useCallback(() => {
    revokeConsent();
    setConsentState(null);
  }, []);

  const hasConsented = useCallback(() => {
    return consent !== null;
  }, [consent]);

  const isAdvertisingAllowed = useCallback(() => {
    return consent?.advertising ?? false;
  }, [consent]);

  const isAnalyticsAllowed = useCallback(() => {
    return consent?.analytics ?? false;
  }, [consent]);

  const getCurrentPreferences = useCallback((): CookiePreferences | null => {
    if (!consent) return null;
    return {
      analytics: consent.analytics,
      advertising: consent.advertising
    };
  }, [consent]);

  return {
    consent,
    isLoading,
    updateConsent,
    revokeAllConsent,
    hasConsented,
    isAdvertisingAllowed,
    isAnalyticsAllowed,
    getCurrentPreferences
  };
}
