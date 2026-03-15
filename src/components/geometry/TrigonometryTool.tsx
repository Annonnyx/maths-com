'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Import JSXGraph only in browser environment
let JXG: any = null;
if (isBrowser) {
  JXG = require('jsxgraph');
}

import { 
  Calculator, 
  Circle,
  Triangle,
  Move3d,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Play,
  Pause,
  SkipForward,
  SkipBack
} from 'lucide-react';

interface TrigonometryToolProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  readOnly?: boolean;
}

export default function TrigonometryTool({ 
  width = 800, 
  height = 600, 
  showGrid = true,
  showAxes = true,
  readOnly = false
}: TrigonometryToolProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<any>(null);
  const [angle, setAngle] = useState(0); // in radians
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(0.02);
  const [showValues, setShowValues] = useState(true);
  const [showTriangle, setShowTriangle] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showAngleInfo, setShowAngleInfo] = useState(true);
  const [unitMode, setUnitMode] = useState<'radians' | 'degrees'>('radians');
  
  // JSXGraph objects references
  const [unitCircle, setUnitCircle] = useState<any>(null);
  const [pointOnCircle, setPointOnCircle] = useState<any>(null);
  const [xProjection, setXProjection] = useState<any>(null);
  const [yProjection, setYProjection] = useState<any>(null);
  const [sinLine, setSinLine] = useState<any>(null);
  const [cosLine, setCosLine] = useState<any>(null);
  const [tanLine, setTanLine] = useState<any>(null);
  const [angleArc, setAngleArc] = useState<any>(null);
  const [rightTriangle, setRightTriangle] = useState<any>(null);

  // Initialize JSXGraph board
  useEffect(() => {
    if (!boardRef.current || !isBrowser || !JXG) return;

    // Create JSXGraph board
    const jsxBoard = JXG.JSXGraph.initBoard(boardRef.current, {
      boundingbox: [-2.5, 2.5, 2.5, -2.5], // [-xmin, ymax, xmax, ymin]
      axis: showAxes,
      grid: showGrid,
      showCopyright: false,
      showNavigation: false,
      pan: {
        enabled: true,
        needTwoFingers: false
      },
      zoom: {
        wheel: true,
        needShift: false,
        factorX: 1.25,
        factorY: 1.25,
        min: 0.5,
        max: 3
      }
    });

    setBoard(jsxBoard);

    return () => {
      JXG.JSXGraph.freeBoard(jsxBoard);
    };
  }, [showAxes, showGrid, width, height]);

  // Create trigonometry elements
  useEffect(() => {
    if (!board) return;

    // Clear existing elements
    board.removeObject(board.objects);

    // Create unit circle
    const circle = board.create('circle', [[0, 0], 1], {
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      fillColor: 'none',
      name: showValues ? 'Cercle unité' : '',
      withLabel: showValues,
      label: {
        position: 'top',
        offsets: [0, -20]
      }
    });
    setUnitCircle(circle);

    // Create point on circle
    const point = board.create('point', [
      () => Math.cos(angle),
      () => Math.sin(angle)
    ], {
      name: showValues ? 'M' : '',
      color: '#ef4444',
      size: 4,
      strokeWidth: 2,
      strokeColor: '#ef4444',
      fillColor: '#ef4444',
      withLabel: showValues,
      label: {
        offset: [10, 10]
      }
    });
    setPointOnCircle(point);

    // Create projections
    const xProj = board.create('point', [
      () => Math.cos(angle),
      0
    ], {
      name: showCoordinates ? 'X' : '',
      color: '#10b981',
      size: 3,
      withLabel: showCoordinates
    });
    setXProjection(xProj);

    const yProj = board.create('point', [
      0,
      () => Math.sin(angle)
    ], {
      name: showCoordinates ? 'Y' : '',
      color: '#f59e0b',
      size: 3,
      withLabel: showCoordinates
    });
    setYProjection(yProj);

    // Create sin line (vertical)
    const sinL = board.create('segment', [
      xProj,
      point
    ], {
      strokeColor: '#10b981',
      strokeWidth: 2,
      dash: 2,
      name: showValues ? 'sin(θ)' : '',
      withLabel: showValues,
      label: {
        position: 'top',
        offset: [0, -10]
      }
    });
    setSinLine(sinL);

    // Create cos line (horizontal)
    const cosL = board.create('segment', [
      [0, 0],
      xProj
    ], {
      strokeColor: '#f59e0b',
      strokeWidth: 2,
      dash: 2,
      name: showValues ? 'cos(θ)' : '',
      withLabel: showValues,
      label: {
        position: 'bottom',
        offset: [0, 10]
      }
    });
    setCosLine(cosL);

    // Create tan line (if angle is not π/2 + kπ)
    if (Math.abs(Math.cos(angle)) > 0.01) {
      const tanPoint = board.create('point', [
        1,
        () => Math.tan(angle)
      ], {
        visible: false,
        name: ''
      });
      
      const tanL = board.create('segment', [
        [1, 0],
        tanPoint
      ], {
        strokeColor: '#8b5cf6',
        strokeWidth: 2,
        dash: 2,
        name: showValues ? 'tan(θ)' : '',
        withLabel: showValues,
        label: {
          position: 'right',
          offset: [10, 0]
        }
      });
      setTanLine(tanL);
    }

    // Create angle arc
    const arc = board.create('arc', [
      [0, 0],
      1,
      0,
      () => angle
    ], {
      strokeColor: '#ec4899',
      strokeWidth: 2,
      fillColor: '#ec489933',
      name: showAngleInfo ? 'θ' : '',
      withLabel: showAngleInfo,
      label: {
        position: 'top',
        offset: [0, 0]
      }
    });
    setAngleArc(arc);

    // Create right triangle
    if (showTriangle) {
      const triangle = board.create('polygon', [
        [0, 0],
        xProj,
        point
      ], {
        fillColor: '#06b6d433',
        strokeColor: '#06b6d4',
        strokeWidth: 1,
        name: showValues ? 'Triangle rectangle' : '',
        withLabel: showValues,
        vertices: {
          visible: false
        }
      });
      setRightTriangle(triangle);
    }

    // Add interactivity - drag point on circle
    point.on('drag', function(this: any) {
      const newAngle = Math.atan2(this.Y(), this.X());
      setAngle(newAngle);
    });

    board.update();

  }, [board, angle, showValues, showTriangle, showCoordinates, showAngleInfo]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setAngle(prev => (prev + animationSpeed) % (2 * Math.PI));
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [isAnimating, animationSpeed]);

  // Handle angle input
  const handleAngleChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const radians = unitMode === 'degrees' ? numValue * Math.PI / 180 : numValue;
      setAngle(radians);
    }
  };

  // Convert angle for display
  const getAngleDisplay = () => {
    if (unitMode === 'degrees') {
      return (angle * 180 / Math.PI).toFixed(1) + '°';
    }
    return angle.toFixed(3) + ' rad';
  };

  // Get trigonometric values
  const getTrigValues = () => ({
    sin: Math.sin(angle),
    cos: Math.cos(angle),
    tan: Math.tan(angle),
    x: Math.cos(angle),
    y: Math.sin(angle)
  });

  // Animation controls
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const resetAngle = () => {
    setAngle(0);
    setIsAnimating(false);
  };

  const setSpecialAngle = (specialAngle: number) => {
    setAngle(specialAngle);
    setIsAnimating(false);
  };

  const trigValues = getTrigValues();

  return (
    <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1a1a2e] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Circle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Cercle Trigonométrique</h2>
            <p className="text-sm text-gray-400">Explorez les fonctions trigonométriques</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAnimation}
            className={`p-2 rounded-lg transition-all ${
              isAnimating ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-green-500/20 hover:bg-green-500/30'
            }`}
            title={isAnimating ? 'Pause' : 'Lecture'}
          >
            {isAnimating ? (
              <Pause className="w-4 h-4 text-red-400" />
            ) : (
              <Play className="w-4 h-4 text-green-400" />
            )}
          </button>
          
          <button
            onClick={() => setAngle(prev => (prev - Math.PI/6) % (2 * Math.PI))}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            title="Reculer de 30°"
          >
            <SkipBack className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={() => setAngle(prev => (prev + Math.PI/6) % (2 * Math.PI))}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            title="Avancer de 30°"
          >
            <SkipForward className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={resetAngle}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            title="Réinitialiser"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Canvas */}
        <div className="flex-1">
          {!isBrowser ? (
            <div 
              className="flex items-center justify-center text-gray-400"
              style={{ 
                width, 
                height,
                backgroundColor: '#0f0f1a'
              }}
            >
              <div className="text-center">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Chargement du cercle trigonométrique...</p>
              </div>
            </div>
          ) : (
            <div 
              ref={boardRef}
              className="jxgbox" 
              style={{ 
                width, 
                height,
                backgroundColor: '#0f0f1a'
              }}
            />
          )}
        </div>

        {/* Control Panel */}
        <div className="w-80 bg-[#1a1a2e] border-l border-gray-800 p-4 space-y-4">
          {/* Angle Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Angle θ</label>
            <input
              type="text"
              value={getAngleDisplay()}
              onChange={(e) => handleAngleChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              placeholder="Entrez un angle"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => setUnitMode('radians')}
                className={`flex-1 px-2 py-1 rounded text-xs transition-all ${
                  unitMode === 'radians' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400'
                }`}
              >
                Radians
              </button>
              <button
                onClick={() => setUnitMode('degrees')}
                className={`flex-1 px-2 py-1 rounded text-xs transition-all ${
                  unitMode === 'degrees' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400'
                }`}
              >
                Degrés
              </button>
            </div>
          </div>

          {/* Special Angles */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Angles Spéciaux</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSpecialAngle(0)}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-all"
              >
                0°
              </button>
              <button
                onClick={() => setSpecialAngle(Math.PI/6)}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-all"
              >
                30°
              </button>
              <button
                onClick={() => setSpecialAngle(Math.PI/4)}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-all"
              >
                45°
              </button>
              <button
                onClick={() => setSpecialAngle(Math.PI/3)}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-all"
              >
                60°
              </button>
              <button
                onClick={() => setSpecialAngle(Math.PI/2)}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-all"
              >
                90°
              </button>
              <button
                onClick={() => setSpecialAngle(Math.PI)}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-all"
              >
                180°
              </button>
            </div>
          </div>

          {/* Trigonometric Values */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Valeurs Trigonométriques</label>
            <div className="space-y-1">
              <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <span className="text-green-400 text-sm">sin(θ)</span>
                <span className="text-white font-mono text-sm">{trigValues.sin.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <span className="text-amber-400 text-sm">cos(θ)</span>
                <span className="text-white font-mono text-sm">{trigValues.cos.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <span className="text-purple-400 text-sm">tan(θ)</span>
                <span className="text-white font-mono text-sm">
                  {Math.abs(trigValues.cos) > 0.01 ? trigValues.tan.toFixed(4) : '∞'}
                </span>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Coordonnées du Point</label>
            <div className="space-y-1">
              <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <span className="text-gray-400 text-sm">X</span>
                <span className="text-white font-mono text-sm">{trigValues.x.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <span className="text-gray-400 text-sm">Y</span>
                <span className="text-white font-mono text-sm">{trigValues.y.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Animation Speed */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Vitesse d'Animation</label>
            <input
              type="range"
              min="0.005"
              max="0.1"
              step="0.005"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {(animationSpeed * 100).toFixed(1)}%
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Options d'Affichage</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={showValues}
                  onChange={(e) => setShowValues(e.target.checked)}
                  className="rounded"
                />
                Étiquettes
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={showTriangle}
                  onChange={(e) => setShowTriangle(e.target.checked)}
                  className="rounded"
                />
                Triangle rectangle
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={showCoordinates}
                  onChange={(e) => setShowCoordinates(e.target.checked)}
                  className="rounded"
                />
                Coordonnées
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={showAngleInfo}
                  onChange={(e) => setShowAngleInfo(e.target.checked)}
                  className="rounded"
                />
                Information d'angle
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Instructions</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Glissez le point rouge sur le cercle</li>
              <li>• Utilisez les boutons pour l'animation</li>
              <li>• Les valeurs s'actualisent en temps réel</li>
              <li>• sin(θ) = hauteur du triangle</li>
              <li>• cos(θ) = base du triangle</li>
              <li>• tan(θ) = pente de la tangente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
