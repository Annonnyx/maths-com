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
  MousePointer2, 
  Move, 
  Trash2, 
  Calculator,
  Ruler,
  Circle,
  Square,
  Triangle,
  Undo,
  RotateCcw,
  Grid3X3,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move3d,
  FunctionSquare
} from 'lucide-react';

interface Point {
  id: string;
  x: number;
  y: number;
  label?: string;
  color?: string;
  jsxgraphPoint?: any; // JSXGraph point reference
}

interface Line {
  id: string;
  startId: string;
  endId: string;
  color: string;
  dashed?: boolean;
  jsxgraphLine?: any; // JSXGraph line reference
}

interface CircleShape {
  id: string;
  centerId: string;
  radiusPointId: string;
  color: string;
  jsxgraphCircle?: any; // JSXGraph circle reference
}

interface TriangleShape {
  id: string;
  pointIds: string[];
  color: string;
  fill?: boolean;
  jsxgraphPolygon?: any; // JSXGraph polygon reference
}

interface FunctionData {
  id: string;
  expression: string;
  color: string;
  jsxgraphFunction?: any; // JSXGraph function reference
}

export type GeometryTool = 'point' | 'line' | 'segment' | 'circle' | 'triangle' | 'select' | 'measure' | 'delete' | 'symmetry' | 'pythagore' | 'vector' | 'function' | 'polygon' | 'move';

interface GeometryCanvasProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  initialPoints?: Point[];
  readOnly?: boolean;
  onShapeCreated?: (shape: any) => void;
}

export default function GeometryCanvas({ 
  width = 800, 
  height = 600, 
  showGrid = true,
  showAxes = true,
  initialPoints = [],
  readOnly = false,
  onShapeCreated
}: GeometryCanvasProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<any>(null);
  const [points, setPoints] = useState<Point[]>(initialPoints);
  const [lines, setLines] = useState<Line[]>([]);
  const [circles, setCircles] = useState<CircleShape[]>([]);
  const [triangles, setTriangles] = useState<TriangleShape[]>([]);
  const [functions, setFunctions] = useState<FunctionData[]>([]);
  const [selectedTool, setSelectedTool] = useState<GeometryTool>('select');
  const [showGridState, setShowGridState] = useState(showGrid);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [functionInput, setFunctionInput] = useState('');
  const [showFunctionInput, setShowFunctionInput] = useState(false);

  // Initialize JSXGraph board
  useEffect(() => {
    if (!boardRef.current || !isBrowser || !JXG) return;

    // Create JSXGraph board
    const jsxBoard = JXG.JSXGraph.initBoard(boardRef.current, {
      boundingbox: [-400, 400, 400, -400], // [xmin, ymax, xmax, ymin]
      axis: showAxes,
      grid: showGrid,
      showCopyright: false,
      showNavigation: false
    });

    setBoard(jsxBoard);

    // Add fullscreen functionality
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        boardRef.current?.requestFullscreen().then(() => {
          setIsFullscreen(true);
          // Resize board to fullscreen
          setTimeout(() => {
            jsxBoard.resizeContainer(window.innerWidth, window.innerHeight - 100);
            jsxBoard.update();
          }, 100);
        });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
          // Resize board back to original size
          setTimeout(() => {
            jsxBoard.resizeContainer(width, height);
            jsxBoard.update();
          }, 100);
        });
      }
    };

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Store fullscreen handler for cleanup
    (jsxBoard as any).fullscreenHandler = handleFullscreen;

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      JXG.JSXGraph.freeBoard(jsxBoard);
    };
  }, [showAxes, showGrid, width, height]);

  // Handle tool selection
  const handleToolChange = (tool: GeometryTool) => {
    setSelectedTool(tool);
    setSelectedPoint(null);
    
    // JSXGraph handles interactions automatically
    // We don't need to set board modes manually
  };

  // Handle function plotting
  const handleFunctionSubmit = () => {
    if (!functionInput.trim() || !board) return;
    
    try {
      // Parse function expression
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      const color = colors[functions.length % colors.length];
      
      // Create JSXGraph function
      const func = board.create('functiongraph', [
        (x: number) => {
          // Safe evaluation of the function
          try {
            // Replace common math functions and constants
            const expr = functionInput
              .replace(/sin/g, 'Math.sin')
              .replace(/cos/g, 'Math.cos')
              .replace(/tan/g, 'Math.tan')
              .replace(/sqrt/g, 'Math.sqrt')
              .replace(/abs/g, 'Math.abs')
              .replace(/log/g, 'Math.log')
              .replace(/exp/g, 'Math.exp')
              .replace(/pi/g, 'Math.PI')
              .replace(/e/g, 'Math.E')
              .replace(/\^/g, '**')
              .replace(/x/g, 'x');
            
            return Function('"use strict"; return (' + expr + ')')(x);
          } catch (e) {
            return NaN;
          }
        }
      ], {
        strokeColor: color,
        strokeWidth: 2,
        name: functionInput,
        withLabel: true,
        label: {
          position: 'top',
          offsets: [0, -10]
        }
      });

      setFunctions(prev => [...prev, {
        id: `func${Date.now()}`,
        expression: functionInput,
        color,
        jsxgraphFunction: func
      }]);
      
      setFunctionInput('');
      setShowFunctionInput(false);
    } catch (error) {
      console.error('Invalid function expression:', error);
    }
  };

  // Remove function
  const removeFunction = (id: string) => {
    setFunctions(prev => {
      const funcToRemove = prev.find(f => f.id === id);
      if (funcToRemove && funcToRemove.jsxgraphFunction && board) {
        board.removeObject(funcToRemove.jsxgraphFunction);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Clear all
  const clearAll = () => {
    if (board) {
      board.removeObject(board.objects);
    }
    setPoints([]);
    setLines([]);
    setCircles([]);
    setTriangles([]);
    setFunctions([]);
  };

  // Tools configuration
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Sélectionner', color: 'text-blue-400' },
    { id: 'point', icon: Move, label: 'Point', color: 'text-indigo-400' },
    { id: 'segment', icon: Ruler, label: 'Segment', color: 'text-pink-400' },
    { id: 'line', icon: Ruler, label: 'Droite', color: 'text-violet-400' },
    { id: 'circle', icon: Circle, label: 'Cercle', color: 'text-amber-400' },
    { id: 'triangle', icon: Triangle, label: 'Triangle', color: 'text-emerald-400' },
    { id: 'function', icon: FunctionSquare, label: 'Fonction', color: 'text-purple-400' },
    { id: 'delete', icon: Trash2, label: 'Effacer', color: 'text-red-400' },
  ] as const;

  return (
    <div className={`bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
    }`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-[#1a1a2e] border-b border-gray-800">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => handleToolChange(tool.id as GeometryTool)}
            className={`p-2 rounded-lg transition-all ${
              selectedTool === tool.id 
                ? 'bg-indigo-500/30 border border-indigo-500/50' 
                : 'hover:bg-gray-800'
            }`}
            title={tool.label}
          >
            <tool.icon className={`w-5 h-5 ${selectedTool === tool.id ? 'text-indigo-400' : 'text-gray-400'}`} />
          </button>
        ))}
        
        <div className="w-px h-6 bg-gray-700 mx-2" />
        
        {/* View Controls */}
        <button
          onClick={() => board && board.zoomIn()}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Zoomer"
        >
          <ZoomIn className="w-5 h-5 text-gray-400" />
        </button>
        
        <button
          onClick={() => board && board.zoomOut()}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Dézoomer"
        >
          <ZoomOut className="w-5 h-5 text-gray-400" />
        </button>
        
        <button
          onClick={() => board && board.zoom100()}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Réinitialiser la vue"
        >
          <Move3d className="w-5 h-5 text-gray-400" />
        </button>
        
        <button
          onClick={() => board && (board as any).fullscreenHandler()}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Plein écran"
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5 text-gray-400" />
          ) : (
            <Maximize className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        <div className="w-px h-6 bg-gray-700 mx-2" />
        
        <button
          onClick={() => setShowGridState(!showGridState)}
          className={`p-2 rounded-lg transition-all ${showGridState ? 'bg-indigo-500/20' : 'hover:bg-gray-800'}`}
          title="Grille"
        >
          <Grid3X3 className={`w-5 h-5 ${showGridState ? 'text-indigo-400' : 'text-gray-400'}`} />
        </button>
        
        <button
          onClick={() => setShowMeasurements(!showMeasurements)}
          className={`p-2 rounded-lg transition-all ${showMeasurements ? 'bg-indigo-500/20' : 'hover:bg-gray-800'}`}
          title="Mesures"
        >
          <Calculator className={`w-5 h-5 ${showMeasurements ? 'text-indigo-400' : 'text-gray-400'}`} />
        </button>
        
        <button
          onClick={() => setShowFunctionInput(!showFunctionInput)}
          className={`p-2 rounded-lg transition-all ${showFunctionInput ? 'bg-indigo-500/20' : 'hover:bg-gray-800'}`}
          title="Fonctions"
        >
          <Info className={`w-5 h-5 ${showFunctionInput ? 'text-indigo-400' : 'text-gray-400'}`} />
        </button>
        
        <div className="flex-1" />
        
        <button
          onClick={clearAll}
          className="p-2 rounded-lg hover:bg-red-500/20 transition-all"
          title="Tout effacer"
        >
          <RotateCcw className="w-5 h-5 text-red-400" />
        </button>
      </div>
      
      {/* Function Input */}
      {showFunctionInput && (
        <div className="p-3 bg-[#1a1a2e] border-b border-gray-800">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={functionInput}
              onChange={(e) => setFunctionInput(e.target.value)}
              placeholder="Entrez une fonction (ex: 2*x+1, sin(x), x^2, sqrt(x))..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && handleFunctionSubmit()}
            />
            <button
              onClick={handleFunctionSubmit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
            >
              Tracer
            </button>
          </div>
          
          {/* Function List */}
          {functions.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-400 mb-1">Fonctions tracées:</div>
              {functions.map(func => (
                <div key={func.id} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: func.color }}
                  />
                  <span className="text-gray-300 font-mono">{func.expression}</span>
                  <button
                    onClick={() => removeFunction(func.id)}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* JSXGraph Canvas */}
      {!isBrowser ? (
        <div 
          className="flex items-center justify-center text-gray-400"
          style={{ 
            width: isFullscreen ? '100vw' : width, 
            height: isFullscreen ? '100vh' : height,
            backgroundColor: '#0f0f1a'
          }}
        >
          Chargement de l'atelier de géométrie...
        </div>
      ) : (
        <div 
          ref={boardRef}
          className="jxgbox" 
          style={{ 
            width: isFullscreen ? '100vw' : width, 
            height: isFullscreen ? '100vh' : height,
            backgroundColor: '#0f0f1a'
          }}
        />
      )}
      
      {/* Info Panel */}
      <div className="absolute top-4 right-4 bg-[#1a1a2e]/90 backdrop-blur rounded-lg p-3 border border-gray-800 max-w-xs">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Info className="w-4 h-4" />
          <span>Outil: {tools.find(t => t.id === selectedTool)?.label}</span>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Points: {points.length}</p>
          <p>Segments: {lines.filter(l => !l.dashed).length}</p>
          <p>Cercles: {circles.length}</p>
          <p>Triangles: {triangles.length}</p>
          {functions.length > 0 && (
            <p>Fonctions: {functions.length}</p>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="p-3 bg-[#1a1a2e] border-t border-gray-800 text-sm text-gray-400">
        <p className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          {selectedTool === 'point' && 'Cliquez pour ajouter un point'}
          {selectedTool === 'segment' && 'Cliquez sur 2 points pour créer un segment'}
          {selectedTool === 'line' && 'Cliquez sur 2 points pour créer une droite (infinie)'}
          {selectedTool === 'circle' && 'Cliquez sur le centre puis sur un point du rayon'}
          {selectedTool === 'triangle' && 'Cliquez sur 3 points pour créer un triangle'}
          {selectedTool === 'function' && 'Utilisez le panneau des fonctions pour tracer des expressions'}
          {selectedTool === 'select' && 'Cliquez et déplacez les points'}
          {selectedTool === 'delete' && 'Cliquez sur un élément pour le supprimer'}
          {showFunctionInput && 'Entrez une expression mathématique et cliquez sur Tracer'}
        </p>
      </div>
    </div>
  );
}
