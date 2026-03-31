'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Activity, Users, TestTube, Database, 
  TrendingUp, AlertTriangle, CheckCircle, 
  RefreshCw, Trash2, Shield, BarChart3
} from 'lucide-react';

interface SystemHealth {
  totalUsers: number;
  totalTests: number;
  completedTests: number;
  incompleteTests: number;
  averageElo: number;
  completionRate: number;
}

interface MaintenanceResult {
  success: boolean;
  action: string;
  result: any;
  timestamp: string;
}

export default function AdminMonitoringPage() {
  const { data: session } = useSession();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastMaintenance, setLastMaintenance] = useState<MaintenanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/maintenance?action=health');
      const data = await response.json();
      
      if (data.success) {
        setHealth(data.result);
      } else {
        setError(data.error || 'Failed to fetch health data');
      }
    } catch (err) {
      setError('Network error');
      console.error('Health fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runMaintenance = async (action: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/maintenance?action=${action}`);
      const data = await response.json();
      
      setLastMaintenance(data);
      
      // Refresh health data after maintenance
      if (data.success) {
        setTimeout(fetchHealth, 1000);
      }
    } catch (err) {
      setError('Maintenance operation failed');
      console.error('Maintenance error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Accès Restreint</h1>
          <p className="text-gray-400">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            Monitoring Système
          </h1>
          <p className="text-gray-400">
            Surveillance de l'état de santé et maintenance de l'application Maths-App
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Health Overview */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1a1a2e] p-6 rounded-xl border border-[#2a2a3a]">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <div className="text-3xl font-bold text-white">{health.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Utilisateurs</div>
            </div>

            <div className="bg-[#1a1a2e] p-6 rounded-xl border border-[#2a2a3a]">
              <div className="flex items-center justify-between mb-4">
                <TestTube className="w-8 h-8 text-green-400" />
                <span className="text-sm text-gray-400">{health.completionRate}%</span>
              </div>
              <div className="text-3xl font-bold text-white">{health.completedTests.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Tests complétés</div>
            </div>

            <div className="bg-[#1a1a2e] p-6 rounded-xl border border-[#2a2a3a]">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
                <span className="text-sm text-gray-400">Moyenne</span>
              </div>
              <div className="text-3xl font-bold text-white">{health.averageElo}</div>
              <div className="text-sm text-gray-400 mt-1">ELO moyen</div>
            </div>

            <div className="bg-[#1a1a2e] p-6 rounded-xl border border-[#2a2a3a]">
              <div className="flex items-center justify-between mb-4">
                <Database className="w-8 h-8 text-purple-400" />
                <span className="text-sm text-gray-400">{health.incompleteTests}</span>
              </div>
              <div className="text-3xl font-bold text-white">{health.totalTests.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Tests totaux</div>
            </div>
          </div>
        )}

        {/* Maintenance Actions */}
        <div className="bg-[#1a1a2e] p-6 rounded-xl border border-[#2a2a3a]">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Actions de Maintenance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => runMaintenance('cleanup')}
              disabled={loading}
              className="p-4 bg-[#2a2a3a] hover:bg-[#3a3a4a] rounded-lg border border-[#3a3a4a] transition-all disabled:opacity-50"
            >
              <Trash2 className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-white font-medium">Nettoyer Tests</div>
              <div className="text-xs text-gray-400 mt-1">Supprimer tests incomplets &gt; 24h</div>
            </button>

            <button
              onClick={() => runMaintenance('validate')}
              disabled={loading}
              className="p-4 bg-[#2a2a3a] hover:bg-[#3a3a4a] rounded-lg border border-[#3a3a4a] transition-all disabled:opacity-50"
            >
              <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-white font-medium">Valider ELO</div>
              <div className="text-xs text-gray-400 mt-1">Vérifier cohérence ELO</div>
            </button>

            <button
              onClick={() => runMaintenance('optimize')}
              disabled={loading}
              className="p-4 bg-[#2a2a3a] hover:bg-[#3a3a4a] rounded-lg border border-[#3a3a4a] transition-all disabled:opacity-50"
            >
              <Database className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-white font-medium">Optimiser BDD</div>
              <div className="text-xs text-gray-400 mt-1">VACUUM & ANALYZE</div>
            </button>
          </div>
        </div>

        {/* Last Maintenance Result */}
        {lastMaintenance && (
          <div className="mt-6 p-4 bg-[#1a1a2e] rounded-lg border border-[#2a2a3a]">
            <div className="flex items-center gap-3 mb-2">
              {lastMaintenance.success ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-white font-medium">
                Dernière action: {lastMaintenance.action}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {new Date(lastMaintenance.timestamp).toLocaleString()}
            </div>
            {lastMaintenance.result && (
              <div className="mt-2 text-xs text-gray-500">
                <pre>{JSON.stringify(lastMaintenance.result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
      </div>
    </div>
  );
}
