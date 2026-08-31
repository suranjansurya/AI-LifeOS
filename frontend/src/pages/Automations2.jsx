import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  getDefaultAutomations2,
  getSmartRoutines,
  runDryRunSimulation,
  executeAutomationRun
} from '../services/automationEngineService2';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Sparkles,
  ShieldCheck,
  Play,
  Pause,
  Plus,
  Check,
  X,
  History,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Layers,
  FileText
} from 'lucide-react';

export const Automations2 = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('automations'); // 'automations' | 'routines' | 'builder' | 'dryrun' | 'approvals'
  const [automations, setAutomations] = useState(getDefaultAutomations2());
  const [routines, setRoutines] = useState(getSmartRoutines());
  const [dryRunResult, setDryRunResult] = useState(null);

  // New Workflow Form State
  const [autoName, setAutoName] = useState('Deadline Risk Preparation Sprint');
  const [autoTrigger, setAutoTrigger] = useState('Task Deadline Approach (< 24h)');
  const [autoCondition, setAutoCondition] = useState('Priority == High AND Status != Completed');
  const [autoAction, setAutoAction] = useState('Schedule 45m Focus Sprint');
  const [autoAutonomy, setAutoAutonomy] = useState('Approval Required');

  // Approval Queue
  const [approvalQueue, setApprovalQueue] = useState([
    {
      id: 'app-auto-1',
      name: 'Automated Task Reschedule',
      action: 'Move overdue low-priority task to Tomorrow',
      reason: 'Triggered by Task Overdue event on DBMS Assignment subtask.'
    }
  ]);

  // History Log
  const [runHistory, setRunHistory] = useState([
    { id: 'run-1', date: 'Today 08:00 AM', name: 'Smart Daily Planning Routine', status: 'Success', result: 'Generated Daily Brief' },
    { id: 'run-2', date: 'Yesterday 07:30 PM', name: 'Study & Knowledge Gap Review Routine', status: 'Success', result: 'Prompted Practice Quiz' }
  ]);

  // Handle Create Automation
  const handleCreateAutomation = (e) => {
    e.preventDefault();
    if (!autoName.trim()) return;

    const newRecord = {
      id: `auto-${Date.now()}`,
      name: autoName.trim(),
      description: `Workflow: ${autoAction} on ${autoTrigger}`,
      status: 'Active',
      trigger: autoTrigger,
      condition: autoCondition,
      action: autoAction,
      autonomyMode: autoAutonomy,
      lastRun: 'Never',
      nextRun: 'On Trigger'
    };

    setAutomations(prev => [newRecord, ...prev]);
    showToast(`Created automation "${newRecord.name}"!`, 'success');
    setActiveTab('automations');
  };

  // Toggle Pause / Resume Automation
  const handleTogglePause = (id) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Active' ? 'Paused' : 'Active';
        return { ...a, status: nextStatus };
      }
      return a;
    }));
    showToast('Updated automation status.', 'info');
  };

  // Run Dry Run Test
  const handleRunDryRun = (auto) => {
    const res = runDryRunSimulation(auto || {
      trigger: autoTrigger,
      condition: autoCondition,
      action: autoAction
    });
    setDryRunResult(res);
    setActiveTab('dryrun');
    showToast('Executed dry run simulation in isolated state.', 'info');
  };

  // Run Routine Immediately
  const handleRunRoutine = (r) => {
    showToast(`Executed routine "${r.name}"!`, 'success');
    setRunHistory(prev => [
      { id: `run-${Date.now()}`, date: 'Just Now', name: r.name, status: 'Success', result: 'Executed all routine steps' },
      ...prev
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Command Automation & Smart Routines 3.0"
        subtitle="Visual Trigger-Condition-Action workflow builder, Smart Life Routines (Morning, Study, Weekly), Dry Run simulation mode, and loop protection guards."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={() => setActiveTab('builder')} icon={Plus}>
              New Automation
            </Button>
          </div>
        }
      />

      {/* PRIVACY & SAFETY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Loop Protection Active: Maximum execution depth is 3 layers with automatic cooldown guards. Default autonomy mode is 'Approval Required'.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'automations', label: `Active Workflows (${automations.length})`, icon: Zap },
          { id: 'routines', label: `Smart Routines (${routines.length})`, icon: Layers },
          { id: 'builder', label: 'Workflow Builder', icon: Sparkles },
          { id: 'dryrun', label: 'Dry Run Simulator', icon: Play },
          { id: 'approvals', label: `Approval Queue (${approvalQueue.length})`, icon: ShieldCheck }
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

      {/* TAB 1: ACTIVE AUTOMATIONS */}
      {activeTab === 'automations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map(a => (
            <div key={a.id} className="card-panel p-5 card-hover space-y-3 flex flex-col justify-between border-zinc-800">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant={a.status === 'Active' ? 'primary' : 'outline'} size="sm">{a.status}</Badge>
                  <span className="text-[10px] text-amber-300 font-mono font-bold">{a.autonomyMode}</span>
                </div>

                <h3 className="text-sm font-bold text-zinc-100 mb-1">{a.name}</h3>
                <p className="text-xs text-zinc-400 mb-3">{a.description}</p>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 space-y-1">
                  <div>Trigger: <strong className="text-indigo-300">{a.trigger}</strong></div>
                  <div>Condition: <strong className="text-zinc-200">{a.condition}</strong></div>
                  <div>Action: <strong className="text-emerald-400">{a.action}</strong></div>
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center border-t border-zinc-800 text-xs">
                <span className="text-[10px] text-zinc-500 font-mono">Next: {a.nextRun}</span>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="xs" onClick={() => handleRunDryRun(a)} icon={Play}>
                    Dry Run
                  </Button>
                  <Button variant={a.status === 'Active' ? 'warning' : 'success'} size="xs" onClick={() => handleTogglePause(a.id)}>
                    {a.status === 'Active' ? 'Pause' : 'Activate'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SMART ROUTINES */}
      {activeTab === 'routines' && (
        <div className="space-y-4">
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Pre-Configured Smart LifeOS Routines
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {routines.map(r => (
                <div key={r.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-100 text-sm mb-1">{r.name}</h4>
                    <span className="text-[10px] text-indigo-300 font-mono block mb-3">{r.frequency}</span>

                    <div className="space-y-1.5 text-[11px] text-zinc-300">
                      {r.steps.map((st, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="ai" size="xs" onClick={() => handleRunRoutine(r)} icon={Play} className="w-full mt-2">
                    Run Routine Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORKFLOW BUILDER */}
      {activeTab === 'builder' && (
        <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Visual Workflow Builder (Trigger → Condition → Action)
          </h3>

          <form onSubmit={handleCreateAutomation} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Automation Name</label>
              <input
                type="text"
                value={autoName}
                onChange={(e) => setAutoName(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Trigger</label>
                <select
                  value={autoTrigger}
                  onChange={(e) => setAutoTrigger(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-medium focus:outline-none"
                >
                  {['Every Morning at 8:00 AM', 'Task Deadline Approach (< 24h)', 'Study Session Completed', 'Focus Session Completed', 'Project Status Change'].map(tr => (
                    <option key={tr} value={tr}>{tr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Condition (IF/AND)</label>
                <input
                  type="text"
                  value={autoCondition}
                  onChange={(e) => setAutoCondition(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Action (THEN)</label>
                <select
                  value={autoAction}
                  onChange={(e) => setAutoAction(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-medium focus:outline-none"
                >
                  {['Generate Daily Brief & Task Priorities', 'Schedule 45m Focus Sprint', 'Generate 5-Question Revision Quiz', 'Run Research Agent', 'Send Notification'].map(ac => (
                    <option key={ac} value={ac}>{ac}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => handleRunDryRun()}>Dry Run Test</Button>
              <Button type="submit" variant="ai" size="sm" icon={Plus}>Create Automation</Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: DRY RUN SIMULATOR */}
      {activeTab === 'dryrun' && (
        <div className="space-y-6">
          {dryRunResult ? (
            <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase">
                  {dryRunResult.badge}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Validated Safe</span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs text-zinc-300 font-mono">
                <p className="text-zinc-100">{dryRunResult.triggerEvaluated}</p>
                <p className="text-zinc-100">{dryRunResult.conditionEvaluated}</p>
                <p className="text-emerald-400">{dryRunResult.actionPreview}</p>
                <span className="text-[10px] text-zinc-500 block pt-1">{dryRunResult.outcome}</span>
              </div>
            </div>
          ) : (
            <div className="card-panel p-12 text-center text-xs text-zinc-500">
              <p>No active dry run simulation. Click "Dry Run" on any automation to test.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: APPROVAL QUEUE & HISTORY */}
      {activeTab === 'approvals' && (
        <div className="card-panel p-6 space-y-4 border-amber-500/40 bg-zinc-950">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Automation Action Approvals ({approvalQueue.length})
          </h3>

          {approvalQueue.length > 0 ? (
            <div className="space-y-3 text-xs">
              {approvalQueue.map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-100 block">{item.name}</span>
                    <p className="text-zinc-300">{item.action}</p>
                    <span className="text-[10px] text-zinc-500 font-mono">{item.reason}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="success" size="xs" onClick={() => { setApprovalQueue(prev => prev.filter(a => a.id !== item.id)); showToast('Approved automation action.', 'success'); }} icon={Check}>
                      Approve
                    </Button>
                    <Button variant="danger" size="xs" onClick={() => setApprovalQueue(prev => prev.filter(a => a.id !== item.id))} icon={X}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              <p>No pending automation actions waiting for approval.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
