'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface EloDataPoint {
  date: string;
  elo: number;
}

interface EloChartProps {
  mode: 'solo' | 'multiplayer' | 'both';
  period: string;
  currentElo: number;
  currentRank: string;
}

export function EloChart({ mode, period, currentElo, currentRank }: EloChartProps) {
  const [history, setHistory] = useState<EloDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/stats/elo-history?mode=${mode === 'both' ? 'solo' : mode}&period=${period}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setHistory(data.history || []);
      } catch (error) {
        console.error('Error fetching ELO history:', error);
        // Fallback: générer des données de démonstration
        setHistory(generateMockData(currentElo, period));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [mode, period, currentElo]);

  // Générer des données de démo si pas de données réelles
  const generateMockData = (baseElo: number, period: string): EloDataPoint[] => {
    const points: EloDataPoint[] = [];
    const now = new Date();
    let count = 7;
    let interval = 24 * 60 * 60 * 1000; // 1 jour

    switch (period) {
      case '1h':
        count = 6;
        interval = 10 * 60 * 1000; // 10 min
        break;
      case '24h':
        count = 8;
        interval = 3 * 60 * 60 * 1000; // 3h
        break;
      case '7d':
        count = 7;
        interval = 24 * 60 * 60 * 1000; // 1 jour
        break;
      case '30d':
        count = 10;
        interval = 3 * 24 * 60 * 60 * 1000; // 3 jours
        break;
      case '3m':
        count = 12;
        interval = 7 * 24 * 60 * 60 * 1000; // 1 semaine
        break;
      case 'all':
        count = 10;
        interval = 30 * 24 * 60 * 60 * 1000; // 1 mois
        break;
    }

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * interval);
      const variation = Math.floor(Math.random() * 50) - 25;
      points.push({
        date: date.toISOString(),
        elo: Math.max(400, baseElo - i * 10 + variation)
      });
    }

    // Ajouter le point actuel
    points.push({
      date: now.toISOString(),
      elo: baseElo
    });

    return points;
  };

  if (loading) {
    return (
      <div className="h-80 bg-[#1e1e2e] rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  const data = history.length > 0 ? history : generateMockData(currentElo, period);
  
  // Calculer min/max pour l'échelle
  const elos = data.map(d => d.elo);
  const minElo = Math.min(...elos, 400);
  const maxElo = Math.max(...elos);
  const eloRange = Math.max(maxElo - minElo, 100);
  
  // Dimensions du SVG
  const width = 700;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Fonctions de scaling
  const xScale = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const yScale = (elo: number) => padding.top + chartHeight - ((elo - minElo) / eloRange) * chartHeight;
  
  // Générer le path
  const linePath = data.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.elo)}`
  ).join(' ');
  
  // Générer l'aire sous la courbe
  const areaPath = `
    ${linePath}
    L ${xScale(data.length - 1)} ${padding.top + chartHeight}
    L ${padding.left} ${padding.top + chartHeight}
    Z
  `;

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === '1h' || period === '24h') {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (period === '7d') {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="relative">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-80 bg-[#1e1e2e] rounded-xl"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines horizontales */}
        {[0, 0.25, 0.5, 0.75, 1].map(tick => {
          const y = padding.top + tick * chartHeight;
          const elo = Math.round(minElo + (1 - tick) * eloRange);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#2a2a3a"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                fill="#6b7280"
                fontSize="12"
                textAnchor="end"
              >
                {elo}
              </text>
            </g>
          );
        })}
        
        {/* Aire sous la courbe avec dégradé */}
        <defs>
          <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d={areaPath}
          fill="url(#eloGradient)"
        />
        
        {/* Ligne principale */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#a855f7"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Points sur la ligne */}
        {data.map((d, i) => (
          <motion.circle
            key={i}
            cx={xScale(i)}
            cy={yScale(d.elo)}
            r="5"
            fill="#a855f7"
            stroke="#1e1e2e"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <title>{`ELO: ${d.elo} - ${formatDate(d.date)}`}</title>
          </motion.circle>
        ))}
        
        {/* Labels axe X (dates) */}
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i) => (
          <text
            key={`date-${i}`}
            x={xScale(data.indexOf(d))}
            y={height - 10}
            fill="#6b7280"
            fontSize="11"
            textAnchor="middle"
          >
            {formatDate(d.date)}
          </text>
        ))}
      </svg>
      
      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-[#12121a]/80 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="text-sm text-gray-400">Évolution ELO</div>
        <div className="text-lg font-bold text-purple-400">
          {data.length > 1 ? `${data[data.length - 1].elo - data[0].elo > 0 ? '+' : ''}${data[data.length - 1].elo - data[0].elo}` : '0'}
        </div>
      </div>
    </div>
  );
}
