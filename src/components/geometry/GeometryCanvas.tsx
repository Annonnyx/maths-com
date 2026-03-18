'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MousePointer2, 
  Move, 
  Trash2, 
  Circle,
  Triangle,
  Square,
  Hexagon,
  Undo,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Save,
  Download,
  Eye,
  EyeOff,
  Palette,
  Ruler
} from 'lucide-react';

// Types for geometry objects
interface GeometryPoint {
  id: string;
  x: number;
  y: number;
  color: string;
}

interface GeometryLine {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  color: string;
}

interface GeometryCircle {
  id: string;
  center: { x: number; y: number };
  radius: number;
  color: string;
}

interface GeometryPolygon {
  id: string;
  points: { x: number; y: number }[];
  color: string;
}

type GeometryTool = 'select' | 'point' | 'line' | 'circle' | 'polygon' | 'rectangle' | 'hexagon' | 'delete';

interface GeometryCanvasProps {
  width?: number;
  height?: number;
  onExport?: (data: any) => void;
}

export default function GeometryCanvas({ width = 800, height = 600, onExport }: GeometryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<GeometryTool>('select');
  const [points, setPoints] = useState<GeometryPoint[]>([]);
  const [lines, setLines] = useState<GeometryLine[]>([]);
  const [circles, setCircles] = useState<GeometryCircle[]>([]);
  const [polygons, setPolygons] = useState<GeometryPolygon[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save state to history
  const saveToHistory = useCallback(() => {
    const state = {
      points: [...points],
      lines: [...lines],
      circles: [...circles],
      polygons: [...polygons]
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [points, lines, circles, polygons, history, historyIndex]);

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    
    const gridSize = 20 * zoom;
    const offsetX = pan.x % gridSize;
    const offsetY = pan.y % gridSize;
    
    for (let x = offsetX; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [showGrid, zoom, pan, width, height]);

  // Draw all objects
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw lines
    lines.forEach(line => {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.stroke();
    });
    
    // Draw circles
    circles.forEach(circle => {
      ctx.strokeStyle = circle.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    // Draw polygons
    polygons.forEach(polygon => {
      ctx.fillStyle = polygon.color + '40';
      ctx.strokeStyle = polygon.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      polygon.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    
    // Draw points
    points.forEach(point => {
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Highlight selected object
    if (selectedObject) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      // Check if it's a point
      const point = points.find(p => p.id === selectedObject);
      if (point) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  }, [points, lines, circles, polygons, selectedObject, drawGrid, zoom, pan, width, height]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    switch (currentTool) {
      case 'point':
        const newPoint: GeometryPoint = {
          id: `point-${Date.now()}`,
          x,
          y,
          color: currentColor
        };
        setPoints([...points, newPoint]);
        saveToHistory();
        break;
        
      case 'line':
        if (!isDrawing) {
          setStartPoint({ x, y });
          setIsDrawing(true);
        } else {
          const newLine: GeometryLine = {
            id: `line-${Date.now()}`,
            start: startPoint!,
            end: { x, y },
            color: currentColor
          };
          setLines([...lines, newLine]);
          setIsDrawing(false);
          setStartPoint(null);
          saveToHistory();
        }
        break;
        
      case 'circle':
        if (!isDrawing) {
          setStartPoint({ x, y });
          setIsDrawing(true);
        } else {
          const radius = Math.sqrt(Math.pow(x - startPoint!.x, 2) + Math.pow(y - startPoint!.y, 2));
          const newCircle: GeometryCircle = {
            id: `circle-${Date.now()}`,
            center: startPoint!,
            radius,
            color: currentColor
          };
          setCircles([...circles, newCircle]);
          setIsDrawing(false);
          setStartPoint(null);
          saveToHistory();
        }
        break;
        
      case 'rectangle':
        if (!isDrawing) {
          setStartPoint({ x, y });
          setIsDrawing(true);
        } else {
          const newPolygon: GeometryPolygon = {
            id: `rect-${Date.now()}`,
            points: [
              startPoint!,
              { x, y: startPoint!.y },
              { x, y },
              { x: startPoint!.x, y }
            ],
            color: currentColor
          };
          setPolygons([...polygons, newPolygon]);
          setIsDrawing(false);
          setStartPoint(null);
          saveToHistory();
        }
        break;
        
      case 'hexagon':
        if (!isDrawing) {
          setStartPoint({ x, y });
          setIsDrawing(true);
        } else {
          const radius = Math.sqrt(Math.pow(x - startPoint!.x, 2) + Math.pow(y - startPoint!.y, 2));
          const hexPoints: { x: number; y: number }[] = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            hexPoints.push({
              x: startPoint!.x + radius * Math.cos(angle),
              y: startPoint!.y + radius * Math.sin(angle)
            });
          }
          const newPolygon: GeometryPolygon = {
            id: `hex-${Date.now()}`,
            points: hexPoints,
            color: currentColor
          };
          setPolygons([...polygons, newPolygon]);
          setIsDrawing(false);
          setStartPoint(null);
          saveToHistory();
        }
        break;
    }
  }, [currentTool, isDrawing, startPoint, points, lines, circles, polygons, currentColor, pan, zoom, saveToHistory]);

  // Handle mouse move for preview
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    // Draw preview (this would need a temporary canvas layer)
    draw();
  }, [isDrawing, startPoint, pan, zoom, draw]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPoints(prevState.points);
      setLines(prevState.lines);
      setCircles(prevState.circles);
      setPolygons(prevState.polygons);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPoints(nextState.points);
      setLines(nextState.lines);
      setCircles(nextState.circles);
      setPolygons(nextState.polygons);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Clear all
  const clearAll = useCallback(() => {
    setPoints([]);
    setLines([]);
    setCircles([]);
    setPolygons([]);
    setSelectedObject(null);
    saveToHistory();
  }, [saveToHistory]);

  // Export function
  const exportCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'geometry.png';
    link.href = dataURL;
    link.click();
    
    if (onExport) {
      onExport({
        points,
        lines,
        circles,
        polygons
      });
    }
  }, [points, lines, circles, polygons, onExport]);

  // Redraw when state changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = width;
    canvas.height = height;
    
    // Initialize history
    saveToHistory();
  }, [width, height, saveToHistory]);

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Sélectionner' },
    { id: 'point', icon: Circle, label: 'Point' },
    { id: 'line', icon: Ruler, label: 'Ligne' },
    { id: 'circle', icon: Circle, label: 'Cercle' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'hexagon', icon: Hexagon, label: 'Hexagone' },
    { id: 'delete', icon: Trash2, label: 'Supprimer' }
  ];

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
        {/* Tools */}
        <div className="flex items-center gap-2">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setCurrentTool(tool.id as GeometryTool)}
              className={`p-2 rounded transition-colors ${
                currentTool === tool.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`w-6 h-6 rounded border-2 transition-all ${
                currentColor === color 
                  ? 'border-white scale-110' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-l border-gray-600 pl-4 ml-auto">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded transition-colors ${
              showGrid ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Grille"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler"
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refaire"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={clearAll}
            className="p-2 rounded bg-red-600 text-white hover:bg-red-700"
            title="Tout effacer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={exportCanvas}
            className="p-2 rounded bg-green-600 text-white hover:bg-green-700"
            title="Exporter"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="p-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-300 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            className="p-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-gray-950 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          className="cursor-crosshair"
          style={{ width, height }}
        />
        
        {/* Status bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur px-3 py-1 text-xs text-gray-300">
          <div className="flex items-center justify-between">
            <span>Outil: {tools.find(t => t.id === currentTool)?.label}</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <span>Objets: {points.length + lines.length + circles.length + polygons.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
