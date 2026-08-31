import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  detectSystemBottlenecks,
  buildDecisionMatrix,
  generateOptimizationChangePreview
} from '../services/optimizationService';
import { useNavigate } from 'react-router-dom';
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  Play,
  AlertTriangle,
  Check,
  X,
  History,
  Activity,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  TrendingUp,
  Folder
} from 'lucide-react';

export const OptimizationEngine = () => {
  const navigate = useNavigate();
  const { tasks, goals, projects, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bottlenecks' | 'matrix' | 'preview' | 'history'
  const [selectedOption, setSelectedOption] = useState(null);
  const [changePreviewData, setChangePreviewData] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const bottlenecks = detectSystemBottlenecks({ tasks, projects });
  const decisionMatrix = buildDecisionMatrix({ tasks, goals, projects });

  // History Log
  const [optHistory, setOptHistory] = useState([
    { id: 'opt-1', date: 'Today 10:30 AM', optionName: 'Balanced Focus Schedule', outcome: 'Verified 1.5h Focus Logged', status: 'Applied' },
    { id: 'opt-2', date: 'Aug 29', optionName: 'DBMS Mission Milestone Reordering', outcome: 'Completed Stage 3 Early', status: 'Applied' }
  ]);

  const handleSelectOptionForPreview = (opt) => {
    setSelectedOption(opt);
    const prev = generateOptimizationChangePreview(opt);
    setChangePreviewData(prev);
    setActiveTab('preview');
    showToast(`Generated change preview for "${opt.option}"!`, 'info');
  };

  const handleApplyOptimizationPlan = () => {
    setShowApplyModal(false);
    showToast('Applied optimization plan! Changes queued for execution.', 'success');
    setOptHistory(prev => [
      { id: `opt-${Date.now()}`, date: 'Just Now', optionName: selectedOption?.option || 'Optimized Plan', outcome: 'Plan Applied', status: 'Applied' },
      ...prev
    ]);
    navigate('/execution');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Life Optimization & Decision Intelligence 3.0"
        subtitle="Advisory decision intelligence, system bottleneck detection, comparative decision matrices, and Before/After change preview controls."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={() => navigate('/digital-twin')} icon={HelpCircle}>
              Simulate in Digital Twin
            </Button>
          </div>
        }
      />

      {/* PRIVACY & ADVISORY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>User Control Guaranteed: Optimization recommendations are advisory only. No tasks or deadlines are ever modified without your explicit approval.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Optimization Overview', icon: Sliders },
          { id: 'bottlenecks', label: `Bottleneck Radar (${bottlenecks.length})`, icon: AlertTriangle },
          { id: 'matrix', label: 'Comparative Decision Matrix', icon: Activity },
          { id: 'preview', label: 'Change Preview & Apply', icon: Sparkles },
          { id: 'history', label: `History (${optHistory.length})`, icon: History }
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

      {/* TAB 1: OPTIMIZATION OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              LifeOS Optimization Engine Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium">BOTTLENECKS</span>
                <span className="text-lg font-black font-mono text-amber-400 block">{bottlenecks.length}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium">ACTIVE GOALS</span>
                <span className="text-lg font-black font-mono text-zinc-100 block">{goals.length}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium">ACTIVE PROJECTS</span>
                <span className="text-lg font-black font-mono text-zinc-100 block">{projects.length}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium">PENDING TASKS</span>
                <span className="text-lg font-black font-mono text-zinc-100 block">{tasks.filter(t => t.status !== 'Completed').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOTTLENECK RADAR */}
      {activeTab === 'bottlenecks' && (
        <div className="space-y-6">
          <div className="card-panel p-5 space-y-4 border-amber-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Identified System Bottlenecks ({bottlenecks.length})
            </h3>

            <div className="space-y-3 text-xs">
              {bottlenecks.map(b => (
                <div key={b.id} className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-zinc-100 block">{b.problem}</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{b.evidence}</p>
                    <span className="text-[10px] text-amber-300 font-mono block mt-1">Impact: {b.impact} • Resource: {b.relatedResource}</span>
                  </div>

                  <Button variant="ai" size="xs" onClick={() => navigate('/focus')} icon={Play}>
                    {b.suggestedAction}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DECISION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Comparative Multi-Option Decision Matrix
            </h3>

            <div className="space-y-3 text-xs">
              {decisionMatrix.map((opt, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-100 text-sm">{opt.option}</span>
                    <Badge variant={idx === 1 ? 'primary' : 'outline'} size="sm">
                      {idx === 1 ? 'Recommended' : 'Alternative'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-emerald-400 font-bold block">BENEFITS</span>
                      <span className="text-zinc-300">{opt.benefits}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-amber-400 font-bold block">COSTS & RISKS</span>
                      <span className="text-zinc-300">{opt.costs}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-indigo-300 font-bold block">GOAL IMPACT</span>
                      <span className="text-zinc-300">{opt.goalImpact}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" size="xs" onClick={() => navigate('/digital-twin')}>Simulate</Button>
                    <Button variant="ai" size="xs" onClick={() => handleSelectOptionForPreview(opt)} icon={Check}>Select Option</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CHANGE PREVIEW & APPLY */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {changePreviewData ? (
            <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h4 className="text-sm font-bold text-zinc-100">Before / After Change Preview ({changePreviewData.optionName})</h4>
                <Badge variant="primary" size="sm">Approval Gate Active</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/30 space-y-2">
                  <span className="font-bold text-rose-400 uppercase text-[10px] tracking-wider block">BEFORE STATE (Current)</span>
                  <p className="text-zinc-200 font-mono">{changePreviewData.beforeState}</p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                  <span className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider block">AFTER STATE (Proposed)</span>
                  <p className="text-zinc-100 font-mono">{changePreviewData.afterState}</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-mono">Summary: {changePreviewData.impactSummary}</p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setChangePreviewData(null)}>Discard Preview</Button>
                <Button variant="ai" size="sm" onClick={() => setShowApplyModal(true)} icon={Check}>Apply Optimization</Button>
              </div>
            </div>
          ) : (
            <div className="card-panel p-12 text-center text-xs text-zinc-500">
              <p>No option selected for preview. Select an option from Decision Matrix tab.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HISTORY */}
      {activeTab === 'history' && (
        <div className="card-panel p-5 space-y-3 bg-zinc-950 border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Optimization Audit Trail & Outcome History
          </h3>

          <div className="divide-y divide-zinc-800 text-xs">
            {optHistory.map(h => (
              <div key={h.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-500">{h.date}</span>
                    <span className="font-bold text-zinc-100">{h.optionName}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono block mt-0.5">Outcome: {h.outcome}</span>
                </div>
                <Badge variant="success" size="sm">{h.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPLY OPTIMIZATION MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400" />
                Apply Optimization Plan?
              </h3>
              <button onClick={() => setShowApplyModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This will update your active execution backlog with the proposed balanced schedule.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowApplyModal(false)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={handleApplyOptimizationPlan} icon={Check}>Apply Optimization</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
