'use client';

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

interface ToolPanelProps {
  selectedTool: GeometryTool;
  onToolChange: (tool: GeometryTool) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showAxes: boolean;
  setShowAxes: (show: boolean) => void;
  showMeasurements: boolean;
  setShowMeasurements: (show: boolean) => void;
  showLabels: boolean;
  setShowLabels: (show: boolean) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  onUndo: () => void;
  onSave: () => void;
  onExport: () => void;
  onShare: () => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  readOnly?: boolean;
}

const colors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

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

export default function ToolPanel({
  selectedTool,
  onToolChange,
  showGrid,
  setShowGrid,
  showAxes,
  setShowAxes,
  showMeasurements,
  setShowMeasurements,
  showLabels,
  setShowLabels,
  selectedColor,
  setSelectedColor,
  onUndo,
  onSave,
  onExport,
  onShare,
  onClear,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFullscreen,
  isFullscreen,
  readOnly = false
}: ToolPanelProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-[#1a1a2e] border-b border-gray-800">
      {/* Tools */}
      <div className="flex items-center gap-1">
        {tools.slice(0, 6).map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id as GeometryTool)}
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
            onClick={() => onToolChange(tool.id as GeometryTool)}
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
          onClick={onZoomIn}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Zoomer"
        >
          <ZoomIn className="w-4 h-4 text-gray-400" />
        </button>
        
        <button
          onClick={onZoomOut}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Dézoomer"
        >
          <ZoomOut className="w-4 h-4 text-gray-400" />
        </button>
        
        <button
          onClick={onZoomReset}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Réinitialiser la vue"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
        
        <button
          onClick={onFullscreen}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Plein écran (prend TOUT l'écran)"
        >
          {isFullscreen ? (
            <Maximize className="w-4 h-4 text-indigo-400" />
          ) : (
            <Maximize className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      
      <div className="w-px h-6 bg-gray-700 mx-2" />
      
      {/* Display Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg transition-all ${showGrid ? 'bg-indigo-500/20' : 'hover:bg-gray-800'}`}
          title="Grille"
        >
          <Grid3X3 className={`w-4 h-4 ${showGrid ? 'text-indigo-400' : 'text-gray-400'}`} />
        </button>
        
        <button
          onClick={() => setShowAxes(!showAxes)}
          className={`p-2 rounded-lg transition-all ${showAxes ? 'bg-indigo-500/20' : 'hover:bg-gray-800'}`}
          title="Axes"
        >
          <Move3d className={`w-4 h-4 ${showAxes ? 'text-indigo-400' : 'text-gray-400'}`} />
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
          onClick={onUndo}
          disabled={readOnly}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Annuler (Ctrl+Z)"
        >
          <Undo className="w-4 h-4 text-gray-400" />
        </button>
        
        <button
          onClick={onSave}
          disabled={readOnly}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sauvegarder (Ctrl+S)"
        >
          <Save className="w-4 h-4 text-indigo-400" />
        </button>
        
        <button
          onClick={onExport}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Exporter"
        >
          <Download className="w-4 h-4 text-green-400" />
        </button>
        
        <button
          onClick={onShare}
          className="p-2 rounded-lg hover:bg-gray-800 transition-all"
          title="Partager"
        >
          <Share2 className="w-4 h-4 text-purple-400" />
        </button>
        
        <button
          onClick={onClear}
          disabled={readOnly}
          className="p-2 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Tout effacer"
        >
          <RefreshCw className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}
