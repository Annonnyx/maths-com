'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  EyeOff
} from 'lucide-react';

export type FunctionType = 'linear' | 'quadratic' | 'sine' | 'cosine' | 'tangent' | 'exponential' | 'logarithm' | 'square' | 'cube' | 'sqrt' | 'inverse';

interface FunctionParams {
  a?: number;
  b?: number;
  c?: number;
}

interface FunctionGraphProps {
  width?: number;
  height?: number;
  initialFunction?: FunctionType;
  initialParams?: FunctionParams;
  showGrid?: boolean;
  showAxes?: boolean;
  showVariationTable?: boolean;
  readOnly?: boolean;
}

export default function FunctionGraph({ 
  width = 800, 
  height = 500, 
  initialFunction = 'linear',
  initialParams = { a: 1, b: 0, c: 0 },
  showGrid = true,
  showAxes = true,
  showVariationTable = false,
  readOnly = false
}: FunctionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [functionType, setFunctionType] = useState<FunctionType>(initialFunction);
  const [params, setParams] = useState<FunctionParams>(initialParams);
  const [scale, setScale] = useState(40);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [showGridState, setShowGridState] = useState(showGrid);
  const [showAxesState, setShowAxesState] = useState(showAxes);
  const [showVariationTableState, setShowVariationTableState] = useState(showVariationTable);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Grid settings
  const gridSize = 20;
  const gridWidth = width / scale;
  const gridHeight = height / scale;

  // Convert coordinates
  const toSvgCoords = (x: number, y: number) => ({
    x: width / 2 + (x * scale) + offsetX,
    y: height / 2 - (y * scale) + offsetY
  });

  // Calculate function value
  const calculateFunction = (x: number): number => {
    const { a = 1, b = 0, c = 0 } = params;
    
    switch (functionType) {
      case 'linear':
        return a * x + b;
      case 'quadratic':
        return a * x * x + b * x + c;
      case 'sine':
        return a * Math.sin(b * x + c);
      case 'cosine':
        return a * Math.cos(b * x + c);
      case 'tangent':
        return a * Math.tan(b * x + c);
      case 'exponential':
        return a * Math.exp(b * x + c);
      case 'logarithm':
        return x > 0 ? a * Math.log(Math.abs(x)) + b : NaN;
      case 'square':
        return a * x * x;
      case 'cube':
        return a * x * x * x;
      case 'sqrt':
        return x >= 0 ? a * Math.sqrt(x) : NaN;
      case 'inverse':
        return x !== 0 ? a / x : NaN;
      default:
        return 0;
    }
  };

  // Generate function points
  const generateFunctionPoints = () => {
    const points = [];
    const xMin = -gridWidth / 2;
    const xMax = gridWidth / 2;
    const step = 0.1;

    for (let x = xMin; x <= xMax; x += step) {
      const y = calculateFunction(x);
      if (!isNaN(y) && isFinite(y)) {
        const svgCoords = toSvgCoords(x, y);
        points.push(svgCoords);
      }
    }
    return points;
  };

  // Find intersections with axes
  const findIntersections = () => {
    const intersections = [];
    
    // Intersection with x-axis (y = 0)
    for (let x = -10; x <= 10; x += 0.1) {
      const y = calculateFunction(x);
      if (Math.abs(y) < 0.1) {
        intersections.push({ type: 'x-axis', x, y: 0 });
        break;
      }
    }
    
    // Intersection with y-axis (x = 0)
    const yAtZero = calculateFunction(0);
    if (!isNaN(yAtZero) && isFinite(yAtZero)) {
      intersections.push({ type: 'y-axis', x: 0, y: yAtZero });
    }
    
    return intersections;
  };

  // Generate variation table
  const generateVariationTable = () => {
    const table = [];
    const xValues = [-2, -1, 0, 1, 2];
    
    for (const x of xValues) {
      const y = calculateFunction(x);
      table.push({ x, y: isNaN(y) ? '∅' : y.toFixed(2) });
    }
    return table;
  };

  // Get function expression
  const getFunctionExpression = () => {
    const { a = 1, b = 0, c = 0 } = params;
    
    switch (functionType) {
      case 'linear':
        return `${a}x ${b >= 0 ? '+' : ''}${b}`;
      case 'quadratic':
        return `${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c}`;
      case 'sine':
        return `${a}sin(${b}x ${c >= 0 ? '+' : ''}${c})`;
      case 'cosine':
        return `${a}cos(${b}x ${c >= 0 ? '+' : ''}${c})`;
      case 'tangent':
        return `${a}tan(${b}x ${c >= 0 ? '+' : ''}${c})`;
      case 'exponential':
        return `${a}e^(${b}x ${c >= 0 ? '+' : ''}${c})`;
      case 'logarithm':
        return `${a}ln(x) ${b >= 0 ? '+' : ''}${b}`;
      case 'square':
        return `${a}x²`;
      case 'cube':
        return `${a}x³`;
      case 'sqrt':
        return `${a}√x`;
      case 'inverse':
        return `${a}/x`;
      default:
        return 'f(x)';
    }
  };

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || readOnly) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (readOnly) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(10, Math.min(200, prev * delta)));
  };

  // Reset view
  const resetView = () => {
    setScale(40);
    setOffsetX(0);
    setOffsetY(0);
  };

  // Export as image
  const exportImage = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = width;
    canvas.height = height;
    
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `function-graph-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const functionPoints = generateFunctionPoints();
  const intersections = findIntersections();
  const variationTable = generateVariationTable();

  return (
    <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1a1a2e] border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <select
            value={functionType}
            onChange={(e) => setFunctionType(e.target.value as FunctionType)}
            disabled={readOnly}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="linear">Fonction affine (ax+b)</option>
            <option value="quadratic">Parabole (ax²+bx+c)</option>
            <option value="sine">Sinus (sin)</option>
            <option value="cosine">Cosinus (cos)</option>
            <option value="tangent">Tangente (tan)</option>
            <option value="exponential">Exponentielle (e^x)</option>
            <option value="logarithm">Logarithme (ln)</option>
            <option value="square">Carré (x²)</option>
            <option value="cube">Cube (x³)</option>
            <option value="sqrt">Racine (√x)</option>
            <option value="inverse">Inverse (1/x)</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
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
            <Eye className={`w-4 h-4 ${showAxesState ? 'text-indigo-400' : 'text-gray-400'}`} />
          </button>
          
          <button
            onClick={() => setShowVariationTableState(!showVariationTableState)}
            className={`p-2 rounded-lg transition-all ${showVariationTableState ? 'bg-indigo-500/20' : 'hover:bg-gray-800'}`}
            title="Tableau de variation"
          >
            <Settings className={`w-4 h-4 ${showVariationTableState ? 'text-indigo-400' : 'text-gray-400'}`} />
          </button>
          
          <div className="w-px h-6 bg-gray-700 mx-2" />
          
          <button
            onClick={() => setScale(scale * 1.2)}
            disabled={readOnly}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={() => setScale(scale * 0.8)}
            disabled={readOnly}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={resetView}
            disabled={readOnly}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
            title="Réinitialiser"
          >
            <RotateCcw className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={exportImage}
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            title="Exporter"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Parameters */}
      <div className="flex items-center gap-4 p-4 bg-[#1a1a2e] border-b border-gray-800">
        <span className="text-sm text-gray-400">f(x) =</span>
        <span className="text-lg font-mono text-indigo-400">{getFunctionExpression()}</span>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">a:</label>
          <input
            type="number"
            value={params.a}
            onChange={(e) => setParams({ ...params, a: parseFloat(e.target.value) || 0 })}
            disabled={readOnly}
            className="w-16 bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 focus:border-indigo-500 focus:outline-none"
            step="0.1"
          />
          
          <label className="text-sm text-gray-400">b:</label>
          <input
            type="number"
            value={params.b}
            onChange={(e) => setParams({ ...params, b: parseFloat(e.target.value) || 0 })}
            disabled={readOnly}
            className="w-16 bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 focus:border-indigo-500 focus:outline-none"
            step="0.1"
          />
          
          <label className="text-sm text-gray-400">c:</label>
          <input
            type="number"
            value={params.c}
            onChange={(e) => setParams({ ...params, c: parseFloat(e.target.value) || 0 })}
            disabled={readOnly}
            className="w-16 bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 focus:border-indigo-500 focus:outline-none"
            step="0.1"
          />
        </div>
      </div>
      
      {/* Canvas */}
      <div className="relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="bg-[#0f0f1a] cursor-move"
          style={{ touchAction: 'none' }}
        >
          {/* Grid */}
          {showGridState && (
            <g opacity={0.3}>
              {Array.from({ length: Math.ceil(gridWidth / gridSize) + 1 }).map((_, i) => (
                <line
                  key={`v${i}`}
                  x1={i * gridSize}
                  y1={0}
                  x2={i * gridSize}
                  y2={height}
                  stroke="#4b5563"
                  strokeWidth={0.5}
                />
              ))}
              {Array.from({ length: Math.ceil(gridHeight / gridSize) + 1 }).map((_, i) => (
                <line
                  key={`h${i}`}
                  x1={0}
                  y1={i * gridSize}
                  x2={width}
                  y2={i * gridSize}
                  stroke="#4b5563"
                  strokeWidth={0.5}
                />
              ))}
            </g>
          )}
          
          {/* Axes */}
          {showAxesState && (
            <g>
              <line x1={0} y1={height/2} x2={width} y2={height/2} stroke="#6366f1" strokeWidth={1} opacity={0.5} />
              <line x1={width/2} y1={0} x2={width/2} y2={height} stroke="#6366f1" strokeWidth={1} opacity={0.5} />
              
              {/* Axis labels */}
              <text x={width - 20} y={height/2 - 5} fill="#6366f1" fontSize="12" textAnchor="end">x</text>
              <text x={width/2 + 5} y={15} fill="#6366f1" fontSize="12">y</text>
              
              {/* Origin */}
              <text x={width/2 + 5} y={height/2 - 5} fill="#6366f1" fontSize="12">O</text>
            </g>
          )}
          
          {/* Function */}
          <polyline
            points={functionPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
          />
          
          {/* Intersections */}
          {intersections.map((intersection, i) => {
            const svgCoords = toSvgCoords(intersection.x, intersection.y);
            return (
              <g key={i}>
                <circle
                  cx={svgCoords.x}
                  cy={svgCoords.y}
                  r={4}
                  fill="#ef4444"
                />
                <text
                  x={svgCoords.x + 8}
                  y={svgCoords.y - 8}
                  fill="#ef4444"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {intersection.type === 'x-axis' ? `(${intersection.x.toFixed(1)}, 0)` : `(0, ${intersection.y.toFixed(1)})`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Variation Table */}
      {showVariationTableState && (
        <div className="p-4 bg-[#1a1a2e] border-t border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-indigo-400">Tableau de variation</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2 text-gray-400">x</th>
                  {variationTable.map((row, i) => (
                    <th key={i} className="text-center p-2 text-gray-400">{row.x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="p-2 font-semibold text-indigo-400">f(x)</td>
                  {variationTable.map((row, i) => (
                    <td key={i} className="text-center p-2 text-white">{row.y}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
