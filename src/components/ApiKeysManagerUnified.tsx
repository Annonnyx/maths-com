'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, Plus, Copy, Trash2, Check, AlertCircle, RefreshCw, Shield, Eye, EyeOff
} from 'lucide-react';
import { useApiKeys } from '@/hooks/useApiKeys';

interface ApiKeysManagerUnifiedProps {
  showTitle?: boolean;
  compact?: boolean;
}

export default function ApiKeysManagerUnified({ 
  showTitle = true, 
  compact = false 
}: ApiKeysManagerUnifiedProps) {
  const {
    keys,
    loading,
    creating,
    newKey,
    error,
    copied,
    createKey,
    deleteKey,
    copyKey,
    clearNewKey,
    clearError
  } = useApiKeys();

  const [showKey, setShowKey] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
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
            onClick={() => createKey()}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Création...' : 'Créer une clef'}
          </button>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-muted-foreground hover:text-white"
          >
            ×
          </button>
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
              onClick={clearNewKey}
              className="text-muted-foreground hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-3">
            <div className="bg-black/30 p-3 rounded font-mono text-sm break-all">
              {showKey ? newKey.key : '•'.repeat(newKey.key.length)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKey(!showKey)}
                className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showKey ? 'Masquer' : 'Afficher'}
              </button>
              <button
                onClick={() => copyKey(newKey.key, newKey.keyId)}
                className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"
              >
                {copied === newKey.keyId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === newKey.keyId ? 'Copié !' : 'Copier la clef'}
              </button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-3 space-y-1">
            <p>⚠️ Sauvegardez cette clef maintenant, elle ne sera plus affichée</p>
            <p>🔐 Cette clef donne accès à votre compte via la CLI</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {keys.length === 0 ? (
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
                  title="Supprimer cette clef"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!compact && (
        <div className="text-xs text-muted-foreground bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="font-medium mb-1">💡 Comment utiliser la CLI :</p>
          <ol className="space-y-1">
            <li>1. Installez la CLI : <code className="bg-black/30 px-1 rounded">npm install -g maths-cli</code></li>
            <li>2. Connectez-vous : <code className="bg-black/30 px-1 rounded">maths login</code></li>
            <li>3. Collez votre clef API</li>
            <li>4. Jouez : <code className="bg-black/30 px-1 rounded">maths solo</code> ou <code className="bg-black/30 px-1 rounded">maths duel create</code></li>
          </ol>
        </div>
      )}
    </div>
  );
}
