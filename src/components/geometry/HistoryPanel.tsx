'use client';

import { useState } from 'react';
import { Clock, RotateCcw, Trash2, Filter } from 'lucide-react';

interface HistoryItem {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  object?: {
    type: 'point' | 'line' | 'circle' | 'polygon' | 'function';
    name: string;
    id: string;
  };
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onUndo?: (itemId: string) => void;
  onClear?: () => void;
  maxItems?: number;
}

export default function HistoryPanel({ 
  history, 
  onUndo, 
  onClear, 
  maxItems = 50 
}: HistoryPanelProps) {
  const [filter, setFilter] = useState<'all' | 'create' | 'delete' | 'modify'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history
    .slice(0, maxItems)
    .filter(item => {
      const matchesFilter = filter === 'all' || item.action === filter;
      const matchesSearch = searchTerm === '' || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return '➕';
      case 'delete':
        return '🗑️';
      case 'modify':
        return '✏️';
      case 'move':
        return '🔄';
      case 'save':
        return '💾';
      case 'export':
        return '📤';
      case 'share':
        return '🔗';
      case 'clear':
        return '🧹';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-400';
      case 'delete':
        return 'text-red-400';
      case 'modify':
        return 'text-yellow-400';
      case 'move':
        return 'text-blue-400';
      case 'save':
        return 'text-indigo-400';
      case 'export':
        return 'text-emerald-400';
      case 'share':
        return 'text-purple-400';
      case 'clear':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Il y a quelques secondes';
    if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  };

  const actionCounts = {
    all: history.length,
    create: history.filter(h => h.action === 'create').length,
    delete: history.filter(h => h.action === 'delete').length,
    modify: history.filter(h => h.action === 'modify').length
  };

  return (
    <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-medium text-gray-300">Historique</h3>
          <span className="text-xs text-gray-500">({filteredHistory.length})</span>
        </div>
        
        {onClear && history.length > 0 && (
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-gray-700 transition-all"
            title="Effacer l'historique"
          >
            <Trash2 className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher dans l'historique..."
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            filter === 'all' 
              ? 'bg-indigo-500/20 text-indigo-400' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Tous ({actionCounts.all})
        </button>
        <button
          onClick={() => setFilter('create')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            filter === 'create' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Créations ({actionCounts.create})
        </button>
        <button
          onClick={() => setFilter('delete')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            filter === 'delete' 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Suppressions ({actionCounts.delete})
        </button>
        <button
          onClick={() => setFilter('modify')}
          className={`px-2 py-1 rounded text-xs transition-all ${
            filter === 'modify' 
              ? 'bg-yellow-500/20 text-yellow-400' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Modifications ({actionCounts.modify})
        </button>
      </div>

      {/* History List */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">
            {searchTerm ? 'Aucun résultat trouvé' : 'Aucune action dans l\'historique'}
          </p>
        ) : (
          filteredHistory.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all group"
            >
              <span className={getActionColor(item.action)}>
                {getActionIcon(item.action)}
              </span>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">
                  {item.description}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(item.timestamp)}
                </p>
              </div>
              
              {onUndo && (item.action === 'create' || item.action === 'delete') && (
                <button
                  onClick={() => onUndo(item.id)}
                  className="p-1 rounded hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                  title={item.action === 'create' ? 'Annuler la création' : 'Restaurer'}
                >
                  <RotateCcw className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Total:</span>
              <span className="text-gray-300">{history.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Aujourd'hui:</span>
              <span className="text-gray-300">
                {history.filter(h => {
                  const today = new Date();
                  return h.timestamp.toDateString() === today.toDateString();
                }).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
