'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, Plus, Copy, Trash2, Check, AlertCircle, RefreshCw, Shield
} from 'lucide-react';

interface ApiKey {
  id: string;
  label: string;
  lastUsedAt: string | null;
  createdAt: string;
  key: string; // Only shown when created
}

export default function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/cli/keys');
      if (!response.ok) throw new Error('Erreur lors du chargement des clefs');
      const data = await response.json();
      console.log('API Keys data:', data); // Debug pour voir ce que l'API retourne
      setKeys(Array.isArray(data) ? data : (data?.keys ?? data?.data ?? []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    setCreating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cli/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: `Clef CLI - ${new Date().toLocaleDateString()}` })
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création');
      
      const data = await response.json();
      setNewKey(data);
      setKeys([...keys, { ...data, key: data.key }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette clef ?')) return;
    
    try {
      const response = await fetch(`/api/cli/keys/${keyId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      setKeys(keys.filter(k => k.id !== keyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const copyKey = async (key: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(keyId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      setError('Erreur lors de la copie');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Clefs API CLI
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos clefs pour utiliser la CLI maths-app.fr
          </p>
        </div>
        <button
          onClick={createKey}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Création...' : 'Créer une clef'}
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {newKey && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 font-medium">✅ Nouvelle clef créée !</span>
            <button
              onClick={() => setNewKey(null)}
              className="text-muted-foreground hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="bg-black/30 p-3 rounded font-mono text-sm break-all">
            {newKey.key}
          </div>
          <button
            onClick={() => copyKey(newKey.key, newKey.id)}
            className="mt-2 flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"
          >
            {copied === newKey.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === newKey.id ? 'Copié !' : 'Copier la clef'}
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ Sauvegardez cette clef maintenant, elle ne sera plus affichée
          </p>
        </motion.div>
      )}

      <div className="space-y-3">
        {!keys || keys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucune clef API</p>
            <p className="text-sm">Créez votre première clef pour utiliser la CLI</p>
          </div>
        ) : (
          keys.map((key) => (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Key className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">{key.label}</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Créée le {new Date(key.createdAt).toLocaleDateString()}</div>
                  {key.lastUsedAt && (
                    <div>Dernière utilisation : {new Date(key.lastUsedAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteKey(key.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="text-xs text-muted-foreground bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="font-medium mb-1">💡 Comment utiliser la CLI :</p>
        <ol className="space-y-1">
          <li>1. Installez la CLI : <code className="bg-black/30 px-1 rounded">npm install -g maths-cli</code></li>
          <li>2. Connectez-vous : <code className="bg-black/30 px-1 rounded">maths login</code></li>
          <li>3. Collez votre clef API</li>
          <li>4. Jouez : <code className="bg-black/30 px-1 rounded">maths solo</code> ou <code className="bg-black/30 px-1 rounded">maths duel create</code></li>
        </ol>
      </div>
    </div>
  );
}
