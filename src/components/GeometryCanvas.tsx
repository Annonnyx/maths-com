'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MousePointer2, 
  Trash2, 
  Circle,
  Square,
  Hexagon,
  Undo,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Download,
  Ruler,
  Move
} from 'lucide-react';

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

type GeometryTool = 'select' | 'point' | 'line' | 'circle' | 'rectangle' | 'hexagon' | 'delete';

interface GeometryCanvasProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  onExport?: (data: any) => void;
}

export default function GeometryCanvas({ 
  width = 1200, 
  height = 600, 
  showGrid: initialShowGrid = true, 
  showAxes: initialShowAxes = true,
  onExport 
}: GeometryCanvasProps) {
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
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [showAxes, setShowAxes] = useState(initialShowAxes);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null);

  // Convert canvas coordinates to world coordinates
  const canvasToWorld = useCallback((canvasX: number, canvasY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    return {
      x: (canvasX - rect.left - pan.x) / zoom,
      y: (canvasY - rect.top - pan.y) / zoom
    };
  }, [pan, zoom]);

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

  // Draw grid with proper spacing
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    
    // Grid size in world coordinates (20 units = 1 grid square)
    const gridSize = 20;
    const scaledGridSize = gridSize * zoom;
    
    // Calculate offset to keep grid aligned with origin
    const offsetX = (pan.x % scaledGridSize + scaledGridSize) % scaledGridSize;
    const offsetY = (pan.y % scaledGridSize + scaledGridSize) % scaledGridSize;
    
    // Draw vertical lines
    for (let x = offsetX; x < width; x += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = offsetY; y < height; y += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw origin lines (thicker)
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    
    // X-axis (horizontal through origin)
    const yAxis = height / 2 + pan.y;
    if (yAxis >= 0 && yAxis <= height) {
      ctx.beginPath();
      ctx.moveTo(0, yAxis);
      ctx.lineTo(width, yAxis);
      ctx.stroke();
    }
    
    // Y-axis (vertical through origin)
    const xAxis = width / 2 + pan.x;
    if (xAxis >= 0 && xAxis <= width) {
      ctx.beginPath();
      ctx.moveTo(xAxis, 0);
      ctx.lineTo(xAxis, height);
      ctx.stroke();
    }
  }, [showGrid, zoom, pan, width, height]);

  // Draw axes with labels
  const drawAxes = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showAxes) return;
    
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px monospace';
    
    // Calculate center
    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // Origin label
    ctx.fillText('(0,0)', centerX + 5, centerY - 5);
    
    // X-axis labels
    for (let i = -20; i <= 20; i += 5) {
      if (i === 0) continue;
      const x = centerX + i * zoom;
      if (x > 0 && x < width) {
        ctx.fillText(i.toString(), x - 5, centerY + 15);
      }
    }
    
    // Y-axis labels
    for (let i = -20; i <= 20; i += 5) {
      if (i === 0) continue;
      const y = centerY - i * zoom;
      if (y > 0 && y < height) {
        ctx.fillText(i.toString(), centerX + 5, y + 3);
      }
    }
  }, [showAxes, zoom, pan, width, height]);

  // Draw all objects
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw axes
    drawAxes(ctx);
    
    // Draw lines
    lines.forEach(line => {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.stroke();
    });
    
    // Draw circles
    circles.forEach(circle => {
      ctx.strokeStyle = circle.color;
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    // Draw polygons
    polygons.forEach(polygon => {
      ctx.fillStyle = polygon.color + '40';
      ctx.strokeStyle = polygon.color;
      ctx.lineWidth = 2 / zoom;
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
      ctx.arc(point.x, point.y, 5 / zoom, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Highlight selected object
    if (selectedObject) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([5 / zoom, 5 / zoom]);
      
      // Check if it's a point
      const point = points.find(p => p.id === selectedObject);
      if (point) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8 / zoom, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
    }
    
    // Draw preview line when drawing
    if (isDrawing && startPoint && currentTool === 'line') {
      ctx.strokeStyle = currentColor + '80';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([5 / zoom, 5 / zoom]);
      
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        // This would need mouse position tracking
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  }, [points, lines, circles, polygons, selectedObject, drawGrid, drawAxes, zoom, pan, width, height, isDrawing, startPoint, currentTool, currentColor]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = canvasToWorld(e.clientX, e.clientY);
    
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
  }, [currentTool, isDrawing, startPoint, points, lines, circles, polygons, currentColor, canvasToWorld, saveToHistory]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.shiftKey || currentTool === 'select') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, [currentTool]);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && lastPanPoint) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setLastPanPoint(null);
  }, []);

  // Handle wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
    setZoom(newZoom);
  }, [zoom]);

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

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

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
      <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-800 rounded-lg">
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
        <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
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
            onClick={() => setShowAxes(!showAxes)}
            className={`p-2 rounded transition-colors ${
              showAxes ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Axes"
          >
            <Move className="w-4 h-4" />
          </button>
          
          <button
            onClick={resetView}
            className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
            title="Reset vue"
          >
            <RefreshCw className="w-4 h-4" />
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
            onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
            className="p-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-300 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(5, zoom + 0.1))}
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
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="cursor-crosshair"
          style={{ width, height }}
        />
        
        {/* Status bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur px-3 py-1 text-xs text-gray-300">
          <div className="flex items-center justify-between">
            <span>Outil: {tools.find(t => t.id === currentTool)?.label}</span>
            <span>Zoom: {Math.round(zoom * 100)}% | Grille: {showGrid ? 'ON' : 'OFF'} | Axes: {showAxes ? 'ON' : 'OFF'}</span>
            <span>Objets: {points.length + lines.length + circles.length + polygons.length}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-400 bg-gray-800/50 rounded-lg p-3">
        <p className="font-medium mb-1">💡 Instructions:</p>
        <ul className="space-y-1">
          <li>• Cliquez pour dessiner avec l'outil sélectionné</li>
          <li>• Maintenez Shift + clic ou utilisez l'outil Sélectionner pour déplacer la vue</li>
          <li>• Molette pour zoomer</li>
          <li>• Grille: 1 carreau = 20 unités</li>
        </ul>
      </div>
    </div>
  );
}
