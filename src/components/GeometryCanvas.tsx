'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  Move3d
} from 'lucide-react';

interface Point {
  id: string;
  x: number;
  y: number;
  label?: string;
  color?: string;
}

interface Line {
  id: string;
  startId: string;
  endId: string;
  color: string;
  dashed?: boolean;
}

interface CircleShape {
  id: string;
  centerId: string;
  radiusPointId: string;
  color: string;
}

interface TriangleShape {
  id: string;
  pointIds: string[];
  color: string;
  fill?: boolean;
}

export type GeometryTool = 'point' | 'line' | 'segment' | 'circle' | 'triangle' | 'select' | 'measure' | 'delete' | 'symmetry' | 'pythagore' | 'vector';

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
  width = 600, 
  height = 400, 
  showGrid = true,
  showAxes = true,
  initialPoints = [],
  readOnly = false,
  onShapeCreated
}: GeometryCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>(initialPoints);
  const [lines, setLines] = useState<Line[]>([]);
  const [circles, setCircles] = useState<CircleShape[]>([]);
  const [triangles, setTriangles] = useState<TriangleShape[]>([]);
  const [selectedTool, setSelectedTool] = useState<GeometryTool>('select');
  const [showGridState, setShowGrid] = useState(showGrid);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [tempLine, setTempLine] = useState<{start: Point; end: Point} | null>(null);
  const [measurement, setMeasurement] = useState<{type: string; value: number} | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [symmetryAxis, setSymmetryAxis] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
  const [pythagoreTriangle, setPythagoreTriangle] = useState<string[] | null>(null);
  const [vectors, setVectors] = useState<{id: string, startId: string, endId: string, color: string}[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [functionInput, setFunctionInput] = useState('');
  const [showFunctionInput, setShowFunctionInput] = useState(false);

  // Grid settings
  const gridSize = 20;
  const gridWidth = (width / scale) + 100; // Extended grid for zoom out
  const gridHeight = (height / scale) + 100;

  const snapToGrid = (value: number) => {
    if (!showGridState) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const getMousePosition = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / scale;
    const y = (e.clientY - rect.top - pan.y) / scale;
    return {
      x: snapToGrid(x),
      y: snapToGrid(y)
    };
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, scale * delta));
    
    // Zoom towards mouse position
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = (mouseX - pan.x) / scale;
    const worldY = (mouseY - pan.y) / scale;
    
    const newPanX = mouseX - worldX * newScale;
    const newPanY = mouseY - worldY * newScale;
    
    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  }, [scale, pan]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse button or shift+left click for panning
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const newPanX = e.clientX - panStart.x;
      const newPanY = e.clientY - panStart.y;
      setPan({ x: newPanX, y: newPanY });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const resetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleSvgClick = (e: React.MouseEvent) => {
    if (readOnly || isDragging) return;
    
    const pos = getMousePosition(e);
    
    switch (selectedTool) {
      case 'point':
        const newPoint: Point = {
          id: `p${points.length + 1}`,
          x: pos.x,
          y: pos.y,
          label: String.fromCharCode(65 + points.length),
          color: '#6366f1'
        };
        setPoints([...points, newPoint]);
        break;
        
      case 'line':
      case 'segment':
        const clickedPoint = points.find(p => 
          Math.abs(p.x - pos.x) < 10 && Math.abs(p.y - pos.y) < 10
        );
        
        if (clickedPoint) {
          if (!selectedPoint) {
            setSelectedPoint(clickedPoint.id);
          } else if (selectedPoint !== clickedPoint.id) {
            // Create line
            const newLine: Line = {
              id: `l${lines.length + 1}`,
              startId: selectedPoint,
              endId: clickedPoint.id,
              color: selectedTool === 'line' ? '#8b5cf6' : '#ec4899',
              dashed: selectedTool === 'line'
            };
            setLines([...lines, newLine]);
            setSelectedPoint(null);
            onShapeCreated?.(newLine);
          }
        }
        break;
        
      case 'circle':
        const centerPoint = points.find(p => 
          Math.abs(p.x - pos.x) < 10 && Math.abs(p.y - pos.y) < 10
        );
        
        if (centerPoint) {
          if (!selectedPoint) {
            setSelectedPoint(centerPoint.id);
          } else if (selectedPoint !== centerPoint.id) {
            const newCircle: CircleShape = {
              id: `c${circles.length + 1}`,
              centerId: selectedPoint,
              radiusPointId: centerPoint.id,
              color: '#f59e0b'
            };
            setCircles([...circles, newCircle]);
            setSelectedPoint(null);
            onShapeCreated?.(newCircle);
          }
        }
        break;
        
      case 'triangle':
        const trianglePoint = points.find(p => 
          Math.abs(p.x - pos.x) < 10 && Math.abs(p.y - pos.y) < 10
        );
        
        if (trianglePoint) {
          const currentIds = selectedPoint ? selectedPoint.split(',') : [];
          if (currentIds.length < 2) {
            setSelectedPoint([...currentIds, trianglePoint.id].join(','));
          } else {
            const newTriangle: TriangleShape = {
              id: `t${triangles.length + 1}`,
              pointIds: [...currentIds, trianglePoint.id],
              color: '#10b981',
              fill: true
            };
            setTriangles([...triangles, newTriangle]);
            setSelectedPoint(null);
            onShapeCreated?.(newTriangle);
          }
        }
        break;
        
      case 'delete':
        const pointToDelete = points.find(p => 
          Math.abs(p.x - pos.x) < 10 && Math.abs(p.y - pos.y) < 10
        );
        if (pointToDelete) {
          setPoints(points.filter(p => p.id !== pointToDelete.id));
          setLines(lines.filter(l => l.startId !== pointToDelete.id && l.endId !== pointToDelete.id));
          setCircles(circles.filter(c => c.centerId !== pointToDelete.id && c.radiusPointId !== pointToDelete.id));
          setTriangles(triangles.filter(t => !t.pointIds.includes(pointToDelete.id)));
          setVectors(vectors.filter(v => v.startId !== pointToDelete.id && v.endId !== pointToDelete.id));
        }
        break;
        
      case 'symmetry':
        const symmetryPoint = points.find(p => 
          Math.abs(p.x - pos.x) < 10 && Math.abs(p.y - pos.y) < 10
        );
        if (symmetryPoint) {
          if (!symmetryAxis) {
            // First point - start axis
            setSymmetryAxis({ x1: symmetryPoint.x, y1: symmetryPoint.y, x2: symmetryPoint.x, y2: symmetryPoint.y });
          } else if (symmetryAxis.x1 === symmetryAxis.x2 && symmetryAxis.y1 === symmetryAxis.y2) {
            // Same point - end axis
            setSymmetryAxis({ ...symmetryAxis, x2: symmetryPoint.x, y2: symmetryPoint.y });
          } else {
            // Second point - create symmetric point
            const midX = (symmetryAxis.x1 + symmetryAxis.x2) / 2;
            const midY = (symmetryAxis.y1 + symmetryAxis.y2) / 2;
            const dx = symmetryPoint.x - midX;
            const dy = symmetryPoint.y - midY;
            
            const symmetricPoint: Point = {
              id: `p${points.length + 1}`,
              x: midX - dx,
              y: midY - dy,
              label: String.fromCharCode(65 + points.length),
              color: '#10b981'
            };
            
            setPoints([...points, symmetricPoint]);
            setSymmetryAxis(null);
            onShapeCreated?.({ type: 'symmetry', point: symmetricPoint });
          }
        }
        break;
        
      case 'pythagore':
        const pythagorePoint = points.find(p => 
          Math.abs(p.x - pos.x) < 10 && Math.abs(p.y - pos.y) < 10
        );
        if (pythagorePoint) {
          if (!pythagoreTriangle) {
            setPythagoreTriangle([pythagorePoint.id]);
          } else if (pythagoreTriangle.length === 1) {
            setPythagoreTriangle([...pythagoreTriangle, pythagorePoint.id]);
          } else if (pythagoreTriangle.length === 2) {
            setPythagoreTriangle([...pythagoreTriangle, pythagorePoint.id]);
            onShapeCreated?.({ type: 'pythagore', points: [...pythagoreTriangle, pythagorePoint.id] });
            setPythagoreTriangle(null);
          }
        }
        break;
        
      case 'vector':
        const vectorPoint = points.find(p => 
          Math.abs(p.x - pos.x) < 10 && Math.abs(p.y - pos.y) < 10
        );
        if (vectorPoint) {
          if (!selectedPoint) {
            setSelectedPoint(vectorPoint.id);
          } else if (selectedPoint !== vectorPoint.id) {
            const newVector = {
              id: `v${vectors.length + 1}`,
              startId: selectedPoint,
              endId: vectorPoint.id,
              color: '#f59e0b'
            };
            setVectors([...vectors, newVector]);
            setSelectedPoint(null);
            onShapeCreated?.(newVector);
          }
        }
        break;
    }
  };

  const handlePointDrag = (e: React.MouseEvent, pointId: string) => {
    if (readOnly) return;
    e.stopPropagation();
    
    const startPos = getMousePosition(e);
    const point = points.find(p => p.id === pointId);
    if (!point) return;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newPos = {
        x: snapToGrid((moveEvent.clientX - (svgRef.current?.getBoundingClientRect().left || 0) - pan.x) / scale),
        y: snapToGrid((moveEvent.clientY - (svgRef.current?.getBoundingClientRect().top || 0) - pan.y) / scale)
      };
      
      setPoints(prev => prev.map(p => 
        p.id === pointId ? { ...p, x: newPos.x, y: newPos.y } : p
      ));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const calculateDistance = (p1: Point, p2: Point) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const calculateAngle = (p1: Point, vertex: Point, p2: Point) => {
    const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
    const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const det = v1.x * v2.y - v1.y * v2.x;
    const angle = Math.atan2(det, dot) * (180 / Math.PI);
    return Math.abs(angle);
  };

  const calculateTriangleArea = (t: TriangleShape) => {
    const p1 = points.find(p => p.id === t.pointIds[0]);
    const p2 = points.find(p => p.id === t.pointIds[1]);
    const p3 = points.find(p => p.id === t.pointIds[2]);
    if (!p1 || !p2 || !p3) return 0;
    return Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)) / 2;
  };

  const clearAll = () => {
    setPoints([]);
    setLines([]);
    setCircles([]);
    setTriangles([]);
    setSelectedPoint(null);
    setMeasurement(null);
  };

  const undo = () => {
    if (triangles.length > 0) {
      setTriangles(triangles.slice(0, -1));
    } else if (circles.length > 0) {
      setCircles(circles.slice(0, -1));
    } else if (lines.length > 0) {
      setLines(lines.slice(0, -1));
    } else if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Sélectionner', color: 'text-blue-400' },
    { id: 'point', icon: Move, label: 'Point', color: 'text-indigo-400' },
    { id: 'segment', icon: Ruler, label: 'Segment', color: 'text-pink-400' },
    { id: 'line', icon: Ruler, label: 'Droite', color: 'text-violet-400' },
    { id: 'circle', icon: Circle, label: 'Cercle', color: 'text-amber-400' },
    { id: 'triangle', icon: Triangle, label: 'Triangle', color: 'text-emerald-400' },
    { id: 'vector', icon: Move, label: 'Vecteur', color: 'text-orange-400' },
    { id: 'symmetry', icon: RotateCcw, label: 'Symétrie', color: 'text-cyan-400' },
    { id: 'pythagore', icon: Square, label: 'Pythagore', color: 'text-purple-400' },
    { id: 'delete', icon: Trash2, label: 'Effacer', color: 'text-red-400' },
  ] as const;

  const handleZoomIn = () => {
    setScale(prev => Math.min(5, prev * 1.2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.1, prev / 1.2));
  };

  const handleFunctionSubmit = () => {
    // Parse and plot function
    console.log('Function to plot:', functionInput);
    setShowFunctionInput(false);
    setFunctionInput('');
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      onMouseDown={handleMouseDown}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-[#1a1a2e] border-b border-gray-800">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => {
              setSelectedTool(tool.id as GeometryTool);
              setSelectedPoint(null);
            }}
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
          onClick={handleZoomIn}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Zoomer"
        >
          <ZoomIn className="w-5 h-5 text-gray-400" />
        </button>
        
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Dézoomer"
        >
          <ZoomOut className="w-5 h-5 text-gray-400" />
        </button>
        
        <button
          onClick={resetView}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Réinitialiser la vue"
        >
          <Move3d className="w-5 h-5 text-gray-400" />
        </button>
        
        <button
          onClick={toggleFullscreen}
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
          onClick={() => setShowGrid(!showGridState)}
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
          onClick={undo}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Annuler"
        >
          <Undo className="w-5 h-5 text-gray-400" />
        </button>
        
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
          <div className="flex gap-2">
            <input
              type="text"
              value={functionInput}
              onChange={(e) => setFunctionInput(e.target.value)}
              placeholder="Entrez une fonction (ex: 2*x+1, sin(x), x^2)..."
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
        </div>
      )}
      
      {/* Canvas */}
      <div className="relative" style={{ width: isFullscreen ? '100vw' : width, height: isFullscreen ? '100vh' : height }}>
        <svg
          ref={svgRef}
          width={isFullscreen ? '100vw' : width}
          height={isFullscreen ? '100vh' : height}
          onClick={handleSvgClick}
          className="bg-[#0f0f1a] cursor-crosshair"
          style={{ touchAction: 'none', cursor: isPanning ? 'grabbing' : 'crosshair' }}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
            {/* Grid */}
            {showGridState && (
              <g opacity={0.3}>
                {Array.from({ length: Math.ceil(gridWidth / gridSize) + 1 }).map((_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * gridSize - (pan.x / scale)}
                    y1={-(pan.y / scale)}
                    x2={i * gridSize - (pan.x / scale)}
                    y2={height / scale - (pan.y / scale)}
                    stroke="#4b5563"
                    strokeWidth={0.5 / scale}
                  />
                ))}
                {Array.from({ length: Math.ceil(gridHeight / gridSize) + 1 }).map((_, i) => (
                  <line
                    key={`h${i}`}
                    x1={-(pan.x / scale)}
                    y1={i * gridSize - (pan.y / scale)}
                    x2={width / scale - (pan.x / scale)}
                    y2={i * gridSize - (pan.y / scale)}
                    stroke="#4b5563"
                    strokeWidth={0.5 / scale}
                  />
                ))}
              </g>
            )}
            
            {/* Axes */}
            {showAxes && (
              <g>
                <line 
                  x1={-(pan.x / scale)} 
                  y1={height / (2 * scale) - (pan.y / scale)} 
                  x2={width / scale - (pan.x / scale)} 
                  y2={height / (2 * scale) - (pan.y / scale)} 
                  stroke="#6366f1" 
                  strokeWidth={1 / scale} 
                  opacity={0.5} 
                />
                <line 
                  x1={width / (2 * scale) - (pan.x / scale)} 
                  y1={-(pan.y / scale)} 
                  x2={width / (2 * scale) - (pan.x / scale)} 
                  y2={height / scale - (pan.y / scale)} 
                  stroke="#6366f1" 
                  strokeWidth={1 / scale} 
                  opacity={0.5} 
                />
              </g>
            )}
            
            {/* Lines */}
            {lines.map(line => {
              const start = points.find(p => p.id === line.startId);
              const end = points.find(p => p.id === line.endId);
              if (!start || !end) return null;
              
              // Extend line for infinite lines
              let x1 = start.x, y1 = start.y, x2 = end.x, y2 = end.y;
              if (line.dashed) {
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const length = Math.sqrt(dx*dx + dy*dy);
                const factor = 1000 / length;
                x1 = start.x - dx * factor;
                y1 = start.y - dy * factor;
                x2 = end.x + dx * factor;
                y2 = end.y + dy * factor;
              }
              
              return (
                <line
                  key={line.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={line.color}
                  strokeWidth={2 / scale}
                  strokeDasharray={line.dashed ? "5,5" : undefined}
                />
              );
            })}
            
            {/* Circles */}
            {circles.map(circle => {
              const center = points.find(p => p.id === circle.centerId);
              const radiusPoint = points.find(p => p.id === circle.radiusPointId);
              if (!center || !radiusPoint) return null;
              const radius = calculateDistance(center, radiusPoint);
              
              return (
                <g key={circle.id}>
                  <circle
                    cx={center.x}
                    cy={center.y}
                    r={radius}
                    fill="none"
                    stroke={circle.color}
                    strokeWidth={2 / scale}
                  />
                  {showMeasurements && (
                    <text
                      x={center.x + radius + 10 / scale}
                      y={center.y}
                      fill="#f59e0b"
                      fontSize={12 / scale}
                      fontFamily="monospace"
                    >
                      r = {radius.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Points */}
            {points.map(point => (
              <g 
                key={point.id} 
                onMouseDown={(e) => handlePointDrag(e, point.id)}
                className="cursor-move"
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={6 / scale}
                  fill={selectedPoint?.includes(point.id) ? '#f59e0b' : point.color}
                  stroke="#0f0f1a"
                  strokeWidth={2 / scale}
                  className="hover:r-8"
                />
                <text
                  x={point.x + 10 / scale}
                  y={point.y - 10 / scale}
                  fill="#9ca3af"
                  fontSize={12 / scale}
                  fontFamily="monospace"
                >
                  {point.label}({Math.round(point.x/gridSize)},{-Math.round((point.y - height/2)/gridSize)})
                </text>
              </g>
            ))}
            
            {/* Preview line */}
            {tempLine && (
              <line
                x1={tempLine.start.x}
                y1={tempLine.start.y}
                x2={tempLine.end.x}
                y2={tempLine.end.y}
                stroke="#6366f1"
                strokeWidth={1 / scale}
                strokeDasharray="3,3"
                opacity={0.5}
              />
            )}
          </g>
        </svg>
        
        {/* Info panel */}
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
          </div>
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
          {selectedTool === 'vector' && 'Cliquez sur 2 points pour créer un vecteur'}
          {selectedTool === 'symmetry' && 'Cliquez sur 2 points pour définir l\'axe, puis sur un point à symétriser'}
          {selectedTool === 'pythagore' && 'Cliquez sur 3 points pour visualiser le théorème de Pythagore'}
          {selectedTool === 'select' && 'Cliquez et déplacez les points'}
          {selectedTool === 'delete' && 'Cliquez sur un point pour le supprimer'}
        </p>
      </div>
    </div>
  );
}

// Simplified version for inline use in courses
export function GeometryMini({ 
  points: initialPoints = [], 
  lines: initialLines = [],
  height = 200 
}: { 
  points?: { x: number; y: number; label: string }[];
  lines?: { from: number; to: number }[];
  height?: number;
}) {
  const width = 300;
  const scale = 30;
  const offsetX = width / 2;
  const offsetY = height / 2;
  
  return (
    <div className="bg-[#0f0f1a] rounded-lg p-4 inline-block">
      <svg width={width} height={height}>
        {/* Grid */}
        <g opacity={0.2}>
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`gv${i}`}
              x1={i * scale}
              y1={0}
              x2={i * scale}
              y2={height}
              stroke="#4b5563"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line
              key={`gh${i}`}
              x1={0}
              y1={i * scale}
              x2={width}
              y2={i * scale}
              stroke="#4b5563"
              strokeWidth={0.5}
            />
          ))}
        </g>
        
        {/* Axes */}
        <line x1={offsetX} y1={0} x2={offsetX} y2={height} stroke="#6366f1" strokeWidth={1} opacity={0.5} />
        <line x1={0} y1={offsetY} x2={width} y2={offsetY} stroke="#6366f1" strokeWidth={1} opacity={0.5} />
        
        {/* Lines */}
        {initialLines.map((line, i) => {
          const p1 = initialPoints[line.from];
          const p2 = initialPoints[line.to];
          if (!p1 || !p2) return null;
          return (
            <line
              key={i}
              x1={offsetX + p1.x * scale}
              y1={offsetY - p1.y * scale}
              x2={offsetX + p2.x * scale}
              y2={offsetY - p2.y * scale}
              stroke="#ec4899"
              strokeWidth={2}
            />
          );
        })}
        
        {/* Points */}
        {initialPoints.map((point, i) => (
          <g key={i}>
            <circle
              cx={offsetX + point.x * scale}
              cy={offsetY - point.y * scale}
              r={4}
              fill="#6366f1"
            />
            <text
              x={offsetX + point.x * scale + 8}
              y={offsetY - point.y * scale - 8}
              fill="#9ca3af"
              fontSize="10"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
