'use client';

import { useState, useEffect, useCallback } from 'react';

interface ApiKey {
  id: string;
  label: string;
  lastUsedAt: string | null;
  createdAt: string;
  key?: string; // Only shown when created
}

interface CreateKeyResponse {
  success: boolean;
  key: string;
  keyId: string;
  createdAt: string;
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<CreateKeyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch keys with consistent format handling
  const fetchKeys = useCallback(async () => {
    try {
      const response = await fetch('/api/cli/keys');
      if (!response.ok) throw new Error('Erreur lors du chargement des clefs');
      const data = await response.json();
      
      // Handle consistent format: API returns { keys: [...] }
      const keysData = Array.isArray(data) ? data : (data?.keys || []);
      setKeys(keysData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setKeys([]); // Ensure keys is always an array
    } finally {
      setLoading(false);
    }
  }, []);

  // Create key with consistent response handling
  const createKey = useCallback(async (label?: string) => {
    setCreating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cli/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          label: label || `Clef CLI - ${new Date().toLocaleDateString()}` 
        })
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création');
      
      const data: CreateKeyResponse = await response.json();
      setNewKey(data);
      
      // Add new key to the list (without the actual key for security)
      const keyEntry: ApiKey = {
        id: data.keyId,
        label: label || `Clef CLI - ${new Date().toLocaleDateString()}`,
        lastUsedAt: null,
        createdAt: data.createdAt
      };
      setKeys(prev => [keyEntry, ...prev]);
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  // Delete key
  const deleteKey = useCallback(async (keyId: string) => {
    try {
      const response = await fetch(`/api/cli/keys/${keyId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      setKeys(prev => prev.filter(k => k.id !== keyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      throw err;
    }
  }, []);

  // Copy key to clipboard
  const copyKey = useCallback(async (key: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(keyId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      setError('Erreur lors de la copie');
      throw err;
    }
  }, []);

  // Clear new key (hide it after user has seen it)
  const clearNewKey = useCallback(() => {
    setNewKey(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  return {
    keys,
    loading,
    creating,
    newKey,
    error,
    copied,
    fetchKeys,
    createKey,
    deleteKey,
    copyKey,
    clearNewKey,
    clearError
  };
}
