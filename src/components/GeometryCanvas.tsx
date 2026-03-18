'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOOLS = [
  { id: 'select',    icon: '↖', label: 'Sélectionner',   group: 'base' },
  { id: 'point',     icon: '•', label: 'Point',           group: 'create' },
  { id: 'segment',   icon: '╱', label: 'Segment',         group: 'create' },
  { id: 'line',      icon: '↔', label: 'Droite',          group: 'create' },
  { id: 'ray',       icon: '→', label: 'Demi-droite',     group: 'create' },
  { id: 'circle',    icon: '○', label: 'Cercle',          group: 'create' },
  { id: 'triangle',  icon: '△', label: 'Triangle',        group: 'create' },
  { id: 'polygon',   icon: '⬡', label: 'Polygone',        group: 'create' },
  { id: 'rectangle', icon: '▭', label: 'Rectangle',       group: 'create' },
  { id: 'function',  icon: '∫', label: 'Fonction',        group: 'create' },
  { id: 'angle',     icon: '∠', label: 'Angle',           group: 'measure' },
  { id: 'distance',  icon: '↕', label: 'Distance',        group: 'measure' },
  { id: 'midpoint',  icon: '⊕', label: 'Milieu',          group: 'measure' },
  { id: 'perp',      icon: '⊥', label: 'Perpendiculaire', group: 'measure' },
  { id: 'parallel',  icon: '∥', label: 'Parallèle',       group: 'measure' },
  { id: 'text',      icon: 'T', label: 'Texte',           group: 'annotate' },
];

const COLORS = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#34495e','#ffffff','#000000'];

const PRESETS = [
  { label: 'Théorème de Pythagore', fn: (board: any) => createPythagoras(board) },
  { label: 'Cercle trigonométrique', fn: (board: any) => createUnitCircle(board) },
  { label: 'Triangle équilatéral',   fn: (board: any) => createEquilateral(board) },
];

// ─── JSXGraph loader ──────────────────────────────────────────────────────────

function loadJSXGraph() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).JXG) { 
      resolve((window as any).JXG); 
      return; 
    }
    
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css';
    document.head.appendChild(css);
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraphcore.js';
    script.onload = () => resolve((window as any).JXG);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ─── Preset constructors ──────────────────────────────────────────────────────

function createPythagoras(board: any) {
  const A = board.create('point', [0, 0], { name: 'A', size: 4, color: '#3498db' });
  const B = board.create('point', [4, 0], { name: 'B', size: 4, color: '#3498db' });
  const C = board.create('point', [0, 3], { name: 'C', size: 4, color: '#3498db' });
  board.create('polygon', [A, B, C], { fillColor: '#3498db', fillOpacity: 0.15, strokeColor: '#3498db' });
  board.create('angle', [B, A, C], { name: '90°', radius: 0.5, orthotype: 'square' });
  board.create('segment', [A, B], { strokeColor: '#e74c3c', label: { autoPosition: true } });
  board.create('segment', [A, C], { strokeColor: '#2ecc71', label: { autoPosition: true } });
  board.create('segment', [B, C], { strokeColor: '#9b59b6', label: { autoPosition: true } });
}

function createUnitCircle(board: any) {
  const O = board.create('point', [0, 0], { name: 'O', size: 4, color: '#3498db', fixed: true });
  board.create('circle', [O, 1], { strokeColor: '#3498db', strokeWidth: 2, fillOpacity: 0 });
  const P = board.create('glider', [1, 0, board.create('circle', [O, 1], { visible: false })],
    { name: 'P', size: 5, color: '#e74c3c' });
  board.create('segment', [O, P], { strokeColor: '#e74c3c', strokeWidth: 1.5 });
  const Px = board.create('point', [() => P.X(), 0], { name: '', size: 3, color: '#e67e22', fixed: true });
  board.create('segment', [P, Px], { strokeColor: '#2ecc71', strokeWidth: 1, dash: 2 });
  board.create('segment', [O, Px], { strokeColor: '#e67e22', strokeWidth: 2 });
  board.create('text', [-2.8, 1.4, () => `cos θ = ${P.X().toFixed(3)}\nsin θ = ${P.Y().toFixed(3)}`],
    { fontSize: 14, color: '#34495e' });
}

function createEquilateral(board: any) {
  const A = board.create('point', [0, 0],   { name: 'A', size: 4, color: '#3498db' });
  const B = board.create('point', [4, 0],   { name: 'B', size: 4, color: '#3498db' });
  const C = board.create('point', [2, 3.46],{ name: 'C', size: 4, color: '#3498db' });
  board.create('polygon', [A, B, C], { fillColor: '#2ecc71', fillOpacity: 0.2, strokeColor: '#2ecc71', strokeWidth: 2 });
  board.create('angle', [C, A, B], { name: '60°', radius: 0.7 });
  board.create('angle', [A, B, C], { name: '60°', radius: 0.7 });
  board.create('angle', [B, C, A], { name: '60°', radius: 0.7 });
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const boardRef      = useRef<HTMLDivElement>(null);
  const jxgBoardRef   = useRef<any>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const tempPointsRef = useRef<any[]>([]);
  const historyRef    = useRef<string[]>([]);
  const redoStackRef  = useRef<string[]>([]);

  const [tool, setTool]               = useState('select');
  const [loaded, setLoaded]           = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid]       = useState(initialShowGrid);
  const [showAxes, setShowAxes]       = useState(initialShowAxes);
  const [snapGrid, setSnapGrid]       = useState(false);
  const [color, setColor]             = useState('#3498db');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillOpacity, setFillOpacity] = useState(0.15);
  const [showFnPanel, setShowFnPanel] = useState(false);
  const [fnExpr, setFnExpr]           = useState('Math.sin(x)');
  const [fnColor, setFnColor]         = useState('#e74c3c');
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [status, setStatus]           = useState('Prêt — cliquez pour créer des objets');
  const [objectCount, setObjectCount] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  const toolRef = useRef(tool);
  toolRef.current = tool;

  // ─── Board init ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    loadJSXGraph().then((JXG: any) => {
      if (!boardRef.current) return;
      
      const board = JXG.JSXGraph.initBoard('jxg-board', {
        boundingbox: [-10, 10, 10, -10],
        axis: showAxes,
        grid: showGrid,
        pan: {
          enabled: true,
          needTwoFingers: false,
          needShift: true       // ← libère la molette ET le clic gauche
        },
        zoom: {
          enabled: true,
          wheel: true,
          needShift: false,     // ← molette seule suffit pour zoomer
          min: 0.01,
          max: 100,
          factorX: 1.25,        // ← MANQUANT : facteur de zoom horizontal
          factorY: 1.25,        // ← MANQUANT : facteur de zoom vertical
          pinchHorizontal: true,
          pinchVertical: true,
        },
        showCopyright: false,
        showNavigation: false,
        keepaspectratio: true,
        defaultAxes: {
          x: { strokeColor: '#888', ticks: { visible: true, strokeColor: '#888', label: { fontSize: 11, color: '#888' } } },
          y: { strokeColor: '#888', ticks: { visible: true, strokeColor: '#888', label: { fontSize: 11, color: '#888' } } },
        },
      });

      jxgBoardRef.current = board;
      setLoaded(true);
      attachClickHandler(board, JXG);
    });

    return () => {
      if (jxgBoardRef.current) {
        try { (window as any).JXG?.JSXGraph.freeBoard(jxgBoardRef.current); } catch (_) {}
      }
    };
  }, [showAxes, showGrid]);

  // ─── Click handler ─────────────────────────────────────────────────────────

  const attachClickHandler = (board: any, JXG: any) => {
    board.containerObj.addEventListener('click', (e: MouseEvent) => {
      if (e.button !== 0) return;
      const currentTool = toolRef.current;
      if (['select','angle','distance','function','text'].includes(currentTool)) return;

      const rect = board.containerObj.getBoundingClientRect();
      const cssX = e.clientX - rect.left;
      const cssY = e.clientY - rect.top;
      const coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [cssX, cssY], board);
      let x = snapGridRef.current ? Math.round(coords.usrCoords[1]) : coords.usrCoords[1];
      let y = snapGridRef.current ? Math.round(coords.usrCoords[2]) : coords.usrCoords[2];

      handleToolClick(board, JXG, currentTool, x, y);
    });
  };

  const snapGridRef = useRef(snapGrid);
  useEffect(() => { snapGridRef.current = snapGrid; }, [snapGrid]);

  const colorRef      = useRef(color);
  const strokeWRef    = useRef(strokeWidth);
  const fillOpRef     = useRef(fillOpacity);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { strokeWRef.current = strokeWidth; }, [strokeWidth]);
  useEffect(() => { fillOpRef.current = fillOpacity; }, [fillOpacity]);

  // ─── History ───────────────────────────────────────────────────────────────

  const saveHistory = () => {
    const board = jxgBoardRef.current;
    if (!board) return;
    const snap = JSON.stringify(board.getBoundingBox());
    historyRef.current.push(snap);
    redoStackRef.current = [];
  };

  // ─── Name counter ──────────────────────────────────────────────────────────

  const nameCounter = useRef(0);
  const nextName = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const i = nameCounter.current++;
    return i < 26 ? letters[i] : letters[Math.floor(i / 26) - 1] + letters[i % 26];
  };

  // ─── Click handler ─────────────────────────────────────────────────────────

  const handleToolClick = useCallback((board: any, JXG: any, currentTool: string, x: number, y: number) => {
    const col = colorRef.current;
    const sw  = strokeWRef.current;
    const fo  = fillOpRef.current;

    const makePoint = (px: number, py: number, name = '') => board.create('point', [px, py], {
      name, size: 4, color: col, strokeColor: col, fillColor: col,
      label: { fontSize: 12 },
    });

    if (currentTool === 'point') {
      const p = makePoint(x, y, nextName());
      saveHistory(); setObjectCount(c => c + 1);
      setStatus(`Point ${p.name} créé en (${x.toFixed(2)}, ${y.toFixed(2)})`);
      return;
    }

    // Multi-click tools
    const tmp = tempPointsRef.current;

    const needs: Record<string, number> = { 
      segment: 2, line: 2, ray: 2, circle: 2, triangle: 3, polygon: -1, 
      rectangle: 2, midpoint: 2, perp: 2, parallel: 2, angle: 3, distance: 2
    };
    const n = needs[currentTool] ?? 1;

    const pt = makePoint(x, y, '');
    pt.setAttribute({ size: 3, color: '#aaa', strokeColor: '#aaa', fillColor: '#aaa' });
    tmp.push(pt);

    const remaining = n === -1 ? '...' : n - tmp.length;
    setStatus(`${tmp.length} point(s) sélectionné(s) — ${n === -1 ? 'Entrée pour finir' : `encore ${remaining}`}`);

    if (n !== -1 && tmp.length < n) return;

    // Enough points — create object
    tmp.forEach(p => p.setAttribute({ size: 4, color: col, strokeColor: col, fillColor: col }));

    saveHistory();

    try {
      if (currentTool === 'segment') {
        board.create('segment', [tmp[0], tmp[1]], { strokeColor: col, strokeWidth: sw, label: { visible: true, autoPosition: true } });
      } else if (currentTool === 'line') {
        board.create('line', [tmp[0], tmp[1]], { strokeColor: col, strokeWidth: sw });
      } else if (currentTool === 'ray') {
        board.create('arrow', [tmp[0], tmp[1]], { strokeColor: col, strokeWidth: sw });
      } else if (currentTool === 'circle') {
        board.create('circle', [tmp[0], tmp[1]], { strokeColor: col, strokeWidth: sw, fillColor: col, fillOpacity: fo });
      } else if (currentTool === 'triangle') {
        const poly = board.create('polygon', [tmp[0], tmp[1], tmp[2]], {
          fillColor: col, fillOpacity: fo, strokeColor: col, strokeWidth: sw,
        });
        // Auto angle display
        board.create('angle', [tmp[2], tmp[0], tmp[1]], { name: '', radius: 0.5, strokeColor: '#e67e22' });
        board.create('angle', [tmp[0], tmp[1], tmp[2]], { name: '', radius: 0.5, strokeColor: '#e67e22' });
        board.create('angle', [tmp[1], tmp[2], tmp[0]], { name: '', radius: 0.5, strokeColor: '#e67e22' });
      } else if (currentTool === 'rectangle') {
        const [p1, p2] = tmp;
        const p3 = board.create('point', [() => p2.X(), () => p1.Y()], { visible: false });
        const p4 = board.create('point', [() => p1.X(), () => p2.Y()], { visible: false });
        board.create('polygon', [p1, p3, p2, p4], {
          fillColor: col, fillOpacity: fo, strokeColor: col, strokeWidth: sw,
        });
      } else if (currentTool === 'midpoint') {
        const seg = board.create('segment', [tmp[0], tmp[1]], { visible: false });
        board.create('midpoint', [seg], { name: 'M', size: 5, color: col });
      } else if (currentTool === 'perp') {
        const seg = board.create('segment', [tmp[0], tmp[1]], { visible: false });
        board.create('perpendicular', [seg, tmp[0]], { strokeColor: col, strokeWidth: sw });
      } else if (currentTool === 'parallel') {
        const seg = board.create('segment', [tmp[0], tmp[1]], { visible: false });
        board.create('parallel', [seg, tmp[1]], { strokeColor: col, strokeWidth: sw });
      } else if (currentTool === 'angle') {
        board.create('angle', [tmp[0], tmp[1], tmp[2]], {
          name: () => {
            const a = tmp[1].Dist(tmp[0]);
            const b = tmp[1].Dist(tmp[2]);
            return JXG.Math.Geometry.angle(tmp[0], tmp[1], tmp[2]) * 180 / Math.PI + '°';
          },
          radius: 0.5, strokeColor: '#e67e22',
        });
      } else if (currentTool === 'distance') {
        board.create('segment', [tmp[0], tmp[1]], { strokeColor: col, strokeWidth: sw });
        board.create('text', [
          () => (tmp[0].X() + tmp[1].X()) / 2,
          () => (tmp[0].Y() + tmp[1].Y()) / 2 + 0.3,
          () => tmp[0].Dist(tmp[1]).toFixed(2),
        ], { fontSize: 13, color: col });
      }
      setObjectCount(c => c + 1);
    } catch (err: any) {
      setStatus(`Erreur: ${err.message}`);
    }

    tempPointsRef.current = [];
    setStatus('Prêt');
  }, []);

  // Polygon via Enter key
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && tool === 'polygon' && tempPointsRef.current.length >= 3) {
        const board = jxgBoardRef.current;
        if (!board) return;
        const tmp = tempPointsRef.current;
        tmp.forEach(p => p.setAttribute({ size: 4, color, strokeColor: color, fillColor: color }));
        board.create('polygon', tmp, { fillColor: color, fillOpacity, strokeColor: color, strokeWidth });
        tempPointsRef.current = [];
        saveHistory();
        setObjectCount(c => c + 1);
        setStatus('Polygone créé');
      }
      if (e.key === 'Escape') {
        tempPointsRef.current.forEach(p => { try { jxgBoardRef.current?.removeObject(p); } catch(_){} });
        tempPointsRef.current = [];
        setStatus('Annulé');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tool, color, fillOpacity, strokeWidth]);

  // ─── Tool status messages ──────────────────────────────────────────────────

  const toolHints: Record<string, string> = {
    select: 'Clic gauche pour sélectionner · Shift+drag pour déplacer la vue · Molette pour zoomer',
    point: 'Clic gauche pour placer un point',
    segment: 'Cliquez 2 points pour créer un segment',
    line: 'Cliquez 2 points pour créer une droite infinie',
    ray: 'Cliquez 2 points pour créer une demi-droite',
    circle: 'Cliquez le centre puis un point sur le cercle',
    triangle: 'Cliquez 3 points — les angles s\'affichent automatiquement',
    polygon: 'Cliquez les sommets · Entrée pour fermer · Échap pour annuler',
    rectangle: 'Cliquez 2 coins opposés',
    function: 'Saisissez une expression dans le panneau de droite',
    angle: 'Cliquez 3 points pour mesurer l\'angle',
    distance: 'Cliquez 2 points pour mesurer la distance',
    midpoint: 'Cliquez 2 points pour créer leur milieu',
    perp: 'Cliquez 2 points pour la perpendiculaire',
    parallel: 'Cliquez 2 points pour la parallèle',
    text: 'Saisissez le texte dans le panneau de droite',
  };

  const handleSetTool = (id: string) => {
    setTool(id);
    tempPointsRef.current.forEach(p => { try { jxgBoardRef.current?.removeObject(p); } catch(_){} });
    tempPointsRef.current = [];
    setStatus(toolHints[id] || 'Prêt');
    if (id === 'function') setShowFnPanel(true); else setShowFnPanel(false);
    if (id === 'text') setShowTextPanel(true); else setShowTextPanel(false);
  };

  // ─── Function plot ─────────────────────────────────────────────────────────

  const plotFunction = () => {
    const board = jxgBoardRef.current;
    if (!board) return;
    try {
      // eslint-disable-next-line no-new-func
      const f = new Function('x', `return ${fnExpr}`);
      board.create('functiongraph', [f, -20, 20], {
        strokeColor: fnColor, strokeWidth: strokeWidth, highlight: false,
      });
      saveHistory();
      setObjectCount(c => c + 1);
      setStatus(`f(x) = ${fnExpr} tracée`);
    } catch (err: any) {
      setStatus(`Erreur d'expression: ${err.message}`);
    }
  };

  // ─── Text label ────────────────────────────────────────────────────────────

  const addText = () => {
    const board = jxgBoardRef.current;
    if (!board || !textContent) return;
    board.create('text', [0, 0, textContent], { fontSize: 16, color, draggable: true });
    setTextContent('');
    saveHistory();
    setObjectCount(c => c + 1);
    setStatus('Texte ajouté — déplacez-le à la position souhaitée');
  };

  // ─── Clear ─────────────────────────────────────────────────────────────────

  const clearBoard = () => {
    const board = jxgBoardRef.current;
    if (!board) return;
    if (!window.confirm('Effacer toute la planche ?')) return;
    board.suspendUpdate();
    const ids = Object.keys(board.objects);
    ids.forEach(id => {
      const obj = board.objects[id];
      if (obj && obj.elType !== 'axis' && obj.elType !== 'ticks' && obj.elType !== 'grid') {
        try { board.removeObject(obj); } catch (_) {}
      }
    });
    board.unsuspendUpdate();
    nameCounter.current = 0;
    tempPointsRef.current = [];
    setObjectCount(0);
    setStatus('Planche effacée');
  };

  // ─── Export ────────────────────────────────────────────────────────────────

  const exportPNG = () => {
    const board = jxgBoardRef.current;
    if (!board) return;
    
    // JSXGraph exposes this via the board itself:
    const svgStr = board.renderer.dumpToString('');
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Then draw to canvas for PNG:
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = board.canvasWidth;
      canvas.height = board.canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = 'geometrie-maths-app.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setStatus('Export PNG en cours...');
  };

  const exportSVG = () => {
    const board = jxgBoardRef.current;
    if (!board) return;
    const svgStr = board.renderer.dumpToString('');
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geometrie-maths-app.svg';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Export SVG terminé');
  };

  // ─── Fullscreen ────────────────────────────────────────────────────────────

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.() || (el as any).webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || (document as any).webkitExitFullscreen?.();
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const onChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      setTimeout(() => {
        jxgBoardRef.current?.resizeContainer(
          boardRef.current?.offsetWidth || 800,
          boardRef.current?.offsetHeight || 600
        );
      }, 100);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ─── Presets ───────────────────────────────────────────────────────────────

  const applyPreset = (preset: any) => {
    const board = jxgBoardRef.current;
    if (!board) return;
    preset.fn(board);
    saveHistory();
    setObjectCount(c => c + 1);
    setShowPresets(false);
    setStatus(`Preset "${preset.label}" chargé`);
  };

  // ─── Zoom controls ─────────────────────────────────────────────────────────

  const zoomIn  = () => jxgBoardRef.current?.zoomIn();
  const zoomOut = () => jxgBoardRef.current?.zoomOut();
  const resetView = () => {
    const b = jxgBoardRef.current;
    if (b) { b.setBoundingBox([-10, 10, 10, -10]); b.update(); }
  };

  // ─── Tool groups ─────────────────────────────────────────────────────────--

  const groups = [
    { key: 'base',     label: 'Navigation' },
    { key: 'create',   label: 'Créer' },
    { key: 'measure',  label: 'Mesurer' },
    { key: 'annotate', label: 'Annoter' },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} style={styles.root}>

      {/* ── Top Bar ── */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <span style={styles.logo}>⬡ Géométrie</span>
          <button style={styles.iconBtn} onClick={resetView} title="Réinitialiser la vue">⌖</button>
          <button style={styles.iconBtn} onClick={zoomIn}  title="Zoom +">+</button>
          <button style={styles.iconBtn} onClick={zoomOut} title="Zoom -">−</button>
          <div style={styles.divider} />
          <button
            style={{ ...styles.iconBtn, ...(showGrid ? styles.active : {}) }}
            onClick={() => setShowGrid(v => !v)} title="Grille"
          >⊞</button>
          <button
            style={{ ...styles.iconBtn, ...(snapGrid ? styles.active : {}) }}
            onClick={() => setSnapGrid(v => !v)} title="Aimantation"
          >⋮</button>
          <div style={styles.divider} />
          <div style={{ position: 'relative' }}>
            <button style={styles.iconBtn} onClick={() => setShowPresets(v => !v)}>✦ Presets</button>
            {showPresets && (
              <div style={styles.dropdown}>
                {PRESETS.map(p => (
                  <div key={p.label} style={styles.dropItem} onClick={() => applyPreset(p)}>{p.label}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.topRight}>
          <span style={styles.meta}>{objectCount} objet{objectCount !== 1 ? 's' : ''}</span>
          <button style={styles.iconBtn} onClick={exportPNG} title="Export PNG">↓ PNG</button>
          <button style={styles.iconBtn} onClick={exportSVG} title="Export SVG">↓ SVG</button>
          <button
            style={{ ...styles.iconBtn, ...(isFullscreen ? styles.active : {}) }}
            onClick={toggleFullscreen} title="Plein écran"
          >{isFullscreen ? '⊡' : '⊞'} Plein écran</button>
          <button style={{ ...styles.iconBtn, ...styles.dangerBtn }} onClick={clearBoard}>✕ Effacer</button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={styles.main}>

        {/* ── Left Toolbar ── */}
        <div style={styles.sidebar}>
          {groups.map(g => (
            <div key={g.key}>
              <div style={styles.groupLabel}>{g.label}</div>
              {TOOLS.filter(t => t.group === g.key).map(t => (
                <button
                  key={t.id}
                  style={{ ...styles.toolBtn, ...(tool === t.id ? styles.toolActive : {}) }}
                  onClick={() => handleSetTool(t.id)}
                  title={t.label}
                >
                  <span style={styles.toolIcon}>{t.icon}</span>
                  <span style={styles.toolLabel}>{t.label}</span>
                </button>
              ))}
            </div>
          ))}

          {/* Color picker */}
          <div style={styles.groupLabel}>Couleur</div>
          <div style={styles.colorGrid}>
            {COLORS.map(c => (
              <div
                key={c}
                style={{ ...styles.colorDot, background: c, ...(color === c ? styles.colorActive : {}) }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            style={styles.colorInput} title="Couleur personnalisée" />

          {/* Stroke width */}
          <div style={styles.groupLabel}>Épaisseur</div>
          <input type="range" min="1" max="8" value={strokeWidth}
            onChange={e => setStrokeWidth(Number(e.target.value))}
            style={styles.slider} />
          <div style={styles.sliderVal}>{strokeWidth}px</div>

          {/* Fill opacity */}
          <div style={styles.groupLabel}>Opacité remplissage</div>
          <input type="range" min="0" max="100" value={Math.round(fillOpacity * 100)}
            onChange={e => setFillOpacity(Number(e.target.value) / 100)}
            style={styles.slider} />
          <div style={styles.sliderVal}>{Math.round(fillOpacity * 100)}%</div>
        </div>

        {/* ── Canvas ── */}
        <div ref={boardRef} style={styles.canvas}>
          {!loaded && (
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <span>Chargement de JSXGraph…</span>
            </div>
          )}
          <div id="jxg-board" style={{ width: '100%', height: '100%', display: loaded ? 'block' : 'none' }} />
        </div>

        {/* ── Right Panel ── */}
        <div style={styles.rightPanel}>

          {/* Function panel */}
          <div style={styles.panelSection}>
            <div style={styles.panelTitle}>∫ Fonctions</div>
            <div style={styles.panelHint}>Utilisez <code style={styles.code}>x</code> comme variable<br/>et les fonctions JS : <code style={styles.code}>Math.sin(x)</code></div>
            <textarea
              style={styles.fnInput}
              value={fnExpr}
              onChange={e => setFnExpr(e.target.value)}
              placeholder="ex: Math.sin(x) * 2"
              rows={3}
            />
            <div style={styles.fnExamples}>
              {['Math.sin(x)', 'x*x', '2*x+1', 'Math.sqrt(Math.abs(x))', 'Math.exp(-x*x/2)'].map(ex => (
                <span key={ex} style={styles.exampleTag} onClick={() => setFnExpr(ex)}>{ex}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
              <label style={styles.panelHint}>Couleur :</label>
              <input type="color" value={fnColor} onChange={e => setFnColor(e.target.value)} style={{ width: 32, height: 24 }} />
            </div>
            <button style={styles.plotBtn} onClick={plotFunction}>Tracer la courbe</button>
          </div>

          {/* Text panel */}
          <div style={styles.panelSection}>
            <div style={styles.panelTitle}>T Texte / Labels</div>
            <input
              style={styles.textInput}
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
              placeholder="Votre texte…"
              onKeyDown={e => e.key === 'Enter' && addText()}
            />
            <button style={styles.plotBtn} onClick={addText}>Ajouter le texte</button>
          </div>

          {/* Shortcuts */}
          <div style={styles.panelSection}>
            <div style={styles.panelTitle}>⌨ Raccourcis</div>
            <div style={styles.shortcut}><kbd style={styles.kbd}>Entrée</kbd> Fermer polygone</div>
            <div style={styles.shortcut}><kbd style={styles.kbd}>Échap</kbd> Annuler action</div>
            <div style={styles.shortcut}><kbd style={styles.kbd}>Molette</kbd> Zoom</div>
            <div style={styles.shortcut}><kbd style={styles.kbd}>Shift + Drag</kbd> Déplacer vue</div>
          </div>

          {/* Tips */}
          <div style={styles.panelSection}>
            <div style={styles.panelTitle}>💡 Aide</div>
            <div style={styles.panelHint}>
              Le triangle affiche automatiquement ses 3 angles.<br /><br />
              Les points créés sont <strong>draggables</strong> — les formes se mettent à jour en temps réel.<br /><br />
              Glissez les presets pour explorer des figures classiques.
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div style={styles.statusBar}>
        <span style={styles.statusTool}>Outil : <strong>{TOOLS.find(t => t.id === tool)?.label}</strong></span>
        <span style={styles.statusMsg}>{status}</span>
        {snapGrid && <span style={styles.badge}>⊞ Aimantation</span>}
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────--

const C = {
  bg:       '#0f1117',
  surface:  '#1a1d27',
  panel:    '#141720',
  border:   '#2a2d3d',
  accent:   '#4f8ef7',
  accentL:  '#6ba3ff',
  text:     '#e8eaf0',
  muted:    '#7a7f99',
  danger:   '#e74c3c',
  success:  '#2ecc71',
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex', flexDirection: 'column',
    width: '100%', height: '100vh',
    background: C.bg, color: C.text,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    fontSize: 13, userSelect: 'none',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 12px', height: 44,
    background: C.surface, borderBottom: `1px solid ${C.border}`,
    flexShrink: 0, gap: 8,
  },
  topLeft:  { display: 'flex', alignItems: 'center', gap: 4 },
  topRight: { display: 'flex', alignItems: 'center', gap: 4 },
  logo: { fontWeight: 700, fontSize: 15, color: C.accentL, marginRight: 8, letterSpacing: '-0.3px' },
  iconBtn: {
    background: 'transparent', border: `1px solid ${C.border}`,
    borderRadius: 6, padding: '4px 10px', color: C.text,
    cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
    transition: 'all .15s',
  } as React.CSSProperties,
  iconBtnHover: {
    background: C.border,
  } as React.CSSProperties,
  active:    { background: C.accent + '33', borderColor: C.accent, color: C.accentL },
  dangerBtn: { color: C.danger, borderColor: C.danger + '55' },
  divider:   { width: 1, height: 24, background: C.border, margin: '0 4px' },
  meta:      { color: C.muted, fontSize: 11, marginRight: 4 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, zIndex: 99,
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '4px 0', minWidth: 220, marginTop: 4,
    boxShadow: '0 8px 24px #00000066',
  },
  dropItem: {
    padding: '8px 14px', cursor: 'pointer', fontSize: 13,
    transition: 'background .1s',
  } as React.CSSProperties,
  dropItemHover: {
    background: C.border,
  } as React.CSSProperties,
  main: { display: 'flex', flex: 1, overflow: 'hidden' },

  sidebar: {
    width: 160, background: C.panel,
    borderRight: `1px solid ${C.border}`,
    overflowY: 'auto', padding: '8px 6px',
    display: 'flex', flexDirection: 'column', gap: 2,
    flexShrink: 0,
  },
  groupLabel: {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
    color: C.muted, textTransform: 'uppercase',
    padding: '10px 6px 4px',
  },
  toolBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 8px', borderRadius: 6,
    border: 'none', background: 'transparent',
    color: C.text, cursor: 'pointer', width: '100%', textAlign: 'left',
    transition: 'all .12s', fontSize: 12,
  } as React.CSSProperties,
  toolBtnHover: {
    background: C.border,
  } as React.CSSProperties,
  toolActive: { background: C.accent + '25', color: C.accentL },
  toolIcon:   { fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 },
  toolLabel:  { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  colorGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: '4px 2px' },
  colorDot: { width: 20, height: 20, borderRadius: 4, cursor: 'pointer', border: '2px solid transparent', transition: 'all .12s' },
  colorActive: { border: `2px solid white`, transform: 'scale(1.15)' },
  colorInput: { width: '100%', height: 28, borderRadius: 6, border: `1px solid ${C.border}`, marginTop: 4, cursor: 'pointer', background: 'none' },
  slider: { width: '100%', accentColor: C.accent, margin: '4px 0' },
  sliderVal: { fontSize: 11, color: C.muted, textAlign: 'right' },

  canvas: {
    flex: 1, position: 'relative', overflow: 'hidden',
    background: '#111318',
  },
  loading: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 16, color: C.muted, fontSize: 14,
  },
  spinner: {
    width: 36, height: 36, border: `3px solid ${C.border}`,
    borderTopColor: C.accent, borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  rightPanel: {
    width: 220, background: C.panel,
    borderLeft: `1px solid ${C.border}`,
    overflowY: 'auto', padding: 8,
    display: 'flex', flexDirection: 'column', gap: 4,
    flexShrink: 0,
  },
  panelSection: {
    background: C.surface, borderRadius: 8,
    border: `1px solid ${C.border}`,
    padding: 10, marginBottom: 4,
  },
  panelTitle: { fontWeight: 600, fontSize: 12, color: C.accentL, marginBottom: 8, letterSpacing: '-0.2px' },
  panelHint:  { fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 6 },
  fnInput: {
    width: '100%', background: C.bg, color: C.text,
    border: `1px solid ${C.border}`, borderRadius: 6,
    padding: '6px 8px', fontSize: 12, fontFamily: 'monospace',
    resize: 'vertical', outline: 'none', boxSizing: 'border-box',
  },
  fnExamples: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  exampleTag: {
    background: C.border, borderRadius: 4, padding: '2px 6px',
    fontSize: 10, cursor: 'pointer', color: C.muted, fontFamily: 'monospace',
    transition: 'all .1s',
  } as React.CSSProperties,
  exampleTagHover: {
    background: C.accent + '33',
    color: C.accentL,
  } as React.CSSProperties,
  plotBtn: {
    marginTop: 8, width: '100%', padding: '7px 0',
    background: C.accent, color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
    fontFamily: 'inherit', transition: 'all .12s',
  } as React.CSSProperties,
  plotBtnHover: {
    background: C.accentL,
  } as React.CSSProperties,
  textInput: {
    width: '100%', background: C.bg, color: C.text,
    border: `1px solid ${C.border}`, borderRadius: 6,
    padding: '6px 8px', fontSize: 12, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  shortcut: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: C.muted, marginBottom: 4 },
  kbd: {
    background: C.border, borderRadius: 4, padding: '2px 6px',
    fontSize: 10, color: C.text, fontFamily: 'monospace',
  },
  code: { background: C.border, borderRadius: 3, padding: '0 4px', fontFamily: 'monospace', fontSize: 10 },

  statusBar: {
    height: 28, background: C.surface, borderTop: `1px solid ${C.border}`,
    display: 'flex', alignItems: 'center', padding: '0 12px', gap: 16,
    fontSize: 11, color: C.muted, flexShrink: 0,
  },
  statusTool: { color: C.text },
  statusMsg:  { flex: 1, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: { background: C.accent + '22', color: C.accentL, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 600 },
};
