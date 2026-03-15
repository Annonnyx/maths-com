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
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Grid3X3,
  Maximize,
  Download,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Palette,
  Copy,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface FunctionData {
  id: string;
  name: string;
  expression: string;
  color: string;
  visible: boolean;
  jsxgraphFunction?: any;
}

interface FunctionPlotterProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showVariationTable?: boolean;
  readOnly?: boolean;
  initialFunctions?: FunctionData[];
}

export default function FunctionPlotter({ 
  width = 800, 
  height = 500, 
  showGrid = true,
  showAxes = true,
  showVariationTable = false,
  readOnly = false,
  initialFunctions = []
}: FunctionPlotterProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<any>(null);
  const [functions, setFunctions] = useState<FunctionData[]>(initialFunctions);
  const [functionInput, setFunctionInput] = useState('');
  const [showGridState, setShowGridState] = useState(showGrid);
  const [showAxesState, setShowAxesState] = useState(showAxes);
  const [showVariationTableState, setShowVariationTableState] = useState(showVariationTable);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [showSettings, setShowSettings] = useState(false);
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Color palette
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  // Function examples
  const functionExamples = [
    { name: 'Linéaire', expression: '2*x + 1', icon: '📈' },
    { name: 'Quadratique', expression: 'x^2 - 4*x + 3', icon: '🔺' },
    { name: 'Sinus', expression: '2*sin(x)', icon: '〰️' },
    { name: 'Cosinus', expression: 'cos(x) + 1', icon: '〰️' },
    { name: 'Exponentielle', expression: 'exp(x)', icon: '📈' },
    { name: 'Logarithme', expression: 'log(x)', icon: '📉' },
    { name: 'Racine', expression: 'sqrt(x)', icon: '🔳' },
    { name: 'Inverse', expression: '1/x', icon: '🔄' }
  ];

  // Initialize JSXGraph board
  useEffect(() => {
    if (!boardRef.current || !isBrowser || !JXG) return;

    // Create JSXGraph board
    const jsxBoard = JXG.JSXGraph.initBoard(boardRef.current, {
      boundingbox: [xMin, yMax, xMax, yMin], // [xmin, ymax, xmax, ymin]
      axis: showAxesState,
      grid: showGridState,
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
        min: 0.1,
        max: 10
      }
    });

    // Add fullscreen functionality
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        boardRef.current?.requestFullscreen().then(() => {
          setIsFullscreen(true);
          setTimeout(() => {
            jsxBoard.resizeContainer(window.innerWidth, window.innerHeight);
            jsxBoard.update();
          }, 100);
        });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
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
      if (document.fullscreenElement && boardRef.current) {
        jsxBoard.resizeContainer(window.innerWidth, window.innerHeight);
      } else if (!document.fullscreenElement) {
        jsxBoard.resizeContainer(width, height);
      }
      jsxBoard.update();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    (jsxBoard as any).fullscreenHandler = handleFullscreen;

    setBoard(jsxBoard);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      JXG.JSXGraph.freeBoard(jsxBoard);
    };
  }, [showAxesState, showGridState, width, height, xMin, yMax, xMax, yMax]);

  // Update grid and axes visibility
  useEffect(() => {
    if (board) {
      board.options.axis.show = showAxesState;
      board.options.grid.show = showGridState;
      board.update();
    }
  }, [showAxesState, showGridState, board]);

  // Update bounding box
  useEffect(() => {
    if (board) {
      board.setBoundingBox([xMin, yMax, xMax, yMin]);
      board.update();
    }
  }, [xMin, yMax, xMax, yMax, board]);

  // Plot functions
  useEffect(() => {
    if (!board) return;

    // Clear existing functions
    functions.forEach(func => {
      if (func.jsxgraphFunction) {
        board.removeObject(func.jsxgraphFunction);
      }
    });

    // Plot all functions
    functions.forEach(func => {
      if (func.visible) {
        const graphFunction = board.create('functiongraph', [
          (x: number) => {
            // Safe evaluation of the function
            try {
              const expr = func.expression
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
          strokeColor: func.color,
          strokeWidth: 2,
          name: func.name,
          withLabel: true,
          label: {
            position: 'top',
            offsets: [0, -10]
          }
        });

        func.jsxgraphFunction = graphFunction;
      }
    });

    board.update();
  }, [board, functions]);

  // Add new function
  const addFunction = useCallback(() => {
    if (!functionInput.trim()) return;

    try {
      // Test if expression is valid
      const testExpr = functionInput
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
        .replace(/x/g, '1');

      const testResult = Function('"use strict"; return (' + testExpr + ')')();
      
      if (isNaN(testResult)) {
        throw new Error('Invalid expression');
      }

      const color = colors[functions.length % colors.length];
      const funcName = `f${functions.length + 1}`;

      const newFunction: FunctionData = {
        id: `func_${Date.now()}`,
        name: funcName,
        expression: functionInput,
        color,
        visible: true
      };

      setFunctions(prev => [...prev, newFunction]);
      setFunctionInput('');
    } catch (error) {
      console.error('Invalid function expression:', error);
      // Could show an error message to user here
    }
  }, [functionInput, functions, colors]);

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

  // Toggle function visibility
  const toggleFunctionVisibility = (id: string) => {
    setFunctions(prev => prev.map(func => 
      func.id === id ? { ...func, visible: !func.visible } : func
    ));
  };

  // Duplicate function
  const duplicateFunction = (func: FunctionData) => {
    const newFunc: FunctionData = {
      ...func,
      id: `func_${Date.now()}`,
      name: `${func.name}_copy`,
      expression: func.expression,
      visible: true
    };
    setFunctions(prev => [...prev, newFunc]);
  };

  // Clear all functions
  const clearAll = () => {
    if (board) {
      functions.forEach(func => {
        if (func.jsxgraphFunction) {
          board.removeObject(func.jsxgraphFunction);
        }
      });
    }
    setFunctions([]);
  };

  // Export as image
  const exportImage = () => {
    if (board) {
      const svg = board.renderer.svgRoot;
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `functions_${Date.now()}.svg`;
      a.click();
      
      URL.revokeObjectURL(url);
    }
  };

  // Calculate variation table for a function
  const getVariationTable = (func: FunctionData) => {
    // This is a simplified version - would need more sophisticated analysis
    const points = [];
    const step = (xMax - xMin) / 20;
    
    for (let x = xMin; x <= xMax; x += step) {
      try {
        const expr = func.expression
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
          .replace(/x/g, `(${x})`);
        
        const y = Function('"use strict"; return (' + expr + ')')();
        
        if (!isNaN(y) && isFinite(y)) {
          points.push({ x, y });
        }
      } catch (e) {
        // Skip invalid points
      }
    }
    
    return points;
  };

  return (
    <div className={`bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1a1a2e] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Traceur de Fonctions</h2>
            <p className="text-sm text-gray-400">Visualisez des fonctions mathématiques</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all ${
              showSettings ? 'bg-indigo-500/20' : 'hover:bg-gray-800'
            }`}
            title="Paramètres"
          >
            <Settings className={`w-4 h-4 ${showSettings ? 'text-indigo-400' : 'text-gray-400'}`} />
          </button>
          
          <button
            onClick={exportImage}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            title="Exporter"
          >
            <Download className="w-4 h-4 text-green-400" />
          </button>
          
          <button
            onClick={() => (board as any)?.fullscreenHandler?.()}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            title="Plein écran"
          >
            <Maximize className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={clearAll}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-all"
            title="Tout effacer"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Main Canvas Area */}
        <div className="flex-1">
          {/* Function Input */}
          <div className="p-4 bg-[#1a1a2e] border-b border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                placeholder="Entrez une fonction (ex: 2*x+1, sin(x), x^2, sqrt(x))..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && addFunction()}
                disabled={readOnly}
              />
              
              <div className="flex items-center gap-1">
                <Palette className="w-4 h-4 text-gray-400 mr-1" />
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-white scale-110' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Couleur ${color}`}
                  />
                ))}
              </div>
              
              <button
                onClick={addFunction}
                disabled={readOnly}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Function Examples */}
            <div className="mt-3 flex flex-wrap gap-2">
              {functionExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setFunctionInput(example.expression)}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-all"
                  title={`Ajouter ${example.name}: ${example.expression}`}
                >
                  <span className="mr-1">{example.icon}</span>
                  {example.name}
                </button>
              ))}
            </div>
          </div>

          {/* JSXGraph Canvas */}
          {!isBrowser ? (
            <div 
              className="flex items-center justify-center text-gray-400"
              style={{ 
                width: isFullscreen ? '100vw' : width, 
                height: isFullscreen ? '100vh' : height - 100,
                backgroundColor: '#0f0f1a'
              }}
            >
              <div className="text-center">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Chargement du traceur de fonctions...</p>
              </div>
            </div>
          ) : (
            <div 
              ref={boardRef}
              className="jxgbox" 
              style={{ 
                width: isFullscreen ? '100vw' : width, 
                height: isFullscreen ? '100vh' : height - 100,
                backgroundColor: '#0f0f1a'
              }}
            />
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-80 bg-[#1a1a2e] border-l border-gray-800 p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Paramètres</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* View Settings */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Affichage</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={showGridState}
                    onChange={(e) => setShowGridState(e.target.checked)}
                    className="rounded"
                  />
                  Grille
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={showAxesState}
                    onChange={(e) => setShowAxesState(e.target.checked)}
                    className="rounded"
                  />
                  Axes
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={showVariationTableState}
                    onChange={(e) => setShowVariationTableState(e.target.checked)}
                    className="rounded"
                  />
                  Tableau de variations
                </label>
              </div>
            </div>

            {/* Bounds Settings */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Limites du graphique</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">X min</label>
                  <input
                    type="number"
                    value={xMin}
                    onChange={(e) => setXMin(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">X max</label>
                  <input
                    type="number"
                    value={xMax}
                    onChange={(e) => setXMax(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Y min</label>
                  <input
                    type="number"
                    value={yMin}
                    onChange={(e) => setYMin(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Y max</label>
                  <input
                    type="number"
                    value={yMax}
                    onChange={(e) => setYMax(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Zoom</label>
              <div className="flex gap-2">
                <button
                  onClick={() => board && board.zoomIn()}
                  className="flex-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300"
                >
                  <ZoomIn className="w-3 h-3 inline mr-1" />
                  Zoom +
                </button>
                <button
                  onClick={() => board && board.zoomOut()}
                  className="flex-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300"
                >
                  <ZoomOut className="w-3 h-3 inline mr-1" />
                  Zoom -
                </button>
                <button
                  onClick={() => board && board.zoom100()}
                  className="flex-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300"
                >
                  <RotateCcw className="w-3 h-3 inline mr-1" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Functions Panel */}
        {!showSettings && (
          <div className="w-80 bg-[#1a1a2e] border-l border-gray-800 p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Fonctions ({functions.length})</h3>
            
            {functions.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucune fonction ajoutée</p>
            ) : (
              <div className="space-y-2">
                {functions.map(func => (
                  <div key={func.id} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: func.color }}
                        />
                        <span className="text-sm font-medium text-white">{func.name}(x) = {func.expression}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFunctionVisibility(func.id)}
                          className="p-1 rounded hover:bg-gray-700"
                          title={func.visible ? 'Masquer' : 'Afficher'}
                        >
                          {func.visible ? (
                            <Eye className="w-3 h-3 text-gray-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={() => duplicateFunction(func)}
                          className="p-1 rounded hover:bg-gray-700"
                          title="Dupliquer"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                        <button
                          onClick={() => removeFunction(func.id)}
                          className="p-1 rounded hover:bg-gray-700"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    {showVariationTableState && func.visible && (
                      <div className="mt-2 text-xs text-gray-400">
                        <div className="font-medium mb-1">Tableau de valeurs:</div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {getVariationTable(func).slice(0, 6).map((point, index) => (
                            <div key={index} className="flex justify-between">
                              <span>x={point.x.toFixed(1)}</span>
                              <span>y={point.y.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
