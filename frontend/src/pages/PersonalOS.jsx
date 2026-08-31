import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  routeUserIntent,
  getSystemHealthStatus
} from '../services/personalOsService';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Sparkles,
  ShieldCheck,
  Play,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Compass,
  Zap,
  Bot,
  Brain,
  Layers,
  History,
  Check,
  X,
  Lock,
  Server
} from 'lucide-react';

export const PersonalOS = () => {
  const navigate = useNavigate();
  const { tasks, goals, projects, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'router' | 'priorities' | 'approvals' | 'status'
  const [intentInput, setIntentInput] = useState('Plan my study schedule for tomorrow');
  const [routedResult, setRoutedResult] = useState(null);

  // System Health Monitor
  const health = getSystemHealthStatus();

  // Unified Approval Center Queue
  const [unifiedApprovals, setUnifiedApprovals] = useState([
    {
      id: 'app-os-1',
      sourceModule: 'Mission Control',
      action: 'Execute Phase 4 Self-Quiz & Final Verification',
      agent: 'Execution Agent',
      reason: 'Prerequisite Phase 3 SQL Joins completed successfully.'
    },
    {
      id: 'app-os-2',
      sourceModule: 'Smart Automation',
      action: 'Move overdue low-priority task to Tomorrow',
      agent: 'Task Agent',
      reason: 'Triggered by Task Overdue event on DBMS Assignment subtask.'
    }
  ]);

  const handleRouteIntent = (e) => {
    e.preventDefault();
    if (!intentInput.trim()) return;
    const res = routeUserIntent(intentInput);
    setRoutedResult(res);
    showToast(`Routed intent to ${res.targetModule}!`, 'info');
  };

  const handleLaunchTargetModule = (path) => {
    navigate(path);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Personal Operating System 2.0"
        subtitle="Unified Operating System integrating Intent Routing, Memory 2.0, Predictive Intelligence, Mission Control, Digital Twin, Smart Automations, and Consolidated Approvals."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={() => navigate('/')} icon={Cpu}>
              Command Center
            </Button>
          </div>
        }
      />

      {/* PRIVACY & SECURITY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Unified Execution Safety: All cross-system actions require explicit user approval. Passwords and credentials remain strictly isolated under Row Level Security.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'pipeline', label: 'AI OS Unified Pipeline', icon: Cpu },
          { id: 'router', label: 'Intent Router', icon: Compass },
          { id: 'priorities', label: 'Next Best Action', icon: Sparkles },
          { id: 'approvals', label: `Unified Approvals (${unifiedApprovals.length})`, icon: ShieldCheck },
          { id: 'status', label: 'System Operational Status', icon: Server }
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

      {/* TAB 1: AI OS UNIFIED PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              AI Personal Operating System Architecture Pipeline
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-bold">
              {['INPUT', 'UNDERSTAND', 'REMEMBER', 'PREDICT', 'PLAN', 'DECIDE', 'EXECUTE', 'VERIFY', 'LEARN'].map((step, idx) => (
                <React.Fragment key={step}>
                  <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-indigo-500/30 text-indigo-300 shadow-md">
                    {step}
                  </div>
                  {idx < 8 && <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />}
                </React.Fragment>
              ))}
            </div>

            <p className="text-xs text-zinc-400 text-center max-w-xl mx-auto">
              Unified operating system loop connecting user intent input to contextual memory retrieval, predictive risk forecasting, multi-agent plan generation, approval gates, execution, and verification.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: INTENT ROUTER */}
      {activeTab === 'router' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              AI Intent Router & Natural Language Controller
            </h3>

            <form onSubmit={handleRouteIntent} className="flex gap-2 text-xs">
              <input
                type="text"
                value={intentInput}
                onChange={(e) => setIntentInput(e.target.value)}
                placeholder='e.g. "Plan my day" or "Simulate my next week"'
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none font-medium"
              />
              <Button type="submit" variant="ai" size="sm">Route Intent</Button>
            </form>
          </div>

          {routedResult && (
            <div className="card-panel p-6 space-y-4 border-indigo-500/30 bg-zinc-950">
              <div className="flex justify-between items-center">
                <Badge variant="primary" size="sm">Routed Target: {routedResult.targetModule}</Badge>
                <span className="text-[10px] text-zinc-400 font-mono">{routedResult.reason}</span>
              </div>

              <h4 className="text-sm font-bold text-zinc-100">Recommended Action: {routedResult.action}</h4>

              <div className="flex justify-end pt-2">
                <Button variant="ai" size="sm" onClick={() => handleLaunchTargetModule(routedResult.targetPath)} icon={Play}>
                  Open {routedResult.targetModule}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NEXT BEST ACTION */}
      {activeTab === 'priorities' && (
        <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Next Best Action Recommendation
            </h3>
            <Badge variant="purple" size="sm">High Priority</Badge>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs text-zinc-300">
            <h4 className="font-bold text-zinc-100 text-sm">DBMS Revision & Normalization Mastery</h4>
            <p>Target exam date is approaching in 24 hours. Recommended to complete 45m focus session on 1NF, 2NF, 3NF rules.</p>
            <span className="text-[10px] text-indigo-300 font-mono block pt-1">WHY THIS? Grounded in 3 active tasks, 1 approaching study deadline, and 85% recent quiz score.</span>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="ai" size="sm" onClick={() => navigate('/focus')} icon={Play}>Start Focus Sprint</Button>
          </div>
        </div>
      )}

      {/* TAB 4: UNIFIED APPROVAL CENTER */}
      {activeTab === 'approvals' && (
        <div className="card-panel p-6 space-y-4 border-amber-500/40 bg-zinc-950">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Unified System Approval Center ({unifiedApprovals.length})
          </h3>

          {unifiedApprovals.length > 0 ? (
            <div className="space-y-3 text-xs">
              {unifiedApprovals.map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-amber-300 font-mono font-bold block">{item.sourceModule}</span>
                    <h4 className="font-bold text-zinc-100 mt-0.5">{item.action}</h4>
                    <span className="text-[10px] text-zinc-400 font-mono block mt-1">Reason: {item.reason}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="success" size="xs" onClick={() => { setUnifiedApprovals(prev => prev.filter(a => a.id !== item.id)); showToast('Approved cross-system action.', 'success'); }} icon={Check}>
                      Approve
                    </Button>
                    <Button variant="danger" size="xs" onClick={() => setUnifiedApprovals(prev => prev.filter(a => a.id !== item.id))} icon={X}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              <p>No actions waiting for approval in unified queue.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SYSTEM OPERATIONAL STATUS */}
      {activeTab === 'status' && (
        <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            System Component Operational Health Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-zinc-100 block">Express API Server</span>
                <span className="text-[10px] text-zinc-400">Port 3001 • Latency: {health.apiServer.latency}</span>
              </div>
              <Badge variant="success" size="sm">{health.apiServer.status}</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-zinc-100 block">Database & RLS Engine</span>
                <span className="text-[10px] text-zinc-400">Latency: {health.database.latency}</span>
              </div>
              <Badge variant="success" size="sm">{health.database.status}</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-zinc-100 block">AI Agent Orchestrator</span>
                <span className="text-[10px] text-zinc-400">Active Agents: {health.agentOrchestrator.activeAgents}</span>
              </div>
              <Badge variant="success" size="sm">{health.agentOrchestrator.status}</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-zinc-100 block">Predictive Intelligence Engine</span>
                <span className="text-[10px] text-zinc-400">Data Freshness: {health.predictiveEngine.dataFreshness}</span>
              </div>
              <Badge variant="success" size="sm">{health.predictiveEngine.status}</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
