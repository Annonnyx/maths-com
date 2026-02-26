'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Triangle, 
  RotateCw, 
  Grid3X3,
  Calculator,
  ArrowRight,
  Info,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import GeometryCanvas from './GeometryCanvas';

interface TrigLesson {
  id: string;
  title: string;
  content: React.ReactNode;
  interactive?: React.ReactNode;
  quiz?: { question: string; options: string[]; correct: number; explanation: string }[];
}

const trigLessons: TrigLesson[] = [
  {
    id: 'intro',
    title: 'Introduction au cercle trigonométrique',
    content: (
      <div className="space-y-4">
        <p>Le cercle trigonométrique est un cercle de rayon 1 centré à l'origine. Il permet de définir les fonctions sinus et cosinus.</p>
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
          <p className="text-indigo-400 font-semibold">📐 Définition clé</p>
          <p className="text-sm mt-2">Pour un angle θ (en radians ou degrés) :</p>
          <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
            <li>cos(θ) = abscisse du point sur le cercle</li>
            <li>sin(θ) = ordonnée du point sur le cercle</li>
          </ul>
        </div>
        <p>Le point P sur le cercle a pour coordonnées (cos θ, sin θ).</p>
      </div>
    ),
    interactive: (
      <div className="space-y-4">
        <UnitCircleDemo />
      </div>
    ),
    quiz: [
      {
        question: "Quelle est la valeur de cos(0°) ?",
        options: ["0", "1", "-1", "0.5"],
        correct: 1,
        explanation: "À 0°, le point est à droite sur l'axe des x, donc cos(0°) = 1"
      },
      {
        question: "Quelle est la valeur de sin(90°) ?",
        options: ["0", "1", "-1", "0.5"],
        correct: 1,
        explanation: "À 90°, le point est en haut sur l'axe des y, donc sin(90°) = 1"
      }
    ]
  },
  {
    id: 'sine',
    title: 'La fonction Sinus',
    content: (
      <div className="space-y-4">
        <p>Le sinus est une fonction périodique qui oscille entre -1 et 1.</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="font-semibold text-green-400">Valeurs à mémoriser</p>
            <ul className="mt-2 space-y-1">
              <li>sin(0°) = 0</li>
              <li>sin(30°) = 1/2 = 0.5</li>
              <li>sin(45°) = √2/2 ≈ 0.707</li>
              <li>sin(60°) = √3/2 ≈ 0.866</li>
              <li>sin(90°) = 1</li>
            </ul>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="font-semibold text-yellow-400">Propriétés</p>
            <ul className="mt-2 space-y-1">
              <li>Période : 360° ou 2π</li>
              <li>Impaire : sin(-x) = -sin(x)</li>
              <li>Maximum : 1 à 90°</li>
              <li>Minimum : -1 à 270°</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    interactive: (
      <div className="space-y-4">
        <SineWaveDemo />
      </div>
    ),
    quiz: [
      {
        question: "Quelle est la valeur exacte de sin(30°) ?",
        options: ["0.5", "√2/2", "√3/2", "1"],
        correct: 0,
        explanation: "sin(30°) = 1/2 = 0.5 - C'est une valeur fondamentale à mémoriser"
      },
      {
        question: "sin(180°) est égal à :",
        options: ["1", "0", "-1", "0.5"],
        correct: 1,
        explanation: "À 180°, le point est sur l'axe des x négatifs : sin(180°) = 0"
      }
    ]
  },
  {
    id: 'cosine',
    title: 'La fonction Cosinus',
    content: (
      <div className="space-y-4">
        <p>Le cosinus est décalé de 90° par rapport au sinus.</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="font-semibold text-blue-400">Valeurs à mémoriser</p>
            <ul className="mt-2 space-y-1">
              <li>cos(0°) = 1</li>
              <li>cos(30°) = √3/2 ≈ 0.866</li>
              <li>cos(45°) = √2/2 ≈ 0.707</li>
              <li>cos(60°) = 1/2 = 0.5</li>
              <li>cos(90°) = 0</li>
            </ul>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <p className="font-semibold text-orange-400">Relation clé</p>
            <p className="mt-2">cos(θ) = sin(90° - θ)</p>
            <p className="text-xs text-gray-400 mt-1">Le cosinus est le sinus de l'angle complémentaire</p>
          </div>
        </div>
      </div>
    ),
    interactive: (
      <div className="space-y-4">
        <CosineWaveDemo />
      </div>
    ),
    quiz: [
      {
        question: "cos(60°) est égal à :",
        options: ["0.5", "√2/2", "√3/2", "0"],
        correct: 0,
        explanation: "cos(60°) = 1/2 = 0.5 - Inverse de sin(60°)"
      },
      {
        question: "Quelle relation lie sin et cos ?",
        options: [
          "cos(θ) = sin(θ + 90°)", 
          "cos(θ) = sin(θ - 90°)", 
          "cos(θ) = sin(90° - θ)", 
          "cos(θ) = -sin(θ)"
        ],
        correct: 2,
        explanation: "cos(θ) = sin(90° - θ) - C'est la relation entre cosinus et sinus"
      }
    ]
  },
  {
    id: 'triangle',
    title: 'Dans un triangle rectangle',
    content: (
      <div className="space-y-4">
        <p>Dans un triangle rectangle, sinus et cosinus relient les angles aux côtés :</p>
        <div className="bg-[#1a1a2e] rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-pink-400 font-semibold">sin(θ) =</p>
              <p className="text-lg mt-1">opposé / hypoténuse</p>
            </div>
            <div>
              <p className="text-cyan-400 font-semibold">cos(θ) =</p>
              <p className="text-lg mt-1">adjacent / hypoténuse</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 font-semibold">⚠️ Identité fondamentale</p>
          <p className="mt-2">sin²(θ) + cos²(θ) = 1</p>
          <p className="text-sm text-gray-400 mt-1">Cette relation est vraie pour tout angle θ</p>
        </div>
      </div>
    ),
    interactive: (
      <div className="space-y-4">
        <RightTriangleDemo />
      </div>
    ),
    quiz: [
      {
        question: "Dans un triangle rectangle, si sin(θ) = 0.6, que vaut cos(θ) ?",
        options: ["0.4", "0.8", "0.6", "1"],
        correct: 1,
        explanation: "sin²(θ) + cos²(θ) = 1 → 0.36 + cos²(θ) = 1 → cos²(θ) = 0.64 → cos(θ) = 0.8"
      },
      {
        question: "Si l'hypoténuse = 10 et sin(θ) = 0.5, le côté opposé mesure :",
        options: ["5", "10", "20", "2.5"],
        correct: 0,
        explanation: "sin(θ) = opposé / hypoténuse → opposé = sin(θ) × hypoténuse = 0.5 × 10 = 5"
      }
    ]
  }
];

function UnitCircleDemo() {
  const [angle, setAngle] = useState(45);
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  
  return (
    <div className="space-y-4">
      <svg viewBox="-120 -120 240 240" className="w-full h-64 bg-[#0f0f1a] rounded-lg">
        {/* Grid */}
        <g opacity={0.2}>
          {[-100, -50, 0, 50, 100].map(i => (
            <line key={`v${i}`} x1={i} y1={-100} x2={i} y2={100} stroke="#4b5563" strokeWidth={0.5} />
          ))}
          {[-100, -50, 0, 50, 100].map(i => (
            <line key={`h${i}`} x1={-100} y1={i} x2={100} y2={i} stroke="#4b5563" strokeWidth={0.5} />
          ))}
        </g>
        
        {/* Axes */}
        <line x1={-100} y1={0} x2={100} y2={0} stroke="#6366f1" strokeWidth={1} />
        <line x1={0} y1={-100} x2={0} y2={100} stroke="#6366f1" strokeWidth={1} />
        
        {/* Unit circle */}
        <circle cx={0} cy={0} r={100} fill="none" stroke="#8b5cf6" strokeWidth={2} />
        
        {/* Angle arc */}
        <path 
          d={`M 30 0 A 30 30 0 ${angle > 180 ? 1 : 0} 1 ${30 * Math.cos(rad)} ${-30 * Math.sin(rad)}`}
          fill="none" 
          stroke="#f59e0b" 
          strokeWidth={2}
        />
        
        {/* Radius line */}
        <line x1={0} y1={0} x2={100 * x} y2={-100 * y} stroke="#ec4899" strokeWidth={2} />
        
        {/* Cosine projection */}
        <line x1={100 * x} y1={-100 * y} x2={100 * x} y2={0} stroke="#22d3ee" strokeWidth={2} strokeDasharray="4,4" />
        <line x1={0} y1={0} x2={100 * x} y2={0} stroke="#22d3ee" strokeWidth={2} opacity={0.5} />
        
        {/* Sine projection */}
        <line x1={100 * x} y1={-100 * y} x2={0} y2={-100 * y} stroke="#10b981" strokeWidth={2} strokeDasharray="4,4" />
        <line x1={0} y1={0} x2={0} y2={-100 * y} stroke="#10b981" strokeWidth={2} opacity={0.5} />
        
        {/* Point */}
        <circle cx={100 * x} cy={-100 * y} r={6} fill="#f59e0b" />
        
        {/* Labels */}
        <text x={100 * x + 10} y={-100 * y - 10} fill="#f59e0b" fontSize="12">P</text>
        <text x={110} y={10} fill="#22d3ee" fontSize="12">cos(θ) = {x.toFixed(3)}</text>
        <text x={10} y={-110} fill="#10b981" fontSize="12">sin(θ) = {y.toFixed(3)}</text>
        <text x={40} y={-20} fill="#f59e0b" fontSize="12">θ = {angle}°</text>
      </svg>
      
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Angle : {angle}°</label>
        <input 
          type="range" 
          min="0" 
          max="360" 
          value={angle} 
          onChange={(e) => setAngle(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0°</span>
          <span>90°</span>
          <span>180°</span>
          <span>270°</span>
          <span>360°</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-cyan-500/10 rounded-lg p-3">
          <span className="text-cyan-400">cos({angle}°)</span> = {x.toFixed(4)}
        </div>
        <div className="bg-emerald-500/10 rounded-lg p-3">
          <span className="text-emerald-400">sin({angle}°)</span> = {y.toFixed(4)}
        </div>
      </div>
    </div>
  );
}

function SineWaveDemo() {
  const [angle, setAngle] = useState(45);
  const points = Array.from({ length: 361 }, (_, i) => {
    const rad = (i * Math.PI) / 180;
    return { x: i, y: 50 - 40 * Math.sin(rad) };
  });
  
  const currentY = 50 - 40 * Math.sin((angle * Math.PI) / 180);
  
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 360 100" className="w-full h-32 bg-[#0f0f1a] rounded-lg">
        {/* Grid */}
        <g opacity={0.2}>
          {[0, 90, 180, 270, 360].map(i => (
            <line key={i} x1={i} y1={0} x2={i} y2={100} stroke="#4b5563" strokeWidth={0.5} />
          ))}
        </g>
        
        {/* Sine wave */}
        <path 
          d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`}
          fill="none"
          stroke="#10b981"
          strokeWidth={2}
        />
        
        {/* Current point */}
        <circle cx={angle} cy={currentY} r={4} fill="#f59e0b" />
        
        {/* Vertical line */}
        <line x1={angle} y1={0} x2={angle} y2={100} stroke="#f59e0b" strokeWidth={1} strokeDasharray="2,2" />
      </svg>
      
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Angle : {angle}°</label>
        <input 
          type="range" 
          min="0" 
          max="360" 
          value={angle} 
          onChange={(e) => setAngle(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <div className="text-center bg-emerald-500/10 rounded-lg p-3">
        <span className="text-emerald-400 text-lg font-semibold">sin({angle}°) = {(Math.sin((angle * Math.PI) / 180)).toFixed(4)}</span>
      </div>
    </div>
  );
}

function CosineWaveDemo() {
  const [angle, setAngle] = useState(45);
  const points = Array.from({ length: 361 }, (_, i) => {
    const rad = (i * Math.PI) / 180;
    return { x: i, y: 50 - 40 * Math.cos(rad) };
  });
  
  const currentY = 50 - 40 * Math.cos((angle * Math.PI) / 180);
  
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 360 100" className="w-full h-32 bg-[#0f0f1a] rounded-lg">
        {/* Grid */}
        <g opacity={0.2}>
          {[0, 90, 180, 270, 360].map(i => (
            <line key={i} x1={i} y1={0} x2={i} y2={100} stroke="#4b5563" strokeWidth={0.5} />
          ))}
        </g>
        
        {/* Cosine wave */}
        <path 
          d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={2}
        />
        
        {/* Current point */}
        <circle cx={angle} cy={currentY} r={4} fill="#f59e0b" />
        
        {/* Vertical line */}
        <line x1={angle} y1={0} x2={angle} y2={100} stroke="#f59e0b" strokeWidth={1} strokeDasharray="2,2" />
      </svg>
      
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Angle : {angle}°</label>
        <input 
          type="range" 
          min="0" 
          max="360" 
          value={angle} 
          onChange={(e) => setAngle(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <div className="text-center bg-cyan-500/10 rounded-lg p-3">
        <span className="text-cyan-400 text-lg font-semibold">cos({angle}°) = {(Math.cos((angle * Math.PI) / 180)).toFixed(4)}</span>
      </div>
    </div>
  );
}

function RightTriangleDemo() {
  const [angle, setAngle] = useState(30);
  const rad = (angle * Math.PI) / 180;
  const hypotenuse = 100;
  const adjacent = hypotenuse * Math.cos(rad);
  const opposite = hypotenuse * Math.sin(rad);
  
  return (
    <div className="space-y-4">
      <svg viewBox="-10 -10 160 120" className="w-full h-48 bg-[#0f0f1a] rounded-lg">
        {/* Triangle */}
        <polygon 
          points={`0,100 ${adjacent},100 ${adjacent},${100 - opposite}`}
          fill="#8b5cf620"
          stroke="#8b5cf6"
          strokeWidth={2}
        />
        
        {/* Right angle marker */}
        <rect x={adjacent - 8} y={100 - 8} width={8} height={8} fill="none" stroke="#8b5cf6" strokeWidth={1} />
        
        {/* Angle arc */}
        <path 
          d={`M 15 100 A 15 15 0 0 0 ${15 * Math.cos(rad)} ${100 - 15 * Math.sin(rad)}`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2}
        />
        
        {/* Labels */}
        <text x={adjacent / 2} y={115} fill="#22d3ee" fontSize="12" textAnchor="middle">
          adjacent = {Math.cos(rad).toFixed(3)}×h
        </text>
        <text x={adjacent + 5} y={100 - opposite / 2} fill="#10b981" fontSize="12">
          opposé = {Math.sin(rad).toFixed(3)}×h
        </text>
        <text x={adjacent / 2 - 20} y={100 - opposite / 2 - 10} fill="#ec4899" fontSize="12" textAnchor="middle">
          hypoténuse
        </text>
        <text x={20} y={95} fill="#f59e0b" fontSize="12">θ = {angle}°</text>
      </svg>
      
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Angle θ : {angle}°</label>
        <input 
          type="range" 
          min="5" 
          max="85" 
          value={angle} 
          onChange={(e) => setAngle(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-cyan-500/10 rounded-lg p-3">
          <span className="text-cyan-400">cos({angle}°)</span> = adjacent/h = {Math.cos(rad).toFixed(4)}
        </div>
        <div className="bg-emerald-500/10 rounded-lg p-3">
          <span className="text-emerald-400">sin({angle}°)</span> = opposé/h = {Math.sin(rad).toFixed(4)}
        </div>
      </div>
    </div>
  );
}

export function TrigonometryCourse() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const lesson = trigLessons[currentLesson];
  
  const handleQuizAnswer = (answerIndex: number) => {
    setQuizAnswers([...quizAnswers, answerIndex]);
    if (quizAnswers.length + 1 === (lesson.quiz?.length || 0)) {
      setShowResults(true);
    }
  };
  
  const resetQuiz = () => {
    setQuizAnswers([]);
    setShowResults(false);
    setShowQuiz(false);
  };
  
  return (
    <div className="bg-[#12121a] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Triangle className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold">Trigonométrie Interactive</h2>
        </div>
        
        {/* Lesson tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {trigLessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => {
                setCurrentLesson(i);
                resetQuiz();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                currentLesson === i 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {i + 1}. {l.title}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Theory */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-400" />
              {lesson.title}
            </h3>
            <div className="text-gray-300 leading-relaxed">
              {lesson.content}
            </div>
            
            {lesson.quiz && (
              <div className="mt-6">
                {!showQuiz ? (
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
                  >
                    <Calculator className="w-4 h-4" />
                    Tester mes connaissances
                  </button>
                ) : !showResults ? (
                  <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
                    <p className="font-semibold mb-4">
                      Question {quizAnswers.length + 1} / {lesson.quiz.length}
                    </p>
                    <p className="mb-4">{lesson.quiz[quizAnswers.length].question}</p>
                    <div className="space-y-2">
                      {lesson.quiz[quizAnswers.length].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuizAnswer(i)}
                          className="w-full p-3 text-left bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
                    <h4 className="font-semibold mb-4">Résultats</h4>
                    {lesson.quiz.map((q, i) => {
                      const correct = quizAnswers[i] === q.correct;
                      return (
                        <div key={i} className={`p-3 rounded-lg mb-2 ${correct ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          <div className="flex items-center gap-2">
                            {correct ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                            <span className="text-sm">{q.question}</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{q.explanation}</p>
                        </div>
                      );
                    })}
                    <button
                      onClick={resetQuiz}
                      className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Recommencer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Interactive */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-pink-400" />
              Démonstration interactive
            </h3>
            {lesson.interactive}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={() => {
              setCurrentLesson(Math.max(0, currentLesson - 1));
              resetQuiz();
            }}
            disabled={currentLesson === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>
          
          <div className="flex gap-1">
            {trigLessons.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i === currentLesson ? 'bg-indigo-500' : 'bg-gray-700'}`}
              />
            ))}
          </div>
          
          <button
            onClick={() => {
              setCurrentLesson(Math.min(trigLessons.length - 1, currentLesson + 1));
              resetQuiz();
            }}
            disabled={currentLesson === trigLessons.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 rounded-lg transition-colors"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrigonometryCourse;
