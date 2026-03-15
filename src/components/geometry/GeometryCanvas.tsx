'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Import JSXGraph only in browser environment
let JXG: any = null;
if (isBrowser) {
  try {
    JXG = require('jsxgraph');
  } catch (e) {
    console.error('JSXGraph not available:', e);
  }
}

import { 
  MousePointer2, 
  Move, 
  Trash2, 
  Calculator,
  Ruler,
  Circle,
  Triangle,
  Undo,
  Grid3X3,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move3d,
  FunctionSquare,
  Save,
  Download,
  Share2,
  RefreshCw,
  Eye,
  EyeOff,
  Palette,
  Tag,
  Copy,
  Settings
} from 'lucide-react';

// Types for geometry objects
interface GeometryPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  jsxgraphPoint?: any;
}

interface GeometryLine {
  id: string;
  name: string;
  pointIds: [string, string];
  type: 'segment' | 'line' | 'vector';
  color: string;
  jsxgraphLine?: any;
}

interface GeometryCircle {
  id: string;
  name: string;
  centerId: string;
  radiusPointId: string;
  color: string;
  jsxgraphCircle?: any;
}

interface GeometryPolygon {
  id: string;
  name: string;
  pointIds: string[];
  color: string;
  filled: boolean;
  jsxgraphPolygon?: any;
}

interface GeometryFunction {
  id: string;
  name: string;
  expression: string;
  color: string;
  jsxgraphFunction?: any;
}

interface HistoryItem {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
}

export type GeometryTool = 
  | 'select' 
  | 'point' 
  | 'segment' 
  | 'line' 
  | 'circle' 
  | 'triangle' 
  | 'vector' 
  | 'symmetry' 
  | 'pythagore' 
  | 'function' 
  | 'delete'
  | 'measure'
  | 'label';

interface GeometryCanvasProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  readOnly?: boolean;
  onShapeCreated?: (shape: any) => void;
}

export default function GeometryCanvas({ 
  width = 800, 
  height = 600, 
  showGrid = true,
  showAxes = true,
  readOnly = false,
  onShapeCreated
}: GeometryCanvasProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<any>(null);
  const [points, setPoints] = useState<GeometryPoint[]>([]);
  const [lines, setLines] = useState<GeometryLine[]>([]);
  const [circles, setCircles] = useState<GeometryCircle[]>([]);
  const [polygons, setPolygons] = useState<GeometryPolygon[]>([]);
  const [functions, setFunctions] = useState<GeometryFunction[]>([]);
  const [selectedTool, setSelectedTool] = useState<GeometryTool>('point');
  const [showGridState, setShowGridState] = useState(showGrid);
  const [showAxesState, setShowAxesState] = useState(showAxes);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [functionInput, setFunctionInput] = useState('');
  const [showFunctionInput, setShowFunctionInput] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#00ff00');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedDrawings, setSavedDrawings] = useState<{name: string; date: string; data: any}[]>([]);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Color palette
  const colors = [
    '#00ff00', '#ff00ff', '#00ffff', '#ffff00', 
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'
  ];

  // Initialize JSXGraph board
  useEffect(() => {
    if (!boardRef.current || !isBrowser) return;

    setIsLoading(true);
    setError(null);

    // Simple timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        // Check if JSXGraph is available
        if (!JXG) {
          throw new Error('JSXGraph library not loaded');
        }

        // Clear any existing content
        if (boardRef.current) {
          boardRef.current.innerHTML = '';
        }

        // Create JSXGraph board with minimal configuration
        const jsxBoard = JXG.JSXGraph.initBoard('geometry-board', {
          boundingbox: [-20, 20, 20, -20],
          axis: showAxesState,
          grid: showGridState,
          showCopyright: false,
          showNavigation: false
        });

        // Set board ID
        if (boardRef.current) {
          boardRef.current.id = 'geometry-board';
        }

        // Simple fullscreen handler
        const handleFullscreen = () => {
          if (!document.fullscreenElement && boardRef.current) {
            boardRef.current.requestFullscreen().then(() => {
              setIsFullscreen(true);
              if (jsxBoard) {
                setTimeout(() => {
                  jsxBoard.resizeContainer(window.innerWidth, window.innerHeight);
                  jsxBoard.update();
                }, 100);
              }
            });
          } else if (document.fullscreenElement) {
            document.exitFullscreen().then(() => {
              setIsFullscreen(false);
              if (jsxBoard) {
                setTimeout(() => {
                  jsxBoard.resizeContainer(width, height);
                  jsxBoard.update();
                }, 100);
              }
            });
          }
        };

        document.addEventListener('fullscreenchange', handleFullscreen);
        (jsxBoard as any).fullscreenHandler = handleFullscreen;

        setBoard(jsxBoard);
        setIsLoading(false);

        // Cleanup function
        return () => {
          document.removeEventListener('fullscreenchange', handleFullscreen);
          if (jsxBoard) {
            try {
              JXG.JSXGraph.freeBoard(jsxBoard);
            } catch (e) {
              console.error('Error freeing board:', e);
            }
          }
        };
      } catch (err) {
        console.error('Error initializing JSXGraph:', err);
        setError('Failed to initialize geometry board');
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []); // Empty dependency array - only run once

  // Update grid and axes visibility and styling
  useEffect(() => {
    if (board && board.options) {
      try {
        // Update axes visibility
        if (board.defaultAxes) {
          if (board.defaultAxes.x) {
            board.defaultAxes.x.setAttribute('visible', showAxesState);
            board.defaultAxes.x.setAttribute('strokeColor', '#ffffff');
            board.defaultAxes.x.setAttribute('strokeWidth', 1);
          }
          if (board.defaultAxes.y) {
            board.defaultAxes.y.setAttribute('visible', showAxesState);
            board.defaultAxes.y.setAttribute('strokeColor', '#ffffff');
            board.defaultAxes.y.setAttribute('strokeWidth', 1);
          }
        }
        
        // Update grid visibility
        if (board.defaultGrid) {
          board.defaultGrid.setAttribute('visible', showGridState);
          board.defaultGrid.setAttribute('strokeColor', '#ffffff');
          board.defaultGrid.setAttribute('strokeOpacity', 0.1);
        }
        
        board.update();
      } catch (e) {
        console.error('Error updating board options:', e);
      }
    }
  }, [showAxesState, showGridState, board]);

  // Handle tool selection
  const handleToolChange = (tool: GeometryTool) => {
    setSelectedTool(tool);
    setSelectedObject(null);
    
    // Update JSXGraph interaction mode
    if (board) {
      try {
        board.mode = board.BOARD_MODE_NONE;
      } catch (e) {
        console.error('Error setting board mode:', e);
      }
    }
  };

  // Create point
  const createPoint = useCallback((x: number, y: number, name?: string) => {
    if (!board || !JXG) return null;

    try {
      const pointName = name || `P${points.length + 1}`;
      const point = board.create('point', [x, y], {
        name: showLabels ? pointName : '',
        strokeColor: '#ffffff',
        fillColor: selectedColor,
        size: 5,
        strokeWidth: 2,
        withLabel: showLabels,
        label: {
          offset: [10, 10],
          strokeColor: '#ffffff',
          fillColor: '#ffffff',
          fontSize: 14
        }
      });

      const newPoint: GeometryPoint = {
        id: `point_${Date.now()}`,
        name: pointName,
        x,
        y,
        color: selectedColor,
        jsxgraphPoint: point
      };

      setPoints(prev => [...prev, newPoint]);
      addToHistory('create', `Point ${pointName} créé (${x.toFixed(1)}, ${y.toFixed(1)})`);
      
      // Add click handler for point selection
      if (point.on) {
        point.on('down', () => {
          if (selectedTool === 'select') {
            setSelectedObject(newPoint);
            setShowPropertyPanel(true);
          } else if (selectedTool === 'delete') {
            deletePoint(newPoint.id);
          }
        });
      }

      return newPoint;
    } catch (e) {
      console.error('Error creating point:', e);
      return null;
    }
  }, [board, points, selectedColor, showLabels, selectedTool]);

  // Handle canvas click
  const handleCanvasClick = (e: any) => {
    if (readOnly || !board || !JXG) return;

    try {
      const coords = board.getUsrCoordsOfMouse(e);
      const x = coords[0];
      const y = coords[1];

      switch (selectedTool) {
        case 'point':
          createPoint(x, y);
          break;
        case 'segment':
        case 'line':
        case 'vector':
          console.log(`Creating ${selectedTool} - multi-point selection needed`);
          break;
        case 'circle':
          console.log('Creating circle - center + radius point selection needed');
          break;
        case 'triangle':
          console.log('Creating triangle - 3-point selection needed');
          break;
      }
    } catch (error) {
      console.error('Error handling canvas click:', error);
    }
  };

  // Add to history
  const addToHistory = (action: string, description: string) => {
    setHistory(prev => [{
      id: `hist_${Date.now()}`,
      action,
      description,
      timestamp: new Date()
    }, ...prev].slice(0, 50));
  };

  // Delete point
  const deletePoint = (id: string) => {
    setPoints(prev => {
      const pointToRemove = prev.find(p => p.id === id);
      if (pointToRemove && pointToRemove.jsxgraphPoint && board) {
        try {
          board.removeObject(pointToRemove.jsxgraphPoint);
          addToHistory('delete', `Point ${pointToRemove.name} supprimé`);
        } catch (e) {
          console.error('Error removing point:', e);
        }
      }
      return prev.filter(p => p.id !== id);
    });
  };

  // Clear all
  const clearAll = () => {
    if (board) {
      try {
        // Remove all objects safely using suspendUpdate
        board.suspendUpdate();
        
        // Remove each object type separately
        [...points].forEach(point => {
          if (point.jsxgraphPoint && board.removeObject) {
            try {
              board.removeObject(point.jsxgraphPoint);
            } catch (e) {
              // Ignore errors for already removed objects
            }
          }
        });
        
        [...lines].forEach(line => {
          if (line.jsxgraphLine && board.removeObject) {
            try {
              board.removeObject(line.jsxgraphLine);
            } catch (e) {
              // Ignore errors for already removed objects
            }
          }
        });
        
        [...circles].forEach(circle => {
          if (circle.jsxgraphCircle && board.removeObject) {
            try {
              board.removeObject(circle.jsxgraphCircle);
            } catch (e) {
              // Ignore errors for already removed objects
            }
          }
        });
        
        [...polygons].forEach(polygon => {
          if (polygon.jsxgraphPolygon && board.removeObject) {
            try {
              board.removeObject(polygon.jsxgraphPolygon);
            } catch (e) {
              // Ignore errors for already removed objects
            }
          }
        });
        
        [...functions].forEach(func => {
          if (func.jsxgraphFunction && board.removeObject) {
            try {
              board.removeObject(func.jsxgraphFunction);
            } catch (e) {
              // Ignore errors for already removed objects
            }
          }
        });
        
        // Reset the view
        board.setBoundingBox([-20, 20, 20, -20]);
        board.unsuspendUpdate();
        board.update();
      } catch (e) {
        console.error('Error clearing board:', e);
        // Fallback: just reset the view
        try {
          board.suspendUpdate();
          board.setBoundingBox([-20, 20, 20, -20]);
          board.unsuspendUpdate();
          board.update();
        } catch (e2) {
          console.error('Error resetting board:', e2);
        }
      }
    }
    
    // Clear all state
    setPoints([]);
    setLines([]);
    setCircles([]);
    setPolygons([]);
    setFunctions([]);
    addToHistory('clear', 'Canvas effacé');
  };

  // Handle save
  const handleSave = () => {
    const drawingData = {
      points,
      lines,
      circles,
      polygons,
      functions,
      timestamp: new Date().toISOString()
    };
    
    const drawingName = `Dessin_${new Date().toLocaleDateString('fr-FR')}`;
    setSavedDrawings(prev => [...prev, {
      name: drawingName,
      date: new Date().toLocaleDateString('fr-FR'),
      data: drawingData
    }]);
    
    // Save to localStorage
    try {
      localStorage.setItem(`geometry_drawing_${Date.now()}`, JSON.stringify(drawingData));
      addToHistory('save', `Dessin sauvegardé: ${drawingName}`);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  // Handle export
  const handleExport = () => {
    if (board) {
      try {
        const svg = board.renderer.svgRoot;
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `geometry_${Date.now()}.svg`;
        a.click();
        
        URL.revokeObjectURL(url);
        addToHistory('export', 'Dessin exporté en SVG');
      } catch (e) {
        console.error('Error exporting:', e);
      }
    }
  };

  // Handle share
  const handleShare = () => {
    try {
      const shareUrl = `${window.location.origin}/dashboard/geometry?shared=${Date.now()}`;
      navigator.clipboard.writeText(shareUrl);
      addToHistory('share', 'Lien de partage copié');
    } catch (e) {
      console.error('Error sharing:', e);
    }
  };

  // Handle undo
  const handleUndo = () => {
    console.log('Undo functionality to be implemented');
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    if (board) {
      try {
        board.zoomIn();
      } catch (e) {
        console.error('Error zooming in:', e);
      }
    }
  };

  const handleZoomOut = () => {
    if (board) {
      try {
        board.zoomOut();
      } catch (e) {
        console.error('Error zooming out:', e);
      }
    }
  };

  const handleZoomReset = () => {
    if (board) {
      try {
        board.zoom100();
      } catch (e) {
        console.error('Error resetting zoom:', e);
      }
    }
  };

  // Handle function plotting
  const handleFunctionSubmit = () => {
    if (!functionInput.trim() || !board || !JXG) return;
    
    try {
      const color = colors[functions.length % colors.length];
      const funcName = `f${functions.length + 1}`;
      
      // Create JSXGraph function
      const func = board.create('functiongraph', [
        (x: number) => {
          // Safe evaluation of the function
          try {
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
        name: showLabels ? `${funcName}(x) = ${functionInput}` : '',
        withLabel: showLabels,
        label: {
          position: 'top',
          offsets: [0, -10]
        }
      });

      const newFunction: GeometryFunction = {
        id: `func_${Date.now()}`,
        name: funcName,
        expression: functionInput,
        color,
        jsxgraphFunction: func
      };

      setFunctions(prev => [...prev, newFunction]);
      addToHistory('create', `Fonction ${funcName}(x) = ${functionInput} tracée`);
      
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
        try {
          board.removeObject(funcToRemove.jsxgraphFunction);
          addToHistory('delete', `Fonction ${funcToRemove.name} supprimée`);
        } catch (e) {
          console.error('Error removing function:', e);
        }
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Tools configuration
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Sélectionner', color: 'text-blue-400' },
    { id: 'point', icon: Move, label: 'Point', color: 'text-indigo-400' },
    { id: 'segment', icon: Ruler, label: 'Segment', color: 'text-pink-400' },
    { id: 'line', icon: Ruler, label: 'Droite', color: 'text-violet-400' },
    { id: 'circle', icon: Circle, label: 'Cercle', color: 'text-amber-400' },
    { id: 'triangle', icon: Triangle, label: 'Triangle', color: 'text-emerald-400' },
    { id: 'vector', icon: Move3d, label: 'Vecteur', color: 'text-cyan-400' },
    { id: 'function', icon: FunctionSquare, label: 'Fonction', color: 'text-purple-400' },
    { id: 'measure', icon: Calculator, label: 'Mesurer', color: 'text-orange-400' },
    { id: 'label', icon: Tag, label: 'Étiqueter', color: 'text-teal-400' },
    { id: 'delete', icon: Trash2, label: 'Effacer', color: 'text-red-400' },
  ] as const;

  // If there's an error, show error message
  if (error) {
    return (
      <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
    }`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-[#1a1a2e] border-b border-gray-800">
        {/* Tools */}
        <div className="flex items-center gap-1">
          {tools.slice(0, 6).map(tool => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id as GeometryTool)}
              disabled={readOnly}
              className={`p-2 rounded-lg transition-all ${
                selectedTool === tool.id 
                  ? 'bg-indigo-500/30 border border-indigo-500/50' 
                  : 'hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              title={tool.label}
            >
              <tool.icon className={`w-4 h-4 ${selectedTool === tool.id ? 'text-indigo-400' : 'text-gray-400'}`} />
            </button>
          ))}
          <div className="w-px h-6 bg-gray-700 mx-1" />
          {tools.slice(6).map(tool => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id as GeometryTool)}
              disabled={readOnly}
              className={`p-2 rounded-lg transition-all ${
                selectedTool === tool.id 
                  ? 'bg-indigo-500/30 border border-indigo-500/50' 
                  : 'hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              title={tool.label}
            >
              <tool.icon className={`w-4 h-4 ${selectedTool === tool.id ? 'text-indigo-400' : 'text-gray-400'}`} />
            </button>
          ))}
        </div>
        
        <div className="w-px h-6 bg-gray-700 mx-2" />
        
        {/* View Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            title="Zoomer"
          >
            <ZoomIn className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            title="Dézoomer"
          >
            <ZoomOut className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={handleZoomReset}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            title="Réinitialiser la vue"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={() => (board as any)?.fullscreenHandler?.()}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            title="Plein écran (prend TOUT l'écran)"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-indigo-400" />
            ) : (
              <Maximize className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-700 mx-2" />
        
        {/* Display Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGridState(!showGridState)}
            className={`p-2 rounded-lg transition-all ${showGridState ? 'bg-indigo-500/20' : 'hover:bg-gray-800'}`}
            title="Grille"
          >
            <Grid3X3 className={`w-4 h-4 ${showGridState ? 'text-indigo-400' : 'text-gray-400'}`} />
          </button>
          
          <button
            onClick={() => setShowAxesState(!showAxesState)}
            className={`p-2 rounded-lg transition-all ${showAxesState ? 'bg-indigo-500/20' : 'hover:bg-gray-800'}`}
            title="Axes"
          >
            <Move3d className={`w-4 h-4 ${showAxesState ? 'text-indigo-400' : 'text-gray-400'}`} />
          </button>
          
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={`p-2 rounded-lg transition-all ${showMeasurements ? 'bg-indigo-500/20' : 'hover:bg-gray-800'}`}
            title="Mesures"
          >
            <Calculator className={`w-4 h-4 ${showMeasurements ? 'text-indigo-400' : 'text-gray-400'}`} />
          </button>
          
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-2 rounded-lg transition-all ${showLabels ? 'bg-indigo-500/20' : 'hover:bg-gray-800'}`}
            title="Étiquettes"
          >
            <Tag className={`w-4 h-4 ${showLabels ? 'text-indigo-400' : 'text-gray-400'}`} />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-700 mx-2" />
        
        {/* Color Picker */}
        <div className="flex items-center gap-1">
          <Palette className="w-4 h-4 text-gray-400 mr-1" />
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              disabled={readOnly}
              className={`w-6 h-6 rounded-full border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedColor === color ? 'border-white scale-110' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color }}
              title={`Couleur ${color}`}
            />
          ))}
        </div>
        
        <div className="flex-1" />
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={readOnly}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler (Ctrl+Z)"
          >
            <Undo className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={handleSave}
            disabled={readOnly}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sauvegarder (Ctrl+S)"
          >
            <Save className="w-4 h-4 text-indigo-400" />
          </button>
          
          <button
            onClick={handleExport}
            disabled={readOnly}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exporter"
          >
            <Download className="w-4 h-4 text-green-400" />
          </button>
          
          <button
            onClick={handleShare}
            disabled={readOnly}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Partager"
          >
            <Share2 className="w-4 h-4 text-purple-400" />
          </button>
          
          <button
            onClick={clearAll}
            disabled={readOnly}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Tout effacer"
          >
            <RefreshCw className="w-4 h-4 text-red-400" />
          </button>
        </div>
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
                  <span className="text-gray-300 font-mono">{func.name}(x) = {func.expression}</span>
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
      
      {/* Main Canvas Area */}
      <div className="relative">
        {/* JSXGraph Canvas */}
        {isLoading ? (
          <div 
            className="flex items-center justify-center text-gray-400"
            style={{ 
              width: isFullscreen ? '100vw' : width, 
              height: isFullscreen ? '100vh' : height - (showFunctionInput ? 100 : 60),
              backgroundColor: '#1a1a2e'
            }}
          >
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p>Chargement de l'atelier de géométrie...</p>
              <p className="text-xs mt-2">Initialisation de JSXGraph</p>
            </div>
          </div>
        ) : !isBrowser ? (
          <div 
            className="flex items-center justify-center text-gray-400"
            style={{ 
              width: isFullscreen ? '100vw' : width, 
              height: isFullscreen ? '100vh' : height - (showFunctionInput ? 100 : 60),
              backgroundColor: '#1a1a2e'
            }}
          >
            <div className="text-center">
              <Info className="w-8 h-8 mx-auto mb-2" />
              <p>Géométrie non disponible en mode serveur</p>
            </div>
          </div>
        ) : (
          <div 
            id="geometry-board"
            ref={boardRef}
            className="jxgbox" 
            onClick={handleCanvasClick}
            style={{ 
              width: isFullscreen ? '100vw' : width, 
              height: isFullscreen ? '100vh' : height - (showFunctionInput ? 100 : 60),
              backgroundColor: '#1a1a2e',
              cursor: selectedTool === 'point' ? 'crosshair' : 'default'
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
            <p>Segments: {lines.filter(l => l.type === 'segment').length}</p>
            <p>Droites: {lines.filter(l => l.type === 'line').length}</p>
            <p>Vecteurs: {lines.filter(l => l.type === 'vector').length}</p>
            <p>Cercles: {circles.length}</p>
            <p>Triangles: {polygons.length}</p>
            {functions.length > 0 && (
              <p>Fonctions: {functions.length}</p>
            )}
          </div>
        </div>
        
        {/* Property Panel */}
        {showPropertyPanel && selectedObject && (
          <div className="absolute top-4 left-4 bg-[#1a1a2e]/90 backdrop-blur rounded-lg p-3 border border-gray-800 max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-300">Propriétés</h3>
              <button
                onClick={() => setShowPropertyPanel(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="text-gray-500">Nom:</span> {selectedObject.name}</p>
              <p><span className="text-gray-500">Type:</span> {selectedObject.jsxgraphPoint ? 'Point' : selectedObject.jsxgraphLine ? 'Ligne' : 'Objet'}</p>
              {selectedObject.jsxgraphPoint && (
                <>
                  <p><span className="text-gray-500">X:</span> {selectedObject.x.toFixed(2)}</p>
                  <p><span className="text-gray-500">Y:</span> {selectedObject.y.toFixed(2)}</p>
                </>
              )}
              <p><span className="text-gray-500">Couleur:</span> 
                <span 
                  className="inline-block w-3 h-3 rounded-full ml-1 align-middle"
                  style={{ backgroundColor: selectedObject.color }}
                />
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="p-2 bg-[#1a1a2e] border-t border-gray-800 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2">
            <Info className="w-3 h-3 text-indigo-400" />
            {selectedTool === 'point' && 'Cliquez pour placer un point'}
            {selectedTool === 'segment' && 'Sélectionnez 2 points pour créer un segment'}
            {selectedTool === 'line' && 'Sélectionnez 2 points pour créer une droite'}
            {selectedTool === 'circle' && 'Sélectionnez centre puis point de rayon'}
            {selectedTool === 'triangle' && 'Sélectionnez 3 points pour créer un triangle'}
            {selectedTool === 'vector' && 'Sélectionnez origine puis extrémité'}
            {selectedTool === 'function' && 'Utilisez le panneau des fonctions'}
            {selectedTool === 'select' && 'Cliquez sur un objet pour le sélectionner'}
            {selectedTool === 'delete' && 'Cliquez sur un objet pour le supprimer'}
            {selectedTool === 'measure' && 'Cliquez sur 2 points pour mesurer la distance'}
            {selectedTool === 'label' && 'Cliquez sur un objet pour l\'étiqueter'}
          </p>
          <div className="flex items-center gap-4">
            <span>Grille: {showGridState ? 'ON' : 'OFF'}</span>
            <span>Axes: {showAxesState ? 'ON' : 'OFF'}</span>
            <span>Zoom: {board?.attr?.zoom?.factor?.toFixed(2) || '1.00'}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
