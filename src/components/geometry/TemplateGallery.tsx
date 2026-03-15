'use client';

import { useState } from 'react';
import { 
  Ruler, 
  Circle,
  Triangle,
  Move3d,
  Square,
  RotateCcw,
  Plus
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'basic' | 'trigonometry' | 'advanced';
  generator: () => any; // Function to generate the template objects
}

interface TemplateGalleryProps {
  onTemplateSelect: (template: Template) => void;
  onClose?: () => void;
}

export default function TemplateGallery({ onTemplateSelect, onClose }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'trigonometry' | 'advanced'>('all');

  const templates: Template[] = [
    {
      id: 'right-triangle',
      name: 'Triangle Rectangle',
      icon: <Triangle className="w-5 h-5" />,
      description: 'Triangle rectangle avec mesures',
      category: 'basic',
      generator: () => {
        return {
          points: [
            { id: 'A', x: 0, y: 0, name: 'A' },
            { id: 'B', x: 4, y: 0, name: 'B' },
            { id: 'C', x: 0, y: 3, name: 'C' }
          ],
          lines: [
            { id: 'AB', pointIds: ['A', 'B'], type: 'segment' },
            { id: 'AC', pointIds: ['A', 'C'], type: 'segment' },
            { id: 'BC', pointIds: ['B', 'C'], type: 'segment' }
          ],
          measurements: ['AB = 4', 'AC = 3', 'BC = 5']
        };
      }
    },
    {
      id: 'unit-circle',
      name: 'Cercle Trigonométrique',
      icon: <Circle className="w-5 h-5" />,
      description: 'Cercle unité avec angles',
      category: 'trigonometry',
      generator: () => {
        return {
          circle: { center: [0, 0], radius: 1 },
          points: [
            { id: 'O', x: 0, y: 0, name: 'O' },
            { id: 'I', x: 1, y: 0, name: 'I' },
            { id: 'J', x: 0, y: 1, name: 'J' },
            { id: 'M', x: 0.707, y: 0.707, name: 'M' }
          ],
          angles: [
            { center: 'O', point1: 'I', point2: 'M', value: 'π/4' }
          ]
        };
      }
    },
    {
      id: 'coordinate-system',
      name: 'Repère Orthonormé',
      icon: <Move3d className="w-5 h-5" />,
      description: 'Système de coordonnées gradué',
      category: 'basic',
      generator: () => {
        return {
          axes: {
            x: { min: -10, max: 10, step: 1 },
            y: { min: -10, max: 10, step: 1 }
          },
          grid: { enabled: true, step: 1 },
          origin: { x: 0, y: 0, name: 'O' }
        };
      }
    },
    {
      id: 'parallelogram',
      name: 'Parallélogramme',
      icon: <Square className="w-5 h-5" />,
      description: 'Parallélogramme avec diagonales',
      category: 'basic',
      generator: () => {
        return {
          points: [
            { id: 'A', x: -2, y: -1, name: 'A' },
            { id: 'B', x: 3, y: -1, name: 'B' },
            { id: 'C', x: 4, y: 2, name: 'C' },
            { id: 'D', x: -1, y: 2, name: 'D' }
          ],
          lines: [
            { id: 'AB', pointIds: ['A', 'B'], type: 'segment' },
            { id: 'BC', pointIds: ['B', 'C'], type: 'segment' },
            { id: 'CD', pointIds: ['C', 'D'], type: 'segment' },
            { id: 'DA', pointIds: ['D', 'A'], type: 'segment' },
            { id: 'AC', pointIds: ['A', 'C'], type: 'segment', dashed: true },
            { id: 'BD', pointIds: ['B', 'D'], type: 'segment', dashed: true }
          ]
        };
      }
    },
    {
      id: 'vector',
      name: 'Vecteur',
      icon: <Move3d className="w-5 h-5" />,
      description: 'Vecteur avec coordonnées',
      category: 'basic',
      generator: () => {
        return {
          points: [
            { id: 'O', x: 0, y: 0, name: 'O' },
            { id: 'A', x: 3, y: 4, name: 'A' }
          ],
          vectors: [
            { id: 'OA', origin: 'O', extremity: 'A', coordinates: [3, 4] }
          ],
          projections: [
            { from: 'A', to: [3, 0], type: 'horizontal' },
            { from: 'A', to: [0, 4], type: 'vertical' }
          ]
        };
      }
    },
    {
      id: 'symmetry',
      name: 'Symétrie Axiale',
      icon: <RotateCcw className="w-5 h-5" />,
      description: 'Axe de symétrie avec figure',
      category: 'advanced',
      generator: () => {
        return {
          axis: { points: [[0, -3], [0, 3]] },
          original: {
            points: [
              { id: 'A', x: 2, y: 1, name: 'A' },
              { id: 'B', x: 3, y: 2, name: 'B' },
              { id: 'C', x: 2, y: 3, name: 'C' }
            ],
            lines: [
              { id: 'AB', pointIds: ['A', 'B'], type: 'segment' },
              { id: 'BC', pointIds: ['B', 'C'], type: 'segment' },
              { id: 'CA', pointIds: ['C', 'A'], type: 'segment' }
            ]
          },
          symmetric: {
            points: [
              { id: 'A_prime', x: -2, y: 1, name: 'A\'' },
              { id: 'B_prime', x: -3, y: 2, name: 'B\'' },
              { id: 'C_prime', x: -2, y: 3, name: 'C\'' }
            ],
            lines: [
              { id: 'A_prime_B_prime', pointIds: ['A_prime', 'B_prime'], type: 'segment', dashed: true },
              { id: 'B_prime_C_prime', pointIds: ['B_prime', 'C_prime'], type: 'segment', dashed: true },
              { id: 'C_prime_A_prime', pointIds: ['C_prime', 'A_prime'], type: 'segment', dashed: true }
            ]
          }
        };
      }
    },
    {
      id: 'pythagore',
      name: 'Théorème de Pythagore',
      icon: <Ruler className="w-5 h-5" />,
      description: 'Visualisation du théorème',
      category: 'trigonometry',
      generator: () => {
        return {
          triangle: {
            points: [
              { id: 'A', x: 0, y: 0, name: 'A' },
              { id: 'B', x: 5, y: 0, name: 'B' },
              { id: 'C', x: 0, y: 4, name: 'C' }
            ],
            rightAngle: { vertex: 'A', sides: ['AB', 'AC'] }
          },
          squares: [
            { side: 'AB', outward: true },
            { side: 'AC', outward: true },
            { side: 'BC', outward: true }
          ],
          formula: 'AB² + AC² = BC² → 5² + 4² = 3² → 25 + 16 = 9'
        };
      }
    }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'Tous', count: templates.length },
    { id: 'basic', label: 'Basiques', count: templates.filter(t => t.category === 'basic').length },
    { id: 'trigonometry', label: 'Trigonométrie', count: templates.filter(t => t.category === 'trigonometry').length },
    { id: 'advanced', label: 'Avancés', count: templates.filter(t => t.category === 'advanced').length }
  ];

  return (
    <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4 max-w-4xl max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Templates Rapides</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              selectedCategory === category.id
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/30">
                {template.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white group-hover:text-indigo-400">
                  {template.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {template.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded ${
                template.category === 'basic' ? 'bg-green-500/20 text-green-400' :
                template.category === 'trigonometry' ? 'bg-blue-500/20 text-blue-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {template.category === 'basic' ? 'Basique' :
                 template.category === 'trigonometry' ? 'Trigonométrie' :
                 'Avancé'}
              </span>
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-indigo-400" />
            </div>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-1">Comment utiliser les templates</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Choisissez un template dans la galerie</li>
          <li>• Il sera automatiquement ajouté à votre canvas</li>
          <li>• Vous pouvez ensuite le modifier comme bon vous semble</li>
          <li>• Les templates incluent des mesures et annotations utiles</li>
        </ul>
      </div>
    </div>
  );
}
