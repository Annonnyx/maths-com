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
  jsxgraphPoint: any;
}

interface GeometryLine {
  id: string;
  name: string;
  point1Id: string;
  point2Id: string;
  color: string;
  jsxgraphLine: any;
}

interface GeometryCircle {
  id: string;
  name: string;
  centerId: string;
  radiusPointId: string;
  color: string;
  jsxgraphCircle: any;
}

interface GeometryPolygon {
  id: string;
  name: string;
  pointIds: string[];
  color: string;
  jsxgraphPolygon: any;
}

interface GeometryFunction {
  id: string;
  name: string;
  expression: string;
  color: string;
  jsxgraphFunction: any;
}

interface HistoryItem {
  action: string;
  data: any;
  timestamp: Date;
}

type GeometryTool = 'select' | 'point' | 'line' | 'circle' | 'polygon' | 'function' | 'delete';

interface GeometryCanvasProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showMeasurements?: boolean;
  readOnly?: boolean;
  onShapeCreated?: (shape: any) => void;
}

export default function GeometryCanvas({
  width = 800,
  height = 600,
  showGrid = true,
  showAxes = true,
  showMeasurements = true,
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
  const [showTicks, setShowTicks] = useState(true); // NOUVEAU: État pour les graduations
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

  // Initialize JSXGraph board - simplified approach
  useEffect(() => {
    if (!boardRef.current || !isBrowser) return;

    // Simple flag to prevent multiple initializations
    let isInitialized = false;
    
    const initBoard = () => {
      if (isInitialized || !boardRef.current) return;
      
      try {
        // Check if JSXGraph is available
        if (!JXG) {
          console.error('JSXGraph not available');
          setIsLoading(false);
          return;
        }

        // Clear any existing content
        if (boardRef.current) {
          boardRef.current.innerHTML = '';
        }

        // Create JSXGraph board with minimal options
        const jsxBoard = JXG.JSXGraph.initBoard('geometry-board', {
          boundingbox: [-20, 20, 20, -20],
          axis: showAxesState,
          grid: showGridState,
          showCopyright: false,
          showNavigation: false
        });

        // Apply styling after board is created
        setTimeout(() => {
          if (jsxBoard && jsxBoard.defaultAxes) {
            try {
              // Style axes
              if (jsxBoard.defaultAxes.x) {
                jsxBoard.defaultAxes.x.setAttribute('strokeColor', '#ffffff');
                jsxBoard.defaultAxes.x.setAttribute('strokeWidth', 1);
                // NOUVEAU: Gérer les graduations
                if (jsxBoard.defaultAxes.x.ticks) {
                  jsxBoard.defaultAxes.x.ticks.setAttribute('visible', showTicks);
                  jsxBoard.defaultAxes.x.ticks.setAttribute('strokeColor', '#ffffff');
                }
              }
              if (jsxBoard.defaultAxes.y) {
                jsxBoard.defaultAxes.y.setAttribute('strokeColor', '#ffffff');
                jsxBoard.defaultAxes.y.setAttribute('strokeWidth', 1);
                // NOUVEAU: Gérer les graduations
                if (jsxBoard.defaultAxes.y.ticks) {
                  jsxBoard.defaultAxes.y.ticks.setAttribute('visible', showTicks);
                  jsxBoard.defaultAxes.y.ticks.setAttribute('strokeColor', '#ffffff');
                }
              }
              
              // Style grid
              if (jsxBoard.defaultGrid) {
                jsxBoard.defaultGrid.setAttribute('strokeColor', '#ffffff');
                jsxBoard.defaultGrid.setAttribute('strokeOpacity', 0.1);
              }
              
              jsxBoard.update();
            } catch (e) {
              console.error('Error styling board:', e);
            }
          }
        }, 100);

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
        isInitialized = true;

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
    };

    // Wait a bit for DOM to be ready
    const timer = setTimeout(initBoard, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []); // Only run once

  // NOUVEAU: Effet pour mettre à jour les graduations
  useEffect(() => {
    if (board && board.defaultAxes) {
      try {
        // Mettre à jour les graduations des axes X et Y
        if (board.defaultAxes.x && board.defaultAxes.x.ticks) {
          board.defaultAxes.x.ticks.setAttribute('visible', showTicks);
        }
        if (board.defaultAxes.y && board.defaultAxes.y.ticks) {
          board.defaultAxes.y.ticks.setAttribute('visible', showTicks);
        }
        board.update();
      } catch (e) {
        console.error('Error updating ticks:', e);
      }
    }
  }, [showTicks, board]);

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
      addToHistory('create_point', newPoint);
      
      if (onShapeCreated) {
        onShapeCreated(newPoint);
      }

      return newPoint;
    } catch (e) {
      console.error('Error creating point:', e);
      return null;
    }
  }, [board, points, selectedColor, showLabels, selectedTool]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!board || readOnly) return;

    try {
      const coords = JXG.COORDS_BY_SCREEN[e.clientX - e.currentTarget.getBoundingClientRect().left][e.clientY - e.currentTarget.getBoundingClientRect().top];
      const x = coords.usrCoords[1];
      const y = coords.usrCoords[2];

      switch (selectedTool) {
        case 'point':
          createPoint(x, y);
          break;
        case 'delete':
          // Handle deletion
          break;
        default:
          break;
      }
    } catch (e) {
      console.error('Error handling canvas click:', e);
    }
  }, [board, selectedTool, createPoint, readOnly]);

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

  // Add to history
  const addToHistory = (action: string, data: any) => {
    setHistory(prev => [...prev, {
      action,
      data,
      timestamp: new Date()
    }]);
  };

  // Handle save
  const handleSave = () => {
    const drawingData = {
      points,
      lines,
      circles,
      polygons,
      functions,
      timestamp: new Date()
    };
    
    const drawingName = `Dessin_${new Date().toLocaleDateString()}`;
    setSavedDrawings(prev => [...prev, {
      name: drawingName,
      date: new Date().toISOString(),
      data: drawingData
    }]);
    
    // Save to localStorage
    localStorage.setItem('geometry_drawings', JSON.stringify([...savedDrawings, {
      name: drawingName,
      date: new Date().toISOString(),
      data: drawingData
    }]));
    
    addToHistory('save', drawingName);
  };

  // Handle export
  const handleExport = () => {
    if (!board) return;
    
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
      addToHistory('export', 'SVG exporté');
    } catch (e) {
      console.error('Error exporting:', e);
    }
  };

  // Zoom functions
  const zoomIn = () => {
    if (board) {
      try {
        board.zoomIn();
        board.update();
      } catch (e) {
        console.error('Error zooming in:', e);
      }
    }
  };

  const zoomOut = () => {
    if (board) {
      try {
        board.zoomOut();
        board.update();
      } catch (e) {
        console.error('Error zooming out:', e);
      }
    }
  };

  const zoom100 = () => {
    if (board) {
      try {
        board.setBoundingBox([-20, 20, 20, -20]);
        board.update();
      } catch (e) {
        console.error('Error resetting zoom:', e);
      }
    }
  };

  // Tools configuration
  const tools = [
    { id: 'select' as GeometryTool, label: 'Sélection', icon: MousePointer2 },
    { id: 'point' as GeometryTool, label: 'Point', icon: Move },
    { id: 'line' as GeometryTool, label: 'Droite', icon: Ruler },
    { id: 'circle' as GeometryTool, label: 'Cercle', icon: Circle },
    { id: 'polygon' as GeometryTool, label: 'Polygone', icon: Triangle },
    { id: 'function' as GeometryTool, label: 'Fonction', icon: FunctionSquare },
    { id: 'delete' as GeometryTool, label: 'Supprimer', icon: Trash2 }
  ];

  return (
    <div className="w-full h-full bg-[#0f0f1a] rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-[#1a1a2e] border-b border-gray-800 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Tools */}
          <div className="flex items-center gap-2">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={tool.label}
              >
                <tool.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    selectedColor === color
                      ? 'border-white scale-110'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGridState(!showGridState)}
              className={`p-2 rounded-lg transition-colors ${
                showGridState
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Grille"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowAxesState(!showAxesState)}
              className={`p-2 rounded-lg transition-colors ${
                showAxesState
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Axes"
            >
              <Move3d className="w-4 h-4" />
            </button>

            {/* NOUVEAU: Bouton pour les graduations */}
            <button
              onClick={() => setShowTicks(!showTicks)}
              className={`p-2 rounded-lg transition-colors ${
                showTicks
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Graduations"
            >
              <Tag className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-2 rounded-lg transition-colors ${
                showLabels
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Étiquettes"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomIn}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              title="Zoom avant"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              title="Zoom arrière"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={zoom100}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              title="Zoom 100%"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleSave}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              title="Sauvegarder"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              title="Exporter"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFunctionInput(!showFunctionInput)}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              title="Fonction"
            >
              <FunctionSquare className="w-4 h-4" />
            </button>
            <button
              onClick={clearAll}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Tout effacer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
          <div className="text-xs text-gray-500">
            Points: {points.length} | Lignes: {lines.length} | Cercles: {circles.length}
          </div>
        </div>

        {/* Function Input */}
        {showFunctionInput && (
          <div className="absolute bottom-4 left-4 right-4 bg-[#1a1a2e]/90 backdrop-blur rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <FunctionSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Tracer une fonction</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                placeholder="ex: x^2, sin(x), cos(x)"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => {
                  // TODO: Implement function plotting
                  setFunctionInput('');
                  setShowFunctionInput(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Tracer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
