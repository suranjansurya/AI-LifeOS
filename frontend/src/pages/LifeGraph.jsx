import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { buildLifeGraphNodesAndEdges, searchLifeGraph } from '../services/lifeGraphService';
import {
  Share2,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Trash2,
  CheckSquare,
  Folder,
  Target,
  BookOpen,
  Bookmark,
  Zap,
  Brain,
  Calendar as CalendarIcon,
  X,
  ArrowRight,
  Layers,
  List,
  Eye,
  Check,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export const LifeGraph = () => {
  const {
    tasks,
    goals,
    projects,
    notes,
    memories,
    calendarEvents,
    focusSessions,
    studySubjects,
    showToast
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'list'
  const [selectedNode, setSelectedNode] = useState(null);
  const [customEdges, setCustomEdges] = useState([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDeleteEdgeModal, setShowDeleteEdgeModal] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Form State for Manual Connect
  const [connectSourceId, setConnectSourceId] = useState('');
  const [connectTargetId, setConnectTargetId] = useState('');
  const [connectRelType, setConnectRelType] = useState('relates to');

  const canvasRef = useRef(null);

  // Build Full Life Graph
  const rawGraph = buildLifeGraphNodesAndEdges({
    tasks,
    goals,
    projects,
    notes,
    memories,
    calendarEvents,
    focusSessions,
    studySubjects
  });

  const fullEdges = [...rawGraph.edges, ...customEdges];
  const fullGraph = { nodes: rawGraph.nodes, edges: fullEdges };

  // Filtered Graph
  const searchedGraph = searchLifeGraph(searchQuery, fullGraph);

  const filteredNodes = searchedGraph.nodes.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type.toLowerCase() === activeFilter.toLowerCase();
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = searchedGraph.edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

  // Node Icon Mapping
  const getNodeIcon = (type) => {
    switch (type) {
      case 'PROJECT': return Folder;
      case 'GOAL': return Target;
      case 'TASK': return CheckSquare;
      case 'STUDY': return BookOpen;
      case 'KNOWLEDGE': return Bookmark;
      case 'MEMORY': return Brain;
      case 'FOCUS': return Zap;
      default: return Layers;
    }
  };

  // Node Color Mapping
  const getNodeColor = (type) => {
    switch (type) {
      case 'PROJECT': return 'border-rose-500/40 text-rose-300 bg-rose-950/40';
      case 'GOAL': return 'border-amber-500/40 text-amber-300 bg-amber-950/40';
      case 'TASK': return 'border-indigo-500/40 text-indigo-300 bg-indigo-950/40';
      case 'STUDY': return 'border-purple-500/40 text-purple-300 bg-purple-950/40';
      case 'KNOWLEDGE': return 'border-blue-500/40 text-blue-300 bg-blue-950/40';
      case 'MEMORY': return 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40';
      case 'FOCUS': return 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40';
      default: return 'border-zinc-700 text-zinc-300 bg-zinc-900';
    }
  };

  // 2D Canvas Interactive Graph Visualizer
  useEffect(() => {
    if (viewMode !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Assign positions to nodes in circular layout
    const nodePositions = {};
    const total = filteredNodes.length;
    const radius = Math.min(width, height) * 0.32 * zoomLevel;
    const cx = width / 2;
    const cy = height / 2;

    filteredNodes.forEach((node, idx) => {
      const angle = (idx / (total || 1)) * Math.PI * 2;
      nodePositions[node.id] = {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background atmospheric glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.5);
      bgGrad.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
      bgGrad.addColorStop(1, 'rgba(9, 9, 11, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Edges
      filteredEdges.forEach(edge => {
        const srcPos = nodePositions[edge.source];
        const tgtPos = nodePositions[edge.target];
        if (srcPos && tgtPos) {
          ctx.beginPath();
          ctx.moveTo(srcPos.x, srcPos.y);
          ctx.lineTo(tgtPos.x, tgtPos.y);
          ctx.strokeStyle = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id)
            ? 'rgba(129, 140, 248, 0.8)'
            : 'rgba(99, 102, 241, 0.25)';
          ctx.lineWidth = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id) ? 2 : 1;
          ctx.stroke();
        }
      });

      // Render Nodes
      filteredNodes.forEach(node => {
        const pos = nodePositions[node.id];
        if (!pos) return;

        const isSelected = selectedNode?.id === node.id;
        const nodeRadius = isSelected ? 18 : 14;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#6366f1' : '#1e1b4b';
        ctx.strokeStyle = isSelected ? '#a5b4fc' : '#4338ca';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.fill();
        ctx.stroke();

        // Node Title Label
        ctx.fillStyle = isSelected ? '#ffffff' : '#a1a1aa';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.title.slice(0, 16), pos.x, pos.y + nodeRadius + 12);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [filteredNodes, filteredEdges, selectedNode, viewMode, zoomLevel]);

  // Handle Manual Connection
  const handleSaveConnection = () => {
    if (!connectSourceId || !connectTargetId) return;
    if (connectSourceId === connectTargetId) {
      showToast('Cannot connect an item to itself.', 'error');
      return;
    }

    const newEdge = {
      id: `custom-e-${Date.now()}`,
      source: connectSourceId,
      target: connectTargetId,
      relationship: connectRelType
    };

    setCustomEdges(prev => [...prev, newEdge]);
    showToast('Created custom Life Graph connection!', 'success');
    setShowConnectModal(false);
    setConnectSourceId('');
    setConnectTargetId('');
  };

  const handleRemoveEdge = (edgeId) => {
    setCustomEdges(prev => prev.filter(e => e.id !== edgeId));
    showToast('Removed Life Graph connection.', 'info');
    setShowDeleteEdgeModal(null);
  };

  // Connected Nodes Explorer for selected node
  const directConnections = selectedNode ? filteredEdges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Life Graph & Unified Context Map 3.0"
        subtitle="Visual relationship graph connecting Tasks, Goals, Projects, Study, Knowledge, Memory, and Focus into a unified AI context layer."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'canvas' ? 'list' : 'canvas')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
            >
              {viewMode === 'canvas' ? <List className="w-3.5 h-3.5 text-indigo-400" /> : <Layers className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{viewMode === 'canvas' ? 'List View' : 'Visual Canvas'}</span>
            </button>

            <Button variant="ai" size="sm" onClick={() => setShowConnectModal(true)} icon={Plus}>
              Connect Item
            </Button>
          </div>
        }
      />

      {/* FILTER PILLS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Graph Nodes' },
            { id: 'PROJECT', label: 'Projects' },
            { id: 'GOAL', label: 'Goals' },
            { id: 'TASK', label: 'Tasks' },
            { id: 'STUDY', label: 'Study' },
            { id: 'KNOWLEDGE', label: 'Knowledge' },
            { id: 'MEMORY', label: 'Memory' },
            { id: 'FOCUS', label: 'Focus' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                activeFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Life Graph..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* CANVAS VIEW / ACCESSIBLE LIST VIEW */}
      {viewMode === 'canvas' ? (
        <div className="relative h-[480px] rounded-2xl bg-zinc-950 border border-zinc-800/80 overflow-hidden">
          {/* CANVAS RENDERER */}
          <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* ZOOM & RESET CONTROLS OVERLAY */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => { setZoomLevel(1); setSelectedNode(null); }}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* QUICK NODE INTERACTION OVERLAY CHIPS */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 pointer-events-auto">
            {filteredNodes.slice(0, 10).map(n => {
              const Icon = getNodeIcon(n.type);
              const isSelected = selectedNode?.id === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSelectedNode(isSelected ? null : n)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold backdrop-blur-md border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3 text-indigo-400" />
                  <span>{n.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ACCESSIBLE LIST / TREE VIEW */
        <div className="card-panel p-5 space-y-3 bg-zinc-950 border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <List className="w-4 h-4 text-indigo-400" />
            Accessible Graph Nodes & Edges Directory
          </h3>

          <div className="divide-y divide-zinc-800">
            {filteredNodes.map(n => {
              const Icon = getNodeIcon(n.type);
              const nodeEdges = filteredEdges.filter(e => e.source === n.id || e.target === n.id);
              return (
                <div key={n.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${getNodeColor(n.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-zinc-100 block">{n.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Type: {n.type} • {nodeEdges.length} connections</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="xs" onClick={() => setSelectedNode(n)} icon={Eye}>
                      Explore Node
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SELECTED NODE DETAIL & RELATIONSHIP EXPLORER DRAWER */}
      {selectedNode && (
        <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">{selectedNode.type}</Badge>
              <h3 className="text-sm font-bold text-zinc-100">{selectedNode.title}</h3>
            </div>
            <button onClick={() => setSelectedNode(null)} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">DIRECT RELATIONSHIPS ({directConnections.length})</span>

            {directConnections.length > 0 ? (
              <div className="space-y-2">
                {directConnections.map(edge => {
                  const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                  const otherNode = fullGraph.nodes.find(n => n.id === otherNodeId);
                  if (!otherNode) return null;

                  return (
                    <div key={edge.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 font-mono">{edge.relationship}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-bold text-zinc-100">{otherNode.title}</span>
                      </div>

                      {edge.id.startsWith('custom-e-') && (
                        <button
                          onClick={() => setShowDeleteEdgeModal(edge)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded cursor-pointer"
                          title="Remove Connection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-zinc-500">No direct graph connections found for this node.</p>
            )}
          </div>
        </div>
      )}

      {/* CONNECT ITEM MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                Connect Life Graph Entities
              </h3>
              <button onClick={() => setShowConnectModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Source Entity (From)</label>
                <select
                  value={connectSourceId}
                  onChange={(e) => setConnectSourceId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select Source Item...</option>
                  {fullGraph.nodes.map(n => (
                    <option key={n.id} value={n.id}>[{n.type}] {n.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Relationship Type</label>
                <select
                  value={connectRelType}
                  onChange={(e) => setConnectRelType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="relates to">relates to</option>
                  <option value="belongs to">belongs to</option>
                  <option value="contributes to">contributes to</option>
                  <option value="works on">works on</option>
                  <option value="documents">documents</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Target Entity (To)</label>
                <select
                  value={connectTargetId}
                  onChange={(e) => setConnectTargetId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select Target Item...</option>
                  {fullGraph.nodes.map(n => (
                    <option key={n.id} value={n.id}>[{n.type}] {n.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowConnectModal(false)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={handleSaveConnection} icon={Check}>Save Connection</Button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE CONNECTION CONFIRMATION MODAL */}
      {showDeleteEdgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-rose-500/50 bg-zinc-950">
            <h3 className="text-sm font-bold text-zinc-100">Remove Graph Relationship?</h3>
            <p className="text-xs text-zinc-300">
              This will remove the relationship line between entities. The underlying records will <strong className="text-zinc-100">NOT</strong> be deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteEdgeModal(null)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={() => handleRemoveEdge(showDeleteEdgeModal.id)}>Remove Connection</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
