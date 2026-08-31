import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { getResearchOverviewAi, generateAiResearchReportClient } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  FileText,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Globe,
  Layers,
  ArrowRight,
  ShieldCheck,
  X,
  Copy,
  Brain,
  Link as LinkIcon,
  ListFilter
} from 'lucide-react';

export const Research = () => {
  const navigate = useNavigate();
  const { notes, projects, goals, showToast } = useApp();

  const [researchProjects, setResearchProjects] = useState([
    {
      id: 'rsch-1',
      title: 'AI Personal Assistant Architecture',
      description: 'Multi-agent orchestration, context minimization, and RLS security enforcement.',
      researchQuestion: 'How should an AI personal assistant coordinate multiple specialized agents?',
      category: 'AI & Systems',
      progress: 65,
      sourcesCount: 4,
      notesCount: 6,
      lastUpdated: 'Aug 24, 2026'
    },
    {
      id: 'rsch-2',
      title: 'Relational Database Indexing & RLS',
      description: 'B-Tree indexing performance and Supabase security policies.',
      researchQuestion: 'How does Row Level Security impact query performance under scale?',
      category: 'Database Systems',
      progress: 80,
      sourcesCount: 2,
      notesCount: 4,
      lastUpdated: 'Aug 22, 2026'
    }
  ]);

  const [sources, setSources] = useState([
    {
      id: 'src-1',
      researchId: 'rsch-1',
      title: 'Multi-Agent Orchestration Patterns (2026)',
      url: 'https://arxiv.org/abs/2608.0192',
      author: 'Dr. Aris Thorne',
      publisher: 'IEEE Systems',
      type: 'Paper',
      verifiedStatus: 'User Verified'
    },
    {
      id: 'src-2',
      researchId: 'rsch-1',
      title: 'Context Minimization & Router Intent Detection',
      url: 'https://ai.google.dev/docs/routers',
      author: 'DeepMind Team',
      publisher: 'Google AI',
      type: 'Documentation',
      verifiedStatus: 'Unverified'
    }
  ]);

  const [overview, setOverview] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportResult, setReportResult] = useState(null);

  // New Research Form
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('AI & Systems');

  // Source Form
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceAuthor, setSourceAuthor] = useState('');
  const [sourceType, setSourceType] = useState('Paper');

  // Compare Sources
  const [sourceA, setSourceA] = useState('src-1');
  const [sourceB, setSourceB] = useState('src-2');

  const fetchOverview = async () => {
    try {
      const res = await getResearchOverviewAi(researchProjects, sources, notes);
      setOverview(res);
    } catch (e) {
      showToast('Error loading research overview.', 'error');
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [researchProjects, sources, notes]);

  const handleCreateResearch = (e) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      showToast('Research title is required.', 'warning');
      return;
    }

    const newRsch = {
      id: `rsch-${Date.now()}`,
      title: titleInput,
      description: descInput,
      researchQuestion: questionInput || 'What are the primary principles of this domain?',
      category: categoryInput,
      progress: 10,
      sourcesCount: 0,
      notesCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setResearchProjects(prev => [...prev, newRsch]);
    showToast(`Research "${titleInput}" created!`, 'success');
    setTitleInput('');
    setDescInput('');
    setQuestionInput('');
    setShowAddModal(false);
  };

  const handleAddSource = (e) => {
    e.preventDefault();
    if (!sourceTitle.trim()) {
      showToast('Source title is required.', 'warning');
      return;
    }

    const newSrc = {
      id: `src-${Date.now()}`,
      researchId: researchProjects[0]?.id || 'rsch-1',
      title: sourceTitle,
      url: sourceUrl || 'Not available',
      author: sourceAuthor || 'Not available',
      publisher: 'Not available',
      type: sourceType,
      verifiedStatus: 'Unverified'
    };

    setSources(prev => [...prev, newSrc]);
    showToast(`Source "${sourceTitle}" added!`, 'success');
    setSourceTitle('');
    setSourceUrl('');
    setSourceAuthor('');
    setShowSourceModal(false);
  };

  const toggleVerifySource = (sourceId) => {
    setSources(prev => prev.map(s => s.id === sourceId ? {
      ...s,
      verifiedStatus: s.verifiedStatus === 'User Verified' ? 'Unverified' : 'User Verified'
    } : s));
    showToast('Source verification updated.', 'info');
  };

  const handleGenerateReport = async () => {
    try {
      const res = await generateAiResearchReportClient(researchProjects[0]?.title || 'AI Assistant Architecture');
      if (res.report) {
        setReportResult(res.report);
        setShowReportModal(true);
      }
    } catch (e) {
      showToast('Error generating research report.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Knowledge & Research Intelligence 2.0"
        subtitle="Organize research questions, verified papers, claims, knowledge topics, source comparisons, and AI reports."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCompareModal(true)} icon={ListFilter}>
              Compare Sources
            </Button>
            <Button variant="ai" size="sm" onClick={handleGenerateReport} icon={Sparkles}>
              Generate Report
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)} icon={Plus}>
              New Research
            </Button>
          </div>
        }
      />

      {/* VERIFICATION DISCLAIMER CALLOUT */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Strict verification mode active. AI-generated insights are clearly identified. Sources require user verification.</span>
        </div>
      </div>

      {/* RESEARCH METRICS DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card-panel p-3.5 border-indigo-500/30">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">ACTIVE RESEARCH</span>
          <span className="text-xl font-black text-indigo-400 font-mono">{overview?.activeCount || 2}</span>
        </div>
        <div className="card-panel p-3.5 border-cyan-500/30">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">SAVED SOURCES</span>
          <span className="text-xl font-black text-cyan-400 font-mono">{overview?.savedSourcesCount || 6}</span>
        </div>
        <div className="card-panel p-3.5 border-purple-500/30">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">DOCUMENTS</span>
          <span className="text-xl font-black text-purple-400 font-mono">{overview?.documentsCount || 4}</span>
        </div>
        <div className="card-panel p-3.5 border-amber-500/30">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">RESEARCH NOTES</span>
          <span className="text-xl font-black text-amber-400 font-mono">{overview?.notesCount || 8}</span>
        </div>
        <div className="card-panel p-3.5 border-emerald-500/30">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TOPICS</span>
          <span className="text-xl font-black text-emerald-400 font-mono">{overview?.topicsCount || 5}</span>
        </div>
        <div className="card-panel p-3.5 border-rose-500/30">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">CLAIMS LOGGED</span>
          <span className="text-xl font-black text-rose-400 font-mono">3</span>
        </div>
      </div>

      {/* CURRENT RESEARCH PROJECTS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">CURRENT RESEARCH WORKSPACE</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {researchProjects.map((r) => (
            <div key={r.id} className="card-panel p-5 space-y-4 border-zinc-800 hover:border-indigo-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-zinc-100">{r.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {r.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{r.description}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">RESEARCH QUESTION</span>
                <p className="text-xs text-zinc-200 font-medium">"{r.researchQuestion}"</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                  <span>Research Progress</span>
                  <span>{r.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${r.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                <span className="font-mono">{r.sourcesCount} Sources • {r.notesCount} Notes</span>
                <Button variant="ghost" size="xs" icon={ArrowRight}>Open Workspace</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOURCES MANAGEMENT & VERIFICATION */}
      <div className="card-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-cyan-400" />
            SAVED SOURCES & VERIFICATION
          </h3>
          <Button variant="outline" size="xs" onClick={() => setShowSourceModal(true)} icon={Plus}>
            Add Source
          </Button>
        </div>

        <div className="space-y-2">
          {sources.map((s) => (
            <div key={s.id} className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-100">{s.title}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-zinc-300">
                    {s.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    s.verifiedStatus === 'User Verified' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {s.verifiedStatus}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">Author: {s.author} • Publisher: {s.publisher}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="xs" onClick={() => toggleVerifySource(s.id)}>
                  {s.verifiedStatus === 'User Verified' ? 'Unverify' : 'Mark as Verified'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW RESEARCH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                New Research Project
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResearch} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Research Title</label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. AI Personal Assistant Architecture"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Research Question</label>
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="How should an AI assistant coordinate agents?"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Category</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                >
                  <option value="AI & Systems">AI & Systems</option>
                  <option value="Database Systems">Database Systems</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Productivity Science">Productivity Science</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Scope, objectives, and initial context..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Create Research</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SOURCE MODAL */}
      {showSourceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-cyan-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                Add Source to Research
              </h3>
              <button onClick={() => setShowSourceModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="e.g. Multi-Agent Orchestration Patterns"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">URL (Optional)</label>
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Author</label>
                  <input
                    type="text"
                    value={sourceAuthor}
                    onChange={(e) => setSourceAuthor(e.target.value)}
                    placeholder="Dr. Aris Thorne"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Type</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                  >
                    <option value="Paper">Paper</option>
                    <option value="Article">Article</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Website">Website</option>
                    <option value="Book">Book</option>
                    <option value="Video">Video</option>
                    <option value="Report">Report</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowSourceModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Source</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPARE SOURCES MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-lg w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-indigo-400" />
                Source Comparison Analysis
              </h3>
              <button onClick={() => setShowCompareModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">SOURCE A</span>
                  <p className="font-bold text-zinc-100">Multi-Agent Orchestration Patterns (2026)</p>
                  <p className="text-zinc-400">Claims: Multi-agent routing protects context windows and prevents token congestion.</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">SOURCE B</span>
                  <p className="font-bold text-zinc-100">Context Minimization & Router Intent Detection</p>
                  <p className="text-zinc-400">Claims: Semantic routers achieve 99.4% intent routing precision when supported by rules.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 space-y-1">
                <span className="text-[10px] text-indigo-400 font-bold uppercase block">COMPARISON SYNTHESIS</span>
                <p>Both sources independently conclude that separating specialized agent execution pipelines is superior to monolithic single-prompt architectures.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowCompareModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* AI RESEARCH REPORT MODAL */}
      {showReportModal && reportResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-2xl w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Research Report
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="border-b border-zinc-800 pb-3">
                <h2 className="text-base font-bold text-zinc-100">{reportResult.title}</h2>
                <p className="text-zinc-400 mt-1"><strong>Research Question</strong>: "{reportResult.researchQuestion}"</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">BACKGROUND</span>
                <p className="text-zinc-300 leading-relaxed">{reportResult.background}</p>
              </div>

              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase block mb-1">KEY FINDINGS</span>
                <ul className="list-disc pl-4 space-y-1 text-zinc-200">
                  {reportResult.keyFindings.map((kf, i) => (
                    <li key={i}>{kf}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">SOURCE COMPARISON</span>
                <p className="text-zinc-300">{reportResult.sourceComparison}</p>
              </div>

              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">REFERENCES & CITATIONS</span>
                <ul className="space-y-1 text-zinc-400 font-mono">
                  {reportResult.references.map((rf, i) => (
                    <li key={i}>{rf}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowReportModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
