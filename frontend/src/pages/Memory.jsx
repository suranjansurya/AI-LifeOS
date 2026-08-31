import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Brain,
  Plus,
  Search,
  Trash2,
  Edit2,
  Download,
  Power,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Tag,
  Clock,
  Layers,
  X,
  Eye,
  Sliders,
  History,
  RotateCcw,
  Check
} from 'lucide-react';

export const Memory = () => {
  const {
    memories,
    addMemory,
    updateMemory,
    deleteMemory,
    clearAllMemories,
    preferences,
    updatePreferences,
    showToast
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMemory, setEditingMemory] = useState(null);
  const [viewingMemory, setViewingMemory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isForgetConfirmOpen, setIsForgetConfirmOpen] = useState(false);

  // Settings State
  const [askBeforeSaving, setAskBeforeSaving] = useState(true);
  const [allowAiUseMemory, setAllowAiUseMemory] = useState(true);
  const [autoDeleteTemp, setAutoDeleteTemp] = useState(true);

  // Conflict State
  const [conflictItem, setConflictItem] = useState(null);

  // Form State
  const [formCategory, setFormCategory] = useState('Preferences');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('study, evening');

  const isMemoryEnabled = preferences.aiMemoryEnabled !== false;

  const categoriesList = [
    { id: 'all', label: 'All Memories' },
    { id: 'Preferences', label: 'Preferences' },
    { id: 'Study', label: 'Study' },
    { id: 'Work', label: 'Work' },
    { id: 'Projects', label: 'Projects' },
    { id: 'Goals', label: 'Goals' },
    { id: 'Routines', label: 'Routines' },
    { id: 'AI Preferences', label: 'AI Preferences' },
    { id: 'Other', label: 'Other' }
  ];

  const handleOpenAdd = () => {
    setEditingMemory(null);
    setFormCategory('Preferences');
    setFormContent('');
    setFormTags('productivity, evening');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMemory(m);
    setFormCategory(m.category || 'Preferences');
    setFormContent(m.content || m.value || '');
    setFormTags((m.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSaveMemory = () => {
    if (!formContent.trim()) return;

    // Secret / Password Security Check
    const lower = formContent.toLowerCase();
    if (lower.includes('password') || lower.includes('api_key') || lower.includes('sk-') || lower.includes('secret')) {
      showToast('⚠️ Security Block: Passwords, API keys, and sensitive credentials cannot be stored in AI Memory.', 'error');
      return;
    }

    // Conflict Check: Look for existing memory with opposing preferences
    const existingConflict = memories.find(m => {
      const existingText = (m.content || m.value || '').toLowerCase();
      if (editingMemory && m.id === editingMemory.id) return false;
      return (existingText.includes('concise') && lower.includes('detailed')) ||
             (existingText.includes('detailed') && lower.includes('concise')) ||
             (existingText.includes('morning') && lower.includes('evening')) ||
             (existingText.includes('evening') && lower.includes('morning'));
    });

    if (existingConflict) {
      setConflictItem({ existing: existingConflict, newContent: formContent, category: formCategory });
      return;
    }

    executeSaveMemory(formCategory, formContent, formTags);
  };

  const executeSaveMemory = (cat, content, tagsStr) => {
    const tagsArray = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    if (editingMemory) {
      updateMemory(editingMemory.id, {
        category: cat,
        content: content,
        value: content,
        tags: tagsArray,
        updatedAt: new Date().toISOString()
      });
      showToast('AI Preference Memory updated.', 'success');
    } else {
      addMemory({
        category: cat,
        content: content,
        value: content,
        tags: tagsArray,
        status: 'Approved',
        source: 'User Explicit',
        createdAt: new Date().toISOString().split('T')[0]
      });
      showToast('🧠 Memory saved with user approval!', 'success');
    }

    setIsModalOpen(false);
    setConflictItem(null);
  };

  const handleResolveConflict = (option) => {
    if (!conflictItem) return;

    if (option === 'replace') {
      deleteMemory(conflictItem.existing.id);
      executeSaveMemory(conflictItem.category, conflictItem.newContent, formTags);
      showToast('Replaced conflicting memory with new preference.', 'success');
    } else if (option === 'keepBoth') {
      executeSaveMemory(conflictItem.category, conflictItem.newContent, formTags);
      showToast('Saved both preference memories.', 'info');
    }

    setConflictItem(null);
  };

  const handleExportJson = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: preferences.name || 'AI LifeOS User',
      memories: memories.map(m => ({
        category: m.category || m.type,
        content: m.content || m.value,
        tags: m.tags,
        status: m.status || 'Approved',
        enabled: m.enabled
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-lifeos-memories-${Date.now()}.json`;
    a.click();
    showToast('Downloaded AI Memory JSON export.', 'info');
  };

  const filteredMemories = memories.filter(m => {
    const cat = m.category || m.type || 'Preferences';
    const matchesCat = activeCategory === 'all' || cat.toLowerCase() === activeCategory.toLowerCase();
    const content = (m.content || m.value || '').toLowerCase();
    const matchesQuery = !searchQuery.trim() ||
      content.includes(searchQuery.toLowerCase()) ||
      (m.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Personal Memory & Context Engine 3.0"
        subtitle="User-controlled, privacy-preserving memory workspace. Customize AI preferences, control context retrieval, and manage saved records."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextState = !isMemoryEnabled;
                updatePreferences({ aiMemoryEnabled: nextState });
                showToast(nextState ? 'AI Personal Memory: ON' : 'AI Personal Memory: OFF (Global Switch Active)', 'info');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isMemoryEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              Memory Engine: {isMemoryEnabled ? 'ENABLED' : 'DISABLED'}
            </button>

            <Button variant="outline" size="sm" onClick={handleExportJson} icon={Download}>
              Export JSON
            </Button>

            <Button variant="ai" size="sm" onClick={handleOpenAdd} icon={Plus}>
              Remember Preference
            </Button>
          </div>
        }
      />

      {/* PRIVACY & SECURITY EXPLANATION BANNER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your saved memories are controlled strictly by you under Row Level Security. Passwords, API keys, and private documents are NEVER stored in memory.</span>
        </div>
      </div>

      {/* MEMORY CONTROLS & SETTINGS BAR */}
      <div className="card-panel p-4 space-y-3 bg-zinc-950 border-zinc-800">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-400" />
            MEMORY CONTROLS & AI CONTEXT RETRIEVAL
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">User Approval Required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 cursor-pointer">
            <input
              type="checkbox"
              checked={askBeforeSaving}
              onChange={(e) => setAskBeforeSaving(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-950 border-zinc-700"
            />
            <span className="text-zinc-200 font-medium">Ask Before Saving Memories</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 cursor-pointer">
            <input
              type="checkbox"
              checked={allowAiUseMemory}
              onChange={(e) => setAllowAiUseMemory(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-950 border-zinc-700"
            />
            <span className="text-zinc-200 font-medium">Allow AI to Retrieve Memory</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 cursor-pointer">
            <input
              type="checkbox"
              checked={autoDeleteTemp}
              onChange={(e) => setAutoDeleteTemp(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-950 border-zinc-700"
            />
            <span className="text-zinc-200 font-medium">Auto-purge Temporary Context</span>
          </label>
        </div>
      </div>

      {/* AI MEMORY SUGGESTION BANNER */}
      <div className="card-panel p-5 border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="badge-ai px-2 py-0.5 text-[10px] font-bold rounded uppercase">
                AI MEMORY SUGGESTION (APPROVAL REQUIRED)
              </span>
              <span className="text-[10px] text-zinc-400 font-mono font-bold">Status: Pending Review</span>
            </div>
            <p className="text-xs text-zinc-200">
              "You complete 82% of deep focus work during 7 PM – 9 PM. Would you like me to remember this focus window preference?"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ai"
            size="xs"
            onClick={() => {
              addMemory({
                category: 'Routines',
                content: 'Prefers 7 PM – 9 PM evening focus window for technical deep work',
                value: 'Prefers 7 PM – 9 PM evening focus window for technical deep work',
                tags: ['focus', 'evening'],
                status: 'Approved',
                source: 'AI Suggestion'
              });
              showToast('Saved focus window preference to AI Memory!', 'success');
            }}
            icon={CheckCircle2}
          >
            Save to Memory
          </Button>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categoriesList.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                activeCategory === cat.id
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
            placeholder="Search saved memories..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories.length > 0 ? (
          filteredMemories.map(m => {
            const contentText = m.content || m.value || '';
            const categoryText = m.category || m.type || 'Preferences';
            const statusText = m.status || 'Approved';

            return (
              <div
                key={m.id}
                className={`card-panel p-5 card-hover flex flex-col justify-between space-y-3 border-zinc-800/80 ${
                  m.enabled === false ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="primary" size="sm">
                      {categoryText}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingMemory(m)}
                        className="p-1 text-zinc-500 hover:text-indigo-400 rounded cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          updateMemory(m.id, { enabled: !m.enabled });
                          showToast(`Memory ${!m.enabled ? 'Enabled' : 'Disabled'}.`, 'info');
                        }}
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border cursor-pointer ${
                          m.enabled !== false ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}
                      >
                        {m.enabled !== false ? 'ACTIVE' : 'DISABLED'}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1 text-zinc-500 hover:text-indigo-400 rounded cursor-pointer"
                        title="Edit Memory"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          deleteMemory(m.id);
                          showToast('Forgotten memory.', 'info');
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 rounded cursor-pointer"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-100 font-medium leading-relaxed mb-3">
                    "{contentText}"
                  </p>

                  {(m.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-900 rounded border border-zinc-800">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Status: <strong className="text-indigo-300">{statusText}</strong></span>
                  <span>{new Date(m.createdAt || m.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-zinc-500 space-y-2">
            <Brain className="w-8 h-8 text-zinc-700 mx-auto" />
            <p>Your AI memory is empty or no memories match your search filter.</p>
            <p className="text-[11px] text-zinc-400">Tell AI LifeOS what you'd like it to remember using the button above.</p>
          </div>
        )}
      </div>

      {/* Purge All Button */}
      {memories.length > 0 && (
        <div className="pt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsForgetConfirmOpen(true)}
            icon={Trash2}
          >
            Delete All Memories
          </Button>
        </div>
      )}

      {/* VIEW MEMORY DETAILS MODAL */}
      {viewingMemory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                Memory Record Details
              </h3>
              <button onClick={() => setViewingMemory(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-indigo-400 font-bold uppercase block">MEMORY CONTENT</span>
                <p className="text-zinc-100 font-medium">"{viewingMemory.content || viewingMemory.value}"</p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 block">CATEGORY</span>
                  <span className="text-zinc-200 font-bold">{viewingMemory.category || viewingMemory.type || 'Preferences'}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 block">STATUS</span>
                  <span className="text-emerald-400 font-bold">{viewingMemory.status || 'Approved'}</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] space-y-1">
                <span className="text-zinc-500 block">SOURCE & AUDIT</span>
                <p className="text-zinc-300">Source: {viewingMemory.source || 'User Explicit'}</p>
                <p className="text-zinc-300">Created: {viewingMemory.createdAt || viewingMemory.created_at || '2026-08-20'}</p>
                {viewingMemory.updatedAt && <p className="text-zinc-400 text-[10px]">Last Updated: {viewingMemory.updatedAt}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setViewingMemory(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFLICT DETECTION MODAL */}
      {conflictItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-amber-500/50 bg-zinc-950">
            <div className="flex items-center gap-2 text-amber-400 border-b border-zinc-800 pb-3">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <h3 className="text-sm font-bold text-zinc-100">Conflicting Preference Detected</h3>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-300">The new preference conflicts with an existing saved memory:</p>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">EXISTING MEMORY</span>
                <p className="text-zinc-200">"{conflictItem.existing.content || conflictItem.existing.value}"</p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                <span className="text-[10px] text-indigo-400 font-bold uppercase block">NEW PREFERENCE</span>
                <p className="text-indigo-200">"{conflictItem.newContent}"</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button variant="ai" size="sm" onClick={() => handleResolveConflict('replace')} icon={Check}>
                Replace Existing Memory
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleResolveConflict('keepBoth')}>
                Keep Both Memories
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConflictItem(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Memory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                {editingMemory ? 'Edit Preference Memory' : 'Remember New Preference'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Preferences">Preferences</option>
                  <option value="Study">Study</option>
                  <option value="Work">Work</option>
                  <option value="Projects">Projects</option>
                  <option value="Goals">Goals</option>
                  <option value="Routines">Routines</option>
                  <option value="AI Preferences">AI Preferences</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Memory Content</label>
                <textarea
                  rows={3}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="e.g. Prefers concise explanations with code examples."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="study, evening, planning"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="ai" size="sm" onClick={handleSaveMemory} icon={CheckCircle2}>
                Save Preference
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Forget All Confirmation Modal */}
      {isForgetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <h3 className="text-base font-bold text-zinc-100">Confirm Memory Purge</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Delete all saved memories? This action will permanently remove all {memories.length} saved preference records.
              Tasks, goals, calendar events, and notes will <strong className="text-zinc-100">NOT</strong> be affected.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsForgetConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="ai"
                size="sm"
                onClick={() => {
                  clearAllMemories();
                  setIsForgetConfirmOpen(false);
                  showToast('All AI memories deleted.', 'info');
                }}
              >
                Delete Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
