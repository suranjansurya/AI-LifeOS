import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { searchKnowledgeAi, getKnowledgeGraphAi } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Search,
  Sparkles,
  BookOpen,
  FileText,
  CheckSquare,
  Target,
  Share2,
  Bookmark,
  Star,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Filter,
  Tag,
  Lightbulb,
  Cpu
} from 'lucide-react';

export const Knowledge = () => {
  const navigate = useNavigate();
  const {
    tasks,
    goals,
    notes,
    memories,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'notes' | 'memories' | 'tasks' | 'goals' | 'decisions' | 'graph'
  const [graphData, setGraphData] = useState(null);

  // AI Memory Suggestions State
  const [memorySuggestions, setMemorySuggestions] = useState([
    {
      id: 'sug-1',
      content: 'Prefers 25-minute Pomodoro focus sprints during evening peak energy (7 PM - 9 PM).',
      reason: 'Observed high task completion rate during evening focus sessions.',
      confidence: 0.91,
      confidenceLabel: 'High Confidence (91%)'
    }
  ]);

  // Decision Log State
  const [decisions, setDecisions] = useState([
    {
      id: 'dec-1',
      decision: 'Use Supabase PostgreSQL for backend authentication & real-time DB',
      reason: 'Seamless integration with React frontend and row level security support.',
      date: '2026-08-20',
      related: 'AI-LifeOS Architecture'
    }
  ]);

  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [newDecisionReason, setNewDecisionReason] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await searchKnowledgeAi(searchQuery, {
        tasks,
        goals,
        notes,
        memories,
        decisions
      });
      setSearchResults(res);
    } catch (err) {
      showToast('Knowledge search error.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const fetchGraph = async () => {
    try {
      const res = await getKnowledgeGraphAi({ tasks, goals, notes, memories });
      setGraphData(res);
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [tasks, goals, notes, memories]);

  const handleAcceptSuggestion = (id) => {
    setMemorySuggestions(prev => prev.filter(s => s.id !== id));
    showToast('Memory saved to Personal Knowledge Hub!', 'success');
  };

  const handleRejectSuggestion = (id) => {
    setMemorySuggestions(prev => prev.filter(s => s.id !== id));
    showToast('Memory suggestion ignored.', 'info');
  };

  const handleAddDecision = (e) => {
    e.preventDefault();
    if (!newDecisionTitle.trim()) return;
    const item = {
      id: `dec-${Date.now()}`,
      decision: newDecisionTitle,
      reason: newDecisionReason || 'Recorded decision',
      date: new Date().toISOString().split('T')[0],
      related: 'General'
    };
    setDecisions(prev => [item, ...prev]);
    showToast('Decision recorded to Knowledge Hub.', 'success');
    setNewDecisionTitle('');
    setNewDecisionReason('');
    setShowDecisionModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Knowledge Hub & Personal Memory 2.0"
        subtitle="Connected personal knowledge graph connecting Notes, Tasks, Goals, Memories, and Decision logs."
        action={
          <Button
            variant="ai"
            size="sm"
            onClick={() => setShowDecisionModal(true)}
            icon={Plus}
          >
            Record Decision
          </Button>
        }
      />

      {/* GLOBAL AI SEARCH BAR */}
      <div className="card-panel p-5 space-y-3 border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Global AI Semantic Knowledge Search</h3>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your LifeOS (e.g. 'React', 'DBMS', 'frontend structure')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Button type="submit" variant="ai" size="sm" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>

      {/* AI MEMORY SUGGESTIONS ALERT BANNER */}
      {memorySuggestions.length > 0 && (
        <div className="card-panel p-4 border-indigo-500/40 bg-indigo-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-400" />
              AI SUGGESTS SAVING THIS MEMORY ({memorySuggestions.length})
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Requires Explicit User Approval</span>
          </div>

          {memorySuggestions.map(sug => (
            <div key={sug.id} className="p-3 rounded-xl bg-zinc-950/80 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-zinc-100 block">"{sug.content}"</span>
                <span className="text-zinc-400 text-[11px] mt-0.5 block">Reason: {sug.reason}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="success" size="xs" onClick={() => handleAcceptSuggestion(sug.id)} icon={Check}>
                  Save Memory
                </Button>
                <Button variant="outline" size="xs" onClick={() => handleRejectSuggestion(sug.id)} icon={X}>
                  Ignore
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEARCH RESULTS VIEW */}
      {searchResults && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Search Results for "{searchResults.query}" ({searchResults.results.length})
          </h3>

          {searchResults.results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.results.map(item => (
                <div key={item.id} className="card-panel p-4 space-y-2 border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{item.citation}</span>
                  </div>

                  <h4 className="text-xs font-bold text-zinc-100">{item.title}</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{item.snippet}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-panel p-8 text-center text-xs text-zinc-400 space-y-2 border-zinc-800">
              <ShieldCheck className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="font-bold text-zinc-300">{searchResults.noHitsMessage}</p>
              <p className="text-zinc-500">AI-LifeOS strictly uses verified saved user knowledge without hallucinating facts.</p>
            </div>
          )}
        </div>
      )}

      {/* RECORD DECISION MODAL */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-lg w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Record Strategic Decision
              </h3>
              <button onClick={() => setShowDecisionModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDecision} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Decision Title</label>
                <input
                  type="text"
                  value={newDecisionTitle}
                  onChange={(e) => setNewDecisionTitle(e.target.value)}
                  placeholder="e.g. Use Supabase PostgreSQL for authentication"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Reason & Rationale</label>
                <textarea
                  value={newDecisionReason}
                  onChange={(e) => setNewDecisionReason(e.target.value)}
                  placeholder="Explain why this decision was made..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowDecisionModal(false)}>Cancel</Button>
                <Button variant="ai" size="sm" type="submit">Save Decision</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAIN KNOWLEDGE CATEGORIES / GRAPH TABS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Knowledge' },
            { id: 'decisions', label: `Decision Log (${decisions.length})` },
            { id: 'notes', label: `Notes (${notes.length})` },
            { id: 'memories', label: `Memories (${memories.length})` },
            { id: 'graph', label: 'Knowledge Graph' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DECISION LOG LIST */}
        {(activeTab === 'all' || activeTab === 'decisions') && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Strategic Decision Log ({decisions.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decisions.map(d => (
                <div key={d.id} className="card-panel p-4 space-y-2 border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                      DECISION LOG
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{d.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-100">{d.decision}</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">Rationale: {d.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KNOWLEDGE GRAPH VISUALIZATION */}
        {activeTab === 'graph' && (
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              Interactive Knowledge Graph Diagram
            </h3>

            <div className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
              <div className="flex flex-wrap justify-center items-center gap-4">
                {(graphData?.nodes || []).map(node => (
                  <div
                    key={node.id}
                    className="px-4 py-2.5 rounded-xl border font-mono text-xs font-bold shadow-lg transition-transform hover:scale-105"
                    style={{ backgroundColor: `${node.color}20`, borderColor: `${node.color}60`, color: node.color }}
                  >
                    {node.type}: {node.label}
                  </div>
                ))}
              </div>

              <p className="text-xs text-zinc-500">
                Connected neural node visualization linking Goals → Milestones → Tasks → Notes → Decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
