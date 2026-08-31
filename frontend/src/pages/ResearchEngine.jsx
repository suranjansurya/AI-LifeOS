import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  executeAiResearchQuery,
  factCheckClaim,
  saveResearchToKnowledge
} from '../services/researchEngineService2';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Bookmark,
  History,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
  Mic,
  Image as ImageIcon,
  FolderPlus,
  Check,
  X
} from 'lucide-react';

export const ResearchEngine = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('research'); // 'research' | 'sources' | 'factcheck' | 'collections' | 'history'
  const [researchQuery, setResearchQuery] = useState('Compare multi-agent intent routing vs single prompt architecture');
  const [researchMode, setResearchMode] = useState('Deep Research');
  const [explanationStyle, setExplanationStyle] = useState('technical'); // 'technical' | 'beginner'
  const [researchResults, setResearchResults] = useState(null);

  // Fact Check Input State
  const [factCheckInput, setFactCheckInput] = useState('Multi-agent systems improve execution accuracy.');
  const [factCheckResult, setFactCheckResult] = useState(null);

  // Collections
  const [collections, setCollections] = useState([
    { id: 'col-1', name: 'AI Systems Architecture', itemFactor: 4 },
    { id: 'col-2', name: 'DBMS Study & Normalization', itemFactor: 3 }
  ]);

  // History Log
  const [researchHistory, setResearchHistory] = useState([
    { id: 'res-hist-1', date: 'Today 11:15 AM', query: 'Compare multi-agent intent routing vs single prompt', mode: 'Deep Research', status: 'Completed' },
    { id: 'res-hist-2', date: 'Aug 29', query: 'SQL Normalization 1NF 2NF 3NF rules', mode: 'Quick Research', status: 'Completed' }
  ]);

  // Execute Research
  const handleExecuteResearch = (e) => {
    e.preventDefault();
    if (!researchQuery.trim()) return;
    const res = executeAiResearchQuery(researchQuery, researchMode);
    setResearchResults(res);
    setResearchHistory(prev => [
      { id: `res-${Date.now()}`, date: 'Just Now', query: researchQuery, mode: researchMode, status: 'Completed' },
      ...prev
    ]);
    setActiveTab('research');
    showToast('Completed AI research query with verified source citations.', 'success');
  };

  // Run Fact Check
  const handleFactCheck = (e) => {
    e.preventDefault();
    if (!factCheckInput.trim()) return;
    const res = factCheckClaim(factCheckInput);
    setFactCheckResult(res);
    showToast('Fact check evaluation complete.', 'info');
  };

  // Save to Knowledge Engine
  const handleSaveToKnowledge = () => {
    if (!researchResults) return;
    saveResearchToKnowledge(researchResults, collections[0]?.name || 'General');
    showToast('Saved research findings into Knowledge Engine! (Personal Memory remains separate)', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Research & Knowledge Intelligence 3.0"
        subtitle="Deep research query planner, verified source citations, fact extraction, source comparison matrix, beginner vs technical explanation modes, and Knowledge Engine integration."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={() => navigate('/knowledge-engine')} icon={BookOpen}>
              Ask My Knowledge
            </Button>
          </div>
        }
      />

      {/* PRIVACY & TRANSPARENCY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Strict Source Citations: Claims are linked directly to primary/secondary sources. Research facts are kept strictly separate from personal memory.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'research', label: 'Ask AI Research', icon: Search },
          { id: 'sources', label: 'Sources & Citations', icon: FileText },
          { id: 'factcheck', label: 'Fact Check & Conflict Detector', icon: ShieldCheck },
          { id: 'collections', label: `Collections (${collections.length})`, icon: Bookmark },
          { id: 'history', label: `History (${researchHistory.length})`, icon: History }
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

      {/* TAB 1: ASK AI RESEARCH */}
      {activeTab === 'research' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" />
              ASK AI TO RESEARCH
            </h3>

            <form onSubmit={handleExecuteResearch} className="space-y-3 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  placeholder='e.g. "Research the latest multi-agent architecture benchmarks"'
                  className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none font-medium"
                />
                <Button type="submit" variant="ai" size="sm">Start Research</Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-medium">Research Mode:</span>
                  {['Quick Research', 'Deep Research', 'Compare', 'Fact Check'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setResearchMode(mode)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                        researchMode === mode ? 'bg-indigo-600 text-white shadow-sm' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800">
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {researchResults && (
            <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h4 className="text-sm font-bold text-zinc-100">Research Results: "{researchResults.query}"</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExplanationStyle(explanationStyle === 'technical' ? 'beginner' : 'technical')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-zinc-900 text-indigo-300 border border-indigo-500/30 cursor-pointer"
                  >
                    {explanationStyle === 'technical' ? 'Switch to Beginner Mode' : 'Switch to Technical Mode'}
                  </button>

                  <Button variant="outline" size="xs" onClick={handleSaveToKnowledge} icon={Bookmark}>
                    Save to Knowledge
                  </Button>
                </div>
              </div>

              {/* SUMMARY SECTION */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs text-zinc-300">
                <span className="badge-ai px-2 py-0.5 text-[9px] font-bold rounded uppercase">AI SUMMARY</span>
                <p className="text-zinc-100 font-medium">{researchResults.summary}</p>

                <p className="pt-2 text-zinc-200 font-medium">
                  {explanationStyle === 'technical' ? researchResults.technicalExplanation : researchResults.beginnerExplanation}
                </p>
              </div>

              {/* KEY FACTS SECTION */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-zinc-300 uppercase text-[10px] tracking-wider block">VERIFIED KEY FACTS & CITATIONS</span>
                {researchResults.keyFacts.map((kf, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                    <span className="font-bold text-emerald-400">{kf.fact}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Source: {kf.source}</span>
                  </div>
                ))}
              </div>

              {/* RECOMMENDATION */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-xs text-indigo-200 font-medium">
                {researchResults.recommendation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SOURCES & CITATIONS */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Verified Source Collection
            </h3>

            <div className="space-y-3 text-xs">
              {researchResults?.sources ? (
                researchResults.sources.map((s, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-zinc-100 block">{s.title}</span>
                      <span className="text-[10px] text-indigo-300 font-mono">{s.domain} • {s.type}</span>
                    </div>
                    <Badge variant="primary" size="sm">{s.quality}</Badge>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-500">Run a research query to view verified sources.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FACT CHECK & CONFLICT DETECTOR */}
      {activeTab === 'factcheck' && (
        <div className="space-y-6">
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Fact Check Claim Evaluator
            </h3>

            <form onSubmit={handleFactCheck} className="flex gap-2 text-xs">
              <input
                type="text"
                value={factCheckInput}
                onChange={(e) => setFactCheckInput(e.target.value)}
                placeholder='Enter claim to fact check...'
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none font-medium"
              />
              <Button type="submit" variant="ai" size="sm">Fact Check Claim</Button>
            </form>
          </div>

          {factCheckResult && (
            <div className="card-panel p-6 space-y-4 border-indigo-500/30 bg-zinc-950">
              <div className="flex justify-between items-center">
                <Badge variant="success" size="sm">{factCheckResult.verdict}</Badge>
                <span className="text-[10px] text-indigo-300 font-mono font-bold">{factCheckResult.confidence}</span>
              </div>

              <h4 className="text-sm font-bold text-zinc-100">Claim: "{factCheckResult.claim}"</h4>
              <p className="text-xs text-zinc-300 leading-relaxed font-mono">{factCheckResult.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RESEARCH COLLECTIONS */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              Saved Research Collections ({collections.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {collections.map(col => (
                <div key={col.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-100 block">{col.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{col.itemFactor} Saved Research Finding(s)</span>
                  </div>
                  <Badge variant="purple" size="sm">Collection</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HISTORY */}
      {activeTab === 'history' && (
        <div className="card-panel p-5 space-y-3 bg-zinc-950 border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Research Query Audit Trail
          </h3>

          <div className="divide-y divide-zinc-800 text-xs">
            {researchHistory.map(h => (
              <div key={h.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-500">{h.date}</span>
                    <span className="font-bold text-zinc-100">{h.query}</span>
                  </div>
                  <span className="text-[11px] text-indigo-300 font-mono mt-0.5 block">Mode: {h.mode}</span>
                </div>
                <Badge variant="primary" size="sm">{h.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
