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
  Plus,
  Minus,
  Save,
  Download,
  Upload,
  Play,
  HelpCircle,
  X,
  Check,
  Compass,
  Ruler as Measure
} from 'lucide-react';
import Link from 'next/link';

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

interface FunctionData {
  id: string;
  expression: string;
  color: string;
  points: Point[];
  visible: boolean;
}

interface SavedWork {
  id: string;
  name: string;
  timestamp: number;
  points: Point[];
  lines: Line[];
  circles: CircleShape[];
  triangles: TriangleShape[];
  functions: FunctionData[];
}

export default function GeometryCanvas() {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [circles, setCircles] = useState<CircleShape[]>([]);
  const [triangles, setTriangles] = useState<TriangleShape[]>([]);
  const [functions, setFunctions] = useState<FunctionData[]>([]);
  const [selectedTool, setSelectedTool] = useState<'point' | 'line' | 'circle' | 'triangle' | 'function' | 'move'>('point');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempPoints, setTempPoints] = useState<Point[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showAngles, setShowAngles] = useState(false);
  const [showLengths, setShowLengths] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [functionInput, setFunctionInput] = useState('');
  const [showFunctionInput, setShowFunctionInput] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedWorks, setSavedWorks] = useState<SavedWork[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  const tools = [
    { id: 'move', icon: Move, label: 'Déplacer', color: 'text-gray-400' },
    { id: 'point', icon: Plus, label: 'Point', color: 'text-blue-400' },
    { id: 'line', icon: Ruler, label: 'Droite', color: 'text-green-400' },
    { id: 'circle', icon: Circle, label: 'Cercle', color: 'text-purple-400' },
    { id: 'triangle', icon: Triangle, label: 'Triangle', color: 'text-orange-400' },
    { id: 'function', icon: Calculator, label: 'Fonction', color: 'text-pink-400' },
  ];

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

  useEffect(() => {
    const saved = localStorage.getItem('geometry-works');
    if (saved) {
      setSavedWorks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getMousePosition = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convertir en coordonnées du canvas avec offset et scale
    const canvasX = (mouseX - offset.x) / scale;
    const canvasY = (mouseY - offset.y) / scale;
    
    return { x: canvasX, y: canvasY };
  }, [scale, offset]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool === 'move' || isDragging) return;
    
    const pos = getMousePosition(e);
    
    if (selectedTool === 'point') {
      const newPoint: Point = {
        id: `point_${Date.now()}`,
        x: pos.x,
        y: pos.y,
        label: `A${points.length + 1}`,
        color: colors[points.length % colors.length]
      };
      setPoints([...points, newPoint]);
    } else if (selectedTool === 'line') {
      const newPoint: Point = { id: `temp_${Date.now()}`, x: pos.x, y: pos.y };
      setTempPoints([...tempPoints, newPoint]);

      if (tempPoints.length === 1) {
        const line: Line = {
          id: `line_${Date.now()}`,
          startId: tempPoints[0].id,
          endId: newPoint.id,
          color: colors[lines.length % colors.length]
        };
        setLines([...lines, line]);
        setPoints([...points, tempPoints[0], newPoint]);
        setTempPoints([]);
      }
    } else if (selectedTool === 'circle') {
      const newPoint: Point = { id: `temp_${Date.now()}`, x: pos.x, y: pos.y };
      setTempPoints([...tempPoints, newPoint]);

      if (tempPoints.length === 1) {
        const circle: CircleShape = {
          id: `circle_${Date.now()}`,
          centerId: tempPoints[0].id,
          radiusPointId: newPoint.id,
          color: colors[circles.length % colors.length]
        };
        setCircles([...circles, circle]);
        setPoints([...points, tempPoints[0], newPoint]);
        setTempPoints([]);
      }
    } else if (selectedTool === 'triangle') {
      const newPoint: Point = { id: `temp_${Date.now()}`, x: pos.x, y: pos.y };
      setTempPoints([...tempPoints, newPoint]);

      if (tempPoints.length === 2) {
        const triangle: TriangleShape = {
          id: `triangle_${Date.now()}`,
          pointIds: [tempPoints[0].id, tempPoints[1].id, newPoint.id],
          color: colors[triangles.length % colors.length]
        };
        setTriangles([...triangles, triangle]);
        setPoints([...points, tempPoints[0], tempPoints[1], newPoint]);
        setTempPoints([]);
      }
    }
  }, [selectedTool, isDragging, getMousePosition, tempPoints, points, lines, circles, triangles]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 2 || selectedTool === 'move') { // Clic droit ou outil déplacer
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, [selectedTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  const addFunction = () => {
    if (!functionInput.trim()) return;

    try {
      const points: Point[] = [];
      for (let x = -10; x <= 10; x += 0.5) {
        try {
          let y = 0;
          const expr = functionInput.toLowerCase()
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/\^/g, '**')
            .replace(/x/g, `(${x})`);
          
          y = eval(expr);
          
          if (!isNaN(y) && isFinite(y)) {
            points.push({
              id: `func_${Date.now()}_${x}`,
              x: x * 20 + 200,
              y: 200 - y * 20,
              color: colors[functions.length % colors.length]
            });
          }
        } catch (e) {
          // Skip invalid points
        }
      }

      const newFunction: FunctionData = {
        id: `func_${Date.now()}`,
        expression: functionInput,
        color: colors[functions.length % colors.length],
        points,
        visible: true
      };

      setFunctions([...functions, newFunction]);
      setFunctionInput('');
      setShowFunctionInput(false);
    } catch (error) {
      console.error('Invalid function:', error);
    }
  };

  const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const calculateAngle = (p1: Point, vertex: Point, p2: Point): number => {
    const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    return Math.abs(angle1 - angle2) * (180 / Math.PI);
  };

  const getPointById = useCallback((id: string) => points.find(p => p.id === id), [points]);

  const clearCanvas = () => {
    setPoints([]);
    setLines([]);
    setCircles([]);
    setTriangles([]);
    setFunctions([]);
    setTempPoints([]);
  };

  const undo = () => {
    if (tempPoints.length > 0) {
      setTempPoints([]);
    } else if (triangles.length > 0) {
      const lastTriangle = triangles[triangles.length - 1];
      setTriangles(triangles.slice(0, -1));
      setPoints(points.filter(p => !lastTriangle.pointIds.includes(p.id)));
    } else if (circles.length > 0) {
      const lastCircle = circles[circles.length - 1];
      setCircles(circles.slice(0, -1));
      setPoints(points.filter(p => p.id !== lastCircle.centerId && p.id !== lastCircle.radiusPointId));
    } else if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      setLines(lines.slice(0, -1));
      setPoints(points.filter(p => p.id !== lastLine.startId && p.id !== lastLine.endId));
    } else if (points.length > 0) {
      setPoints(points.slice(0, -1));
    } else if (functions.length > 0) {
      setFunctions(functions.slice(0, -1));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const saveWork = () => {
    if (!saveName.trim()) return;

    const work: SavedWork = {
      id: Date.now().toString(),
      name: saveName,
      timestamp: Date.now(),
      points,
      lines,
      circles,
      triangles,
      functions
    };

    const updatedWorks = [...savedWorks, work];
    setSavedWorks(updatedWorks);
    localStorage.setItem('geometry-works', JSON.stringify(updatedWorks));
    setShowSaveDialog(false);
    setSaveName('');
  };

  const loadWork = (work: SavedWork) => {
    setPoints(work.points);
    setLines(work.lines);
    setCircles(work.circles);
    setTriangles(work.triangles);
    setFunctions(work.functions);
    setShowLoadDialog(false);
  };

  const deleteWork = (id: string) => {
    const updatedWorks = savedWorks.filter(w => w.id !== id);
    setSavedWorks(updatedWorks);
    localStorage.setItem('geometry-works', JSON.stringify(updatedWorks));
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`max-w-7xl mx-auto ${isFullscreen ? 'h-screen' : ''}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 ${isFullscreen ? 'p-4' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Laboratoire de Mathématiques</h1>
              <p className="text-gray-400">Crée des figures géométriques, trace des fonctions et explore les mathématiques de manière interactive</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTutorial(true)}
                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg"
                title="Tutoriel"
              >
                <HelpCircle className="w-5 h-5 text-blue-400" />
              </button>
              <Link href="/courses" className="p-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-600/30 rounded-lg" title="Retour aux cours">
                <X className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>

        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 ${isFullscreen ? 'h-full' : ''}`}>
          {/* Toolbar */}
          <div className="lg:col-span-1">
            <div className={`bg-slate-800 rounded-xl border border-slate-700 p-4 ${isFullscreen ? 'h-full overflow-y-auto' : 'sticky top-4'}`}>
              <h3 className="font-semibold mb-4 text-sm">Outils</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 mb-6">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setSelectedTool(tool.id as any);
                      if (tool.id === 'function') {
                        setShowFunctionInput(true);
                      }
                    }}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedTool === tool.id
                        ? 'bg-slate-700 border-blue-500'
                        : 'bg-slate-900 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <tool.icon className={`w-5 h-5 mx-auto mb-1 ${tool.color}`} />
                    <div className="text-xs">{tool.label}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-700 pt-4">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className="w-full p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                  {showGrid ? 'Masquer' : 'Afficher'} la grille
                </button>

                <button
                  onClick={() => setShowAxes(!showAxes)}
                  className="w-full p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  {showAxes ? 'Masquer' : 'Afficher'} les axes
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowAngles(!showAngles)}
                    className={`p-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                      showAngles ? 'bg-blue-600/30 border border-blue-600/30' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    Angles
                  </button>
                  <button
                    onClick={() => setShowLengths(!showLengths)}
                    className={`p-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                      showLengths ? 'bg-blue-600/30 border border-blue-600/30' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <Measure className="w-4 h-4" />
                    Longueurs
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                    className="flex-1 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                  >
                    <ZoomOut className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setScale(Math.min(3, scale + 0.25))}
                    className="flex-1 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                  >
                    <ZoomIn className="w-4 h-4 mx-auto" />
                  </button>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-full p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Maximize className="w-4 h-4" />
                  {isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="p-2 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-lg text-sm flex items-center justify-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    Sauver
                  </button>
                  <button
                    onClick={() => setShowLoadDialog(true)}
                    className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg text-sm flex items-center justify-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    Charger
                  </button>
                </div>

                <button
                  onClick={undo}
                  className="w-full p-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Undo className="w-4 h-4" />
                  Annuler
                </button>

                <button
                  onClick={clearCanvas}
                  className="w-full p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Tout effacer
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="bg-slate-900/50 p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      {points.length} point{points.length > 1 ? 's' : ''}, 
                      {lines.length} droite{lines.length > 1 ? 's' : ''}, 
                      {circles.length} cercle{circles.length > 1 ? 's' : ''}, 
                      {triangles.length} triangle{triangles.length > 1 ? 's' : ''}, 
                      {functions.length} fonction{functions.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-500">
                      Zoom: {(scale * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedTool === 'point' && 'Cliquez pour placer un point'}
                    {selectedTool === 'line' && 'Cliquez 2 points pour tracer une droite'}
                    {selectedTool === 'circle' && 'Cliquez 2 points pour tracer un cercle'}
                    {selectedTool === 'triangle' && 'Cliquez 3 points pour tracer un triangle'}
                    {selectedTool === 'function' && 'Entrez une expression mathématique'}
                    {selectedTool === 'move' && 'Clic droit + glisser pour déplacer, molette pour zoomer'}
                  </div>
                </div>
              </div>

              <div className={`relative bg-slate-900 ${isFullscreen ? 'h-[calc(100vh-200px)]' : ''} overflow-hidden`}>
                <svg
                  ref={canvasRef}
                  width="800"
                  height={isFullscreen ? "100%" : "600"}
                  className="w-full cursor-crosshair"
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                  onContextMenu={(e) => e.preventDefault()}
                  viewBox="0 0 800 600"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ cursor: selectedTool === 'move' || isDragging ? 'grab' : 'crosshair' }}
                >
                  <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
                    {/* Grid */}
                    {showGrid && (
                      <g className="opacity-20">
                        {Array.from({ length: 21 }, (_, i) => (
                          <line
                            key={`v_${i}`}
                            x1={i * 40}
                            y1="0"
                            x2={i * 40}
                            y2="600"
                            stroke="#64748b"
                            strokeWidth="1"
                          />
                        ))}
                        {Array.from({ length: 16 }, (_, i) => (
                          <line
                            key={`h_${i}`}
                            x1="0"
                            y1={i * 40}
                            x2="800"
                            y2={i * 40}
                            stroke="#64748b"
                            strokeWidth="1"
                          />
                        ))}
                      </g>
                    )}

                    {/* Axes with graduations */}
                    {showAxes && (
                      <g>
                        {/* X axis */}
                        <line x1="0" y1="300" x2="800" y2="300" stroke="#475569" strokeWidth="2" />
                        <text x="790" y="295" fill="white" fontSize="12" textAnchor="end">x</text>
                        {Array.from({ length: 21 }, (_, i) => (
                          <g key={`x_grad_${i}`}>
                            <line x1={i * 40} y1="295" x2={i * 40} y2="305" stroke="#475569" strokeWidth="1" />
                            {i % 2 === 0 && (
                              <text x={i * 40} y="320" fill="#94a3b8" fontSize="10" textAnchor="middle">
                                {i - 10}
                              </text>
                            )}
                          </g>
                        ))}
                        
                        {/* Y axis */}
                        <line x1="400" y1="0" x2="400" y2="600" stroke="#475569" strokeWidth="2" />
                        <text x="405" y="15" fill="white" fontSize="12">y</text>
                        {Array.from({ length: 16 }, (_, i) => (
                          <g key={`y_grad_${i}`}>
                            <line x1="395" y1={i * 40} x2="405" y2={i * 40} stroke="#475569" strokeWidth="1" />
                            {i % 2 === 0 && (
                              <text x="385" y={i * 40 + 5} fill="#94a3b8" fontSize="10" textAnchor="end">
                                {7.5 - i}
                              </text>
                            )}
                          </g>
                        ))}
                      </g>
                    )}

                    {/* Functions */}
                    {functions.map((func) => (
                      func.visible && (
                        <polyline
                          key={func.id}
                          points={func.points.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="none"
                          stroke={func.color}
                          strokeWidth="2"
                        />
                      )
                    ))}

                    {/* Lines */}
                    {lines.map((line) => {
                      const start = getPointById(line.startId);
                      const end = getPointById(line.endId);
                      if (!start || !end) return null;
                      
                      return (
                        <g key={line.id}>
                          <line
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke={line.color}
                            strokeWidth="2"
                            strokeDasharray={line.dashed ? "5,5" : ""}
                          />
                          {showLengths && (
                            <text
                              x={(start.x + end.x) / 2}
                              y={(start.y + end.y) / 2 - 10}
                              fill="white"
                              fontSize="12"
                              textAnchor="middle"
                              className="bg-slate-800/80 px-1 rounded"
                            >
                              {calculateDistance(start, end).toFixed(1)}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Circles */}
                    {circles.map((circle) => {
                      const center = getPointById(circle.centerId);
                      const radiusPoint = getPointById(circle.radiusPointId);
                      if (!center || !radiusPoint) return null;
                      const dx = radiusPoint.x - center.x;
                      const dy = radiusPoint.y - center.y;
                      const radius = Math.sqrt(dx * dx + dy * dy);
                      
                      return (
                        <g key={circle.id}>
                          <circle
                            cx={center.x}
                            cy={center.y}
                            r={radius}
                            fill="none"
                            stroke={circle.color}
                            strokeWidth="2"
                          />
                          {showLengths && (
                            <text
                              x={center.x}
                              y={center.y - radius - 10}
                              fill="white"
                              fontSize="12"
                              textAnchor="middle"
                            >
                              r = {radius.toFixed(1)}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Triangles */}
                    {triangles.map((triangle) => {
                      const trianglePoints = triangle.pointIds.map(id => getPointById(id)).filter(Boolean);
                      if (trianglePoints.length !== 3) return null;
                      const pointsStr = trianglePoints.map(p => `${p!.x},${p!.y}`).join(' ');
                      
                      return (
                        <g key={triangle.id}>
                          <polygon
                            points={pointsStr}
                            fill={triangle.fill ? triangle.color : "none"}
                            stroke={triangle.color}
                            strokeWidth="2"
                          />
                          
                          {/* Lengths */}
                          {showLengths && trianglePoints.map((p1, i) => {
                            const p2 = trianglePoints[(i + 1) % 3];
                            if (!p1 || !p2) return null;
                            return (
                              <text
                                key={`length_${i}`}
                                x={(p1.x + p2.x) / 2}
                                y={(p1.y + p2.y) / 2 - 10}
                                fill="white"
                                fontSize="12"
                                textAnchor="middle"
                              >
                                {calculateDistance(p1, p2).toFixed(1)}
                              </text>
                            );
                          })}
                          
                          {/* Angles */}
                          {showAngles && trianglePoints.map((vertex, i) => {
                            const p1 = trianglePoints[(i + 2) % 3];
                            const p2 = trianglePoints[(i + 1) % 3];
                            if (!p1 || !p2 || !vertex) return null;
                            const angle = calculateAngle(p1, vertex, p2);
                            
                            return (
                              <text
                                key={`angle_${i}`}
                                x={vertex.x + 15}
                                y={vertex.y - 15}
                                fill="white"
                                fontSize="10"
                              >
                                {angle.toFixed(1)}°
                              </text>
                            );
                          })}
                        </g>
                      );
                    })}

                    {/* Points */}
                    {points.map((point) => (
                      <g key={point.id}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="6"
                          fill={point.color}
                          className="cursor-pointer hover:opacity-80"
                        />
                        <text
                          x={point.x + 10}
                          y={point.y - 10}
                          fill="white"
                          fontSize="12"
                          className="select-none"
                        >
                          {point.label}
                        </text>
                      </g>
                    ))}

                    {/* Temporary points */}
                    {tempPoints.map((point) => (
                      <circle
                        key={point.id}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="#94a3b8"
                        className="opacity-50"
                      />
                    ))}
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Tutoriel du Laboratoire de Mathématiques</h3>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-400">🎯 Comment utiliser les outils</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li><strong>Point:</strong> Cliquez n'importe où pour placer un point</li>
                    <li><strong>Droite:</strong> Cliquez sur 2 points pour tracer une droite</li>
                    <li><strong>Cercle:</strong> Cliquez sur un centre puis un point pour définir le rayon</li>
                    <li><strong>Triangle:</strong> Cliquez sur 3 points pour tracer un triangle</li>
                    <li><strong>Fonction:</strong> Entrez une expression comme x^2, sin(x), 2*x+1</li>
                    <li><strong>Déplacer:</strong> Clic droit + glisser pour déplacer la vue</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-400">🖱️ Contrôles avancés</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>• <strong>Molette:</strong> Zoomer avant/arrière</li>
                    <li>• <strong>Clic droit + glisser:</strong> Déplacer le canvas</li>
                    <li>• <strong>Plein écran:</strong> Mode immersif</li>
                    <li>• <strong>Axes gradués:</strong> Coordonnées précises</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-400">📐 Mesures</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Activez <strong>Longueurs</strong> pour voir les distances</li>
                    <li>• Activez <strong>Angles</strong> pour voir les angles des triangles</li>
                    <li>• Les mesures s'affichent automatiquement</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-orange-400">💾 Sauvegarder</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Utilisez "Sauver" pour enregistrer votre travail</li>
                    <li>• "Charger" pour retrouver vos créations</li>
                    <li>• Les travaux sont sauvegardés localement</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowTutorial(false)}
                className="w-full mt-6 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
              >
                Commencer à créer !
              </button>
            </div>
          </div>
        )}

        {/* Function Input Modal */}
        {showFunctionInput && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Ajouter une fonction</h3>
              <p className="text-gray-400 text-sm mb-4">
                Exemples: x^2, sin(x), 2*x+1, sqrt(x), x^3-2*x+1
              </p>
              <input
                type="text"
                value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFunction()}
                placeholder="f(x) = ..."
                className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg mb-4 text-white"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={addFunction}
                  className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => {
                    setShowFunctionInput(false);
                    setFunctionInput('');
                  }}
                  className="flex-1 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Sauvegarder votre travail</h3>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Nom de votre création..."
                className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg mb-4 text-white"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={saveWork}
                  disabled={!saveName.trim()}
                  className="flex-1 p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveName('');
                  }}
                  className="flex-1 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Load Dialog */}
        {showLoadDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Vos créations sauvegardées</h3>
                <button
                  onClick={() => setShowLoadDialog(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {savedWorks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Aucune création sauvegardée pour le moment
                </div>
              ) : (
                <div className="space-y-2">
                  {savedWorks.map((work) => (
                    <div key={work.id} className="bg-slate-900/50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium">{work.name}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(work.timestamp).toLocaleDateString()} à {new Date(work.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {work.points.length} points, {work.lines.length} droites, {work.circles.length} cercles, {work.triangles.length} triangles, {work.functions.length} fonctions
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadWork(work)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg"
                          title="Charger"
                        >
                          <Play className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => deleteWork(work.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
