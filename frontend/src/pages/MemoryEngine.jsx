import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  getDefaultMemories,
  detectMemoryConflicts,
  generatePersonalKnowledgeGraph,
  exportUserMemoryJSON,
  scanForSecretsAndSensitiveData
} from '../services/memoryEngineService2';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Archive,
  RotateCcw,
  Download,
  AlertTriangle,
  Check,
  X,
  Search,
  Share2,
  Lock,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';

export const MemoryEngine = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('memories'); // 'memories' | 'graph' | 'conflicts' | 'archive' | 'privacy'
  const [memories, setMemories] = useState(getDefaultMemories());
  const [archivedMemories, setArchivedMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Explicit Add Memory Form State
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newCategory, setNewCategory] = useState('Preference');
  const [newImportance, setNewImportance] = useState('Normal');

  // Conflict Resolution Modal State
  const [conflictData, setConflictData] = useState(null);
  const [pendingMemoryData, setPendingMemoryData] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Filter Active Memories
  const filteredMemories = memories.filter(m =>
    (m.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Add Explicit Memory
  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    // Security Scanner Check
    const secScan = scanForSecretsAndSensitiveData(newMemoryText);
    if (secScan.isSensitive) {
      showToast(secScan.warning, 'error');
      return;
    }

    // Conflict Check
    const conf = detectMemoryConflicts(newMemoryText, memories);
    if (conf.hasConflict) {
      setConflictData(conf);
      setPendingMemoryData({
        content: newMemoryText.trim(),
        category: newCategory,
        importance: newImportance
      });
      return;
    }

    // Save Memory
    const newRecord = {
      id: `mem-${Date.now()}`,
      content: newMemoryText.trim(),
      category: newCategory,
      importance: newImportance,
      confidence: 'User Saved',
      source: 'Explicit Input',
      usedBy: ['AI Copilot'],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setMemories(prev => [newRecord, ...prev]);
    setNewMemoryText('');
    showToast('Saved explicit memory!', 'success');
  };

  // Resolve Memory Conflict
  const handleResolveConflict = (replaceExisting) => {
    if (!conflictData || !pendingMemoryData) return;

    if (replaceExisting) {
      setMemories(prev => prev.map(m => {
        if (m.id === conflictData.conflictingMemory.id) {
          return {
            ...m,
            content: pendingMemoryData.content,
            category: pendingMemoryData.category,
            importance: pendingMemoryData.importance,
            createdAt: new Date().toISOString().split('T')[0]
          };
        }
        return m;
      }));
      showToast('Replaced conflicting memory with new preference.', 'success');
    } else {
      const newRecord = {
        id: `mem-${Date.now()}`,
        content: pendingMemoryData.content,
        category: pendingMemoryData.category,
        importance: pendingMemoryData.importance,
        confidence: 'User Saved',
        source: 'Explicit Input',
        usedBy: ['AI Copilot'],
        createdAt: new Date().toISOString().split('T')[0]
      };
      setMemories(prev => [newRecord, ...prev]);
      showToast('Saved both memories.', 'info');
    }

    setConflictData(null);
    setPendingMemoryData(null);
    setNewMemoryText('');
  };

  // Archive Memory
  const handleArchiveMemory = (id) => {
    const target = memories.find(m => m.id === id);
    if (!target) return;
    setMemories(prev => prev.filter(m => m.id !== id));
    setArchivedMemories(prev => [target, ...prev]);
    showToast('Archived memory record.', 'info');
  };

  // Restore Memory
  const handleRestoreMemory = (id) => {
    const target = archivedMemories.find(m => m.id === id);
    if (!target) return;
    setArchivedMemories(prev => prev.filter(m => m.id !== id));
    setMemories(prev => [target, ...prev]);
    showToast('Restored memory from archive.', 'success');
  };

  // Delete Memory Permanently
  const handleDeletePermanent = (id) => {
    setArchivedMemories(prev => prev.filter(m => m.id !== id));
    setMemories(prev => prev.filter(m => m.id !== id));
    showToast('Permanently deleted memory.', 'info');
  };

  // Export Memory JSON
  const handleExportMemory = () => {
    exportUserMemoryJSON(memories);
    showToast('Exported memory data as structured JSON file.', 'success');
  };

  const graphData = generatePersonalKnowledgeGraph(memories);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Memory 2.0 & Personal Knowledge Graph"
        subtitle="User-controlled personal memory engine, explicit instructions, conflict resolution, memory export, and interactive Knowledge Graph."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportMemory} icon={Download}>
              Export Memory JSON
            </Button>
          </div>
        }
      />

      {/* PRIVACY & SECURITY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>User Control Guaranteed: Passwords and API secrets are automatically blocked from storage. Memory usage is strictly transparent and editable.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'memories', label: `Active Memories (${memories.length})`, icon: Brain },
          { id: 'graph', label: 'Personal Knowledge Graph', icon: Share2 },
          { id: 'archive', label: `Archived (${archivedMemories.length})`, icon: Archive },
          { id: 'privacy', label: 'Privacy & Data Controls', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACTIVE MEMORIES & EXPLICIT MEMORY INPUT */}
      {activeTab === 'memories' && (
        <div className="space-y-6">
          {/* EXPLICIT MEMORY INPUT FORM */}
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Explicit Memory Input ("Remember this")
            </h3>

            <form onSubmit={handleAddMemory} className="space-y-3 text-xs">
              <input
                type="text"
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder='e.g. "Remember that I prefer concise explanations with bullet points"'
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none font-medium"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400">Category:</span>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none font-medium"
                    >
                      {['Preference', 'Goal Context', 'Workflow Preference', 'Routine', 'Explicit Fact', 'Saved Instruction'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400">Importance:</span>
                    <select
                      value={newImportance}
                      onChange={(e) => setNewImportance(e.target.value)}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none font-medium"
                    >
                      {['Low', 'Normal', 'High'].map(imp => (
                        <option key={imp} value={imp}>{imp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button type="submit" variant="ai" size="sm" icon={Plus}>Save Memory</Button>
              </div>
            </form>
          </div>

          {/* SEARCH MEMORIES */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active memories by keyword or category..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* MEMORY LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map(m => (
              <div key={m.id} className="card-panel p-5 card-hover space-y-3 flex flex-col justify-between border-zinc-800">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="purple" size="sm">{m.category}</Badge>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                      {m.confidence}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-zinc-100 leading-relaxed mb-3">"{m.content}"</p>

                  <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono space-y-0.5">
                    <span>Source: {m.source} • Saved: {m.createdAt}</span>
                    <span className="block">Used by: {(m.usedBy || []).join(', ')}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button variant="outline" size="xs" onClick={() => handleArchiveMemory(m.id)} icon={Archive}>
                    Archive
                  </Button>
                  <Button variant="danger" size="xs" onClick={() => handleDeletePermanent(m.id)} icon={Trash2}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL KNOWLEDGE GRAPH */}
      {activeTab === 'graph' && (
        <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              Personal Knowledge Graph Architecture
            </h3>
            <Badge variant="primary" size="sm">Neural Connections</Badge>
          </div>

          {/* GRAPH VISUALIZER MAP CONTAINER */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 min-h-[320px] flex flex-col justify-center items-center text-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {graphData.nodes.map(n => (
                <div
                  key={n.id}
                  style={{ backgroundColor: `${n.color}20`, borderColor: n.color }}
                  className="px-3.5 py-2 rounded-xl border text-xs font-bold text-zinc-100 flex items-center gap-2 shadow-lg"
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: n.color }} />
                  <span>{n.label}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-400 max-w-md">
              Graph visualizer maps relationships connecting Memory nodes to active Goals, Projects, and Study revision topics.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: ARCHIVED MEMORIES */}
      {activeTab === 'archive' && (
        <div className="card-panel p-5 space-y-4 bg-zinc-950 border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Archive className="w-4 h-4 text-indigo-400" />
            Archived Memory Records ({archivedMemories.length})
          </h3>

          {archivedMemories.length > 0 ? (
            <div className="space-y-3 text-xs">
              {archivedMemories.map(m => (
                <div key={m.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-100 block">"{m.content}"</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Category: {m.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="success" size="xs" onClick={() => handleRestoreMemory(m.id)} icon={RotateCcw}>
                      Restore
                    </Button>
                    <Button variant="danger" size="xs" onClick={() => handleDeletePermanent(m.id)} icon={Trash2}>
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              <Archive className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p>No archived memories.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PRIVACY CONTROLS & DATA EXPORT */}
      {activeTab === 'privacy' && (
        <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            Memory Privacy & Management Controls
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-zinc-100 block">Export All Memory Data</span>
                <span className="text-[11px] text-zinc-400">Download a full JSON backup of all saved memory records.</span>
              </div>
              <Button variant="ai" size="xs" onClick={handleExportMemory} icon={Download}>Export JSON</Button>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex justify-between items-center">
              <div>
                <span className="font-bold text-rose-300 block">Clear All Memory</span>
                <span className="text-[11px] text-zinc-400">Permanently delete memory records. Tasks, goals, and notes will NOT be deleted.</span>
              </div>
              <Button variant="danger" size="xs" onClick={() => setShowClearModal(true)} icon={Trash2}>Clear All Memory</Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFLICT RESOLUTION MODAL */}
      {conflictData && pendingMemoryData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-amber-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Memory Conflict Detected
              </h3>
              <button onClick={() => setConflictData(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-amber-500/30 text-xs space-y-2">
              <p className="text-amber-300 font-bold">{conflictData.message}</p>
              <p className="text-zinc-300">New preference: <strong className="text-zinc-100">"{pendingMemoryData.content}"</strong></p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => handleResolveConflict(false)}>Keep Both</Button>
              <Button variant="ai" size="sm" onClick={() => handleResolveConflict(true)} icon={Check}>Replace Existing</Button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL MEMORY MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-rose-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Clear All Saved Memories?
              </h3>
              <button onClick={() => setShowClearModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This will clear your active and archived memory records. Tasks, goals, notes, and study records will <strong className="text-zinc-100">NOT</strong> be affected.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowClearModal(false)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={() => { setMemories([]); setArchivedMemories([]); setShowClearModal(false); showToast('Cleared all memory records.', 'success'); }}>Clear Memory</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
