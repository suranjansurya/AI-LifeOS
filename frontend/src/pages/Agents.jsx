import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  getAgentDirectory,
  routeUserRequestToAgents,
  executeAgentMultiWorkflow
} from '../services/agentOrchestratorService';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Users,
  Check,
  X,
  History,
  ArrowRight,
  RotateCcw,
  Sliders,
  Layers,
  Zap,
  Activity
} from 'lucide-react';

export const Agents = () => {
  const navigate = useNavigate();
  const { addTask, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('orchestrator'); // 'orchestrator' | 'directory' | 'approvals' | 'history'
  const [agentsList, setAgentsList] = useState(getAgentDirectory());

  // Orchestrator Query State
  const [userQuery, setUserQuery] = useState('Help me plan my DBMS revision and college project');
  const [routedWorkflow, setRoutedWorkflow] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);

  // Agent Approvals Queue
  const [agentApprovals, setAgentApprovals] = useState([
    {
      id: 'app-agent-1',
      agentName: 'Task Agent',
      action: 'Create 2 proposed tasks for DBMS revision',
      details: 'Task 1: Solve SQL Joins • Task 2: 3NF Normalization Quiz',
      reason: 'Part of approved study roadmap'
    },
    {
      id: 'app-agent-2',
      agentName: 'Calendar Agent',
      action: 'Schedule 45m focus sprint for tomorrow 8 PM',
      details: 'Event: Evening Focus Sprint (DBMS)',
      reason: 'Matches peak focus window preference'
    }
  ]);

  // Agent Run History Log
  const [runHistory, setRunHistory] = useState([
    { id: 'run-1', date: 'Today 10:30 AM', goal: 'DBMS Study Roadmap', primaryAgent: 'Study Agent', status: 'Completed', actionsCount: 3 },
    { id: 'run-2', date: 'Aug 30', goal: 'AI-LifeOS Architecture Planning', primaryAgent: 'Planner Agent', status: 'Completed', actionsCount: 4 }
  ]);

  // Route Request to Agents
  const handleRouteRequest = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    const routed = routeUserRequestToAgents(userQuery);
    setRoutedWorkflow(routed);
    showToast(`Routed to ${routed.primaryAgent.name} with ${routed.collaborators.length} collaborator agents!`, 'info');
  };

  // Run Multi-Agent Workflow
  const handleRunWorkflow = () => {
    if (!routedWorkflow) return;
    const res = executeAgentMultiWorkflow(routedWorkflow);
    setExecutionResult(res);
    setRunHistory(prev => [
      {
        id: res.runId,
        date: 'Just Now',
        goal: routedWorkflow.intent,
        primaryAgent: routedWorkflow.primaryAgent.name,
        status: 'Completed',
        actionsCount: res.completedActions
      },
      ...prev
    ]);
    showToast('Executed and verified multi-agent workflow!', 'success');
  };

  // Toggle Agent Enable / Disable
  const handleToggleAgent = (agentId) => {
    setAgentsList(prev => prev.map(a => {
      if (a.id === agentId) {
        return { ...a, enabled: !a.enabled };
      }
      return a;
    }));
    showToast('Updated agent status.', 'info');
  };

  // Approve Agent Action
  const handleApproveAgentAction = (id) => {
    setAgentApprovals(prev => prev.filter(a => a.id !== id));
    showToast('Approved agent action.', 'success');
  };

  // Batch Approve All
  const handleBatchApproveAll = () => {
    setAgentApprovals([]);
    showToast('Batch approved all pending agent actions!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Agent Orchestrator 3.0"
        subtitle="Multi-agent collaboration hub across 11 specialized agent roles (Planner, Research, Knowledge, Study, Task, Calendar, Project, Focus, Goal, Execution, Report) with approval gates."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('approvals')}
              className="relative px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Pending Approvals ({agentApprovals.length})</span>
            </button>
          </div>
        }
      />

      {/* PRIVACY & SECURITY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Approval Gate Security: Agents can only perform read actions automatically. Record creation or modification strictly requires explicit user approval.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'orchestrator', label: 'Multi-Agent Orchestrator', icon: Sparkles },
          { id: 'directory', label: `Agent Directory (${agentsList.length})`, icon: Users },
          { id: 'approvals', label: `Approval Gate (${agentApprovals.length})`, icon: ShieldAlert },
          { id: 'history', label: `Run History (${runHistory.length})`, icon: History }
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

      {/* TAB 1: MULTI-AGENT ORCHESTRATOR */}
      {activeTab === 'orchestrator' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Multi-Agent Workflow Orchestrator
            </h3>

            <form onSubmit={handleRouteRequest} className="flex gap-2 text-xs">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder='e.g., "Help me plan my college project and revision schedule"'
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none font-medium"
              />
              <Button type="submit" variant="ai" size="sm">Route to Agents</Button>
            </form>
          </div>

          {/* ROUTED AGENT WORKFLOW RESULT */}
          {routedWorkflow && (
            <div className="card-panel p-6 space-y-5 border-indigo-500/30 bg-zinc-950">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">{routedWorkflow.intent}</h4>
                  <p className="text-xs text-zinc-400">Primary: <strong className="text-indigo-300">{routedWorkflow.primaryAgent.name}</strong></p>
                </div>
                <Badge variant="primary" size="sm">Multi-Agent Handoff Active</Badge>
              </div>

              {/* COLLABORATOR AGENTS LIST */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-zinc-300 uppercase text-[10px] tracking-wider block">COLLABORATING AGENTS</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
                    <span className="font-bold text-indigo-300 block">{routedWorkflow.primaryAgent.name}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{routedWorkflow.primaryAgent.purpose}</span>
                  </div>
                  {routedWorkflow.collaborators.map(c => (
                    <div key={c.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="font-bold text-zinc-200 block">{c.name}</span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">{c.purpose}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WORKFLOW STEPS */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">WORKFLOW HANDOFF STEPS</span>
                {routedWorkflow.workflowSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-zinc-300 font-mono">
                    <span className="text-indigo-400 font-bold">#{idx + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="ai" size="sm" onClick={handleRunWorkflow} icon={Play}>
                  Execute & Verify Agent Workflow
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AGENT DIRECTORY (11 ROLES) */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agentsList.map(agent => (
            <div key={agent.id} className="card-panel p-5 card-hover space-y-3 flex flex-col justify-between border-zinc-800">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="primary" size="sm">{agent.role}</Badge>
                  <button
                    onClick={() => handleToggleAgent(agent.id)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border cursor-pointer ${
                      agent.enabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}
                  >
                    {agent.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>

                <h4 className="text-sm font-bold text-zinc-100">{agent.name}</h4>
                <p className="text-xs text-zinc-400 mt-1">{agent.purpose}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono">
                Permissions: {agent.permissions.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: APPROVAL GATE */}
      {activeTab === 'approvals' && (
        <div className="card-panel p-6 space-y-4 border-amber-500/40 bg-zinc-950">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-amber-300">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold text-zinc-100">Agent Action Approval Gate</h3>
            </div>

            {agentApprovals.length > 0 && (
              <Button variant="ai" size="xs" onClick={handleBatchApproveAll} icon={Check}>
                Batch Approve All
              </Button>
            )}
          </div>

          {agentApprovals.length > 0 ? (
            <div className="space-y-3 text-xs">
              {agentApprovals.map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-indigo-300 block">{item.agentName}</span>
                    <h4 className="font-bold text-zinc-100 mt-0.5">{item.action}</h4>
                    <p className="text-[11px] text-zinc-400 mt-1">{item.details}</p>
                    <span className="text-[10px] text-amber-400 font-mono block mt-1">Reason: {item.reason}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="success" size="xs" onClick={() => handleApproveAgentAction(item.id)} icon={Check}>
                      Approve
                    </Button>
                    <Button variant="danger" size="xs" onClick={() => setAgentApprovals(prev => prev.filter(a => a.id !== item.id))} icon={X}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p>No agent actions waiting for approval.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RUN HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="card-panel p-5 space-y-3 bg-zinc-950 border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Multi-Agent Execution Run History
          </h3>

          <div className="divide-y divide-zinc-800 text-xs">
            {runHistory.map(run => (
              <div key={run.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-500">{run.date}</span>
                    <span className="font-bold text-zinc-100">{run.goal}</span>
                  </div>
                  <span className="text-[11px] text-indigo-300 font-mono mt-0.5 block">Primary Agent: {run.primaryAgent} • Actions: {run.actionsCount}</span>
                </div>
                <Badge variant="success" size="sm">{run.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
