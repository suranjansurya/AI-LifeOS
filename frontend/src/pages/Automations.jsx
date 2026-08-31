import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { parseAutomationPromptAi, getDefaultAutomations } from '../services/aiService';
import {
  Workflow,
  Sparkles,
  Play,
  Pause,
  Plus,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  History,
  Trash2,
  Edit3,
  X,
  Sliders,
  Check,
  RotateCcw,
  BookOpen,
  Target,
  FileText,
  Calendar as CalendarIcon,
  Flame,
  Power
} from 'lucide-react';

export const Automations = () => {
  const { showToast } = useApp();
  const [automations, setAutomations] = useState(getDefaultAutomations());
  const [nlInput, setNlInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [previewWorkflow, setPreviewWorkflow] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [runNowModal, setRunNowModal] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'paused' | 'suggested' | 'history'

  // Global Pause State
  const [allPaused, setAllPaused] = useState(false);

  // Form State for Manual Visual Builder
  const [builderName, setBuilderName] = useState('');
  const [builderTrigger, setBuilderTrigger] = useState('Every day at 06:00 PM');
  const [builderConditionLogic, setBuilderConditionLogic] = useState('AND');
  const [builderCondition, setBuilderCondition] = useState('Study goal is incomplete');
  const [builderAction, setBuilderAction] = useState('Send study notification reminder');
  const [builderApproval, setBuilderApproval] = useState(false);

  // Pending Approvals State
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'app-1',
      automationName: 'Automated Task Reschedule',
      actionDetails: 'Move overdue low-priority task "DBMS Assignment" to Tomorrow.',
      createdAt: new Date().toISOString()
    }
  ]);

  // Run History Log
  const [runHistory, setRunHistory] = useState([
    { id: 'run-1', time: '08:00 AM', name: 'Smart Daily Planning', trigger: 'TIME_BASED (08:00 AM)', status: 'SUCCESS', result: 'Daily plan generated with 4 tasks.' },
    { id: 'run-2', time: '07:30 PM', name: 'Deadline Risk Protection', trigger: 'EVENT_BASED (Overdue Risk)', status: 'SUCCESS', result: 'Proactive insight surfaced for DBMS task.' },
    { id: 'run-3', time: '09:00 PM', name: 'Automated Task Reschedule', trigger: 'EVENT_BASED (Overdue Task)', status: 'WAITING_APPROVAL', result: 'Awaiting user approval to reschedule.' }
  ]);

  const activeAutomationsList = automations.filter(a => a.status === 'ACTIVE');
  const pausedAutomationsList = automations.filter(a => a.status === 'PAUSED');

  const suggestedAutomations = [
    { id: 'sug-1', name: 'Evening Study Reminder', trigger: 'Every weekday at 7 PM', action: 'Send study notification', reason: 'You study regularly in the evening.' },
    { id: 'sug-2', name: 'Sunday Goal Velocity Review', trigger: 'Every Sunday at 9 PM', action: 'Generate goal report', reason: 'Tracks weekly milestone progress.' }
  ];

  const handleToggleStatus = (id) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        const next = a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        showToast(`Automation "${a.name}" set to ${next}.`, 'info');
        return { ...a, status: next };
      }
      return a;
    }));
  };

  const handlePauseAll = () => {
    const nextState = !allPaused;
    setAllPaused(nextState);
    setAutomations(prev => prev.map(a => ({ ...a, status: nextState ? 'PAUSED' : 'ACTIVE' })));
    showToast(nextState ? 'All automations paused.' : 'All automations resumed.', 'info');
  };

  const handleParseNl = async (e) => {
    e.preventDefault();
    if (!nlInput.trim()) return;
    setParsing(true);
    try {
      const res = await parseAutomationPromptAi(nlInput);
      if (res.automation) {
        setPreviewWorkflow(res.automation);
        setShowBuilder(true);
      }
    } catch (err) {
      showToast('Error parsing natural language workflow.', 'error');
    } finally {
      setParsing(false);
    }
  };

  const handleSavePreview = () => {
    const nameToUse = builderName || previewWorkflow?.name || 'Custom AI Automation';
    const existing = automations.find(a => a.name.toLowerCase() === nameToUse.toLowerCase());

    if (existing && !duplicateWarning) {
      setDuplicateWarning({ existing, nameToUse });
      return;
    }

    const newAuto = previewWorkflow || {
      id: `auto-${Date.now()}`,
      name: nameToUse,
      description: `WHEN ${builderTrigger} IF (${builderConditionLogic}) ${builderCondition} THEN ${builderAction}`,
      status: 'ACTIVE',
      triggerType: 'TIME_BASED',
      triggerConfig: { schedule: builderTrigger },
      conditionConfig: { logic: builderConditionLogic, condition: builderCondition },
      actionConfig: { type: builderAction },
      requiresApproval: builderApproval,
      lastRunAt: null,
      nextRunAt: 'Scheduled'
    };

    setAutomations(prev => [newAuto, ...prev]);
    showToast(`Automation "${newAuto.name}" created & activated!`, 'success');
    setPreviewWorkflow(null);
    setDuplicateWarning(null);
    setShowBuilder(false);
    setNlInput('');
    setBuilderName('');
  };

  const handleRunNow = (auto) => {
    setRunNowModal(auto);
  };

  const executeRunNow = () => {
    if (!runNowModal) return;
    const newLog = {
      id: `run-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: runNowModal.name,
      trigger: 'Manual Run Now',
      status: runNowModal.requiresApproval ? 'WAITING_APPROVAL' : 'SUCCESS',
      result: runNowModal.requiresApproval ? 'Awaiting user approval before execution.' : `Executed action: ${runNowModal.actionConfig?.type || 'Triggered workflow'}`
    };
    setRunHistory(prev => [newLog, ...prev]);
    showToast(`Executed "${runNowModal.name}" immediately!`, 'success');
    setRunNowModal(null);
  };

  const handleApproveAction = (id) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
    showToast('Action approved and executed.', 'success');
    setRunHistory(prev => [
      { id: `run-${Date.now()}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), name: 'Automated Reschedule', trigger: 'User Approval', status: 'SUCCESS', result: 'Task rescheduled to Tomorrow.' },
      ...prev
    ]);
  };

  const handleRejectAction = (id) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
    showToast('Action rejected by user.', 'info');
  };

  const handleApplyTemplate = (tmpl) => {
    const newAuto = {
      id: `auto-tmpl-${Date.now()}`,
      name: tmpl.name,
      description: tmpl.description,
      status: 'ACTIVE',
      triggerType: 'TIME_BASED',
      triggerConfig: { schedule: tmpl.trigger },
      conditionConfig: { condition: tmpl.condition },
      actionConfig: { type: tmpl.action },
      requiresApproval: false,
      lastRunAt: null,
      nextRunAt: 'Scheduled'
    };
    setAutomations(prev => [newAuto, ...prev]);
    showToast(`Template "${tmpl.name}" added to automations!`, 'success');
    setShowTemplatesModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Automation Center 2.0"
        subtitle="Visual workflow builder (WHEN → IF → THEN) with explicit approval controls, duplicate prevention, and automation execution logs."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePauseAll}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                allPaused
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {allPaused ? 'Resume All Automations' : 'Pause All Automations'}
            </button>

            <Button variant="outline" size="sm" onClick={() => setShowTemplatesModal(true)} icon={Workflow}>
              Explore Templates
            </Button>

            <Button variant="ai" size="sm" onClick={() => { setPreviewWorkflow(null); setShowBuilder(true); }} icon={Plus}>
              + New Automation
            </Button>
          </div>
        }
      />

      {/* METRICS STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-panel p-4 flex items-center justify-between border-emerald-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">ACTIVE AUTOMATIONS</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{activeAutomationsList.length}</span>
          </div>
          <Play className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-amber-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">PAUSED AUTOMATIONS</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{pausedAutomationsList.length}</span>
          </div>
          <Pause className="w-6 h-6 text-amber-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-indigo-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">RUNS TODAY</span>
            <span className="text-2xl font-black text-indigo-400 font-mono">{runHistory.length}</span>
          </div>
          <History className="w-6 h-6 text-indigo-400 opacity-60" />
        </div>
      </div>

      {/* NATURAL LANGUAGE WORKFLOW CONVERTER */}
      <div className="card-panel p-5 space-y-3 border-indigo-500/40 bg-gradient-to-r from-indigo-950/30 via-zinc-900 to-zinc-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Natural Language Automation Builder</h3>
        </div>

        <form onSubmit={handleParseNl} className="flex gap-2">
          <input
            type="text"
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            placeholder='e.g., "Every evening remind me to study" or "Every Sunday generate my weekly report"'
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
          <Button type="submit" variant="ai" size="sm" disabled={parsing}>
            {parsing ? 'Converting...' : 'Generate Automation'}
          </Button>
        </form>
      </div>

      {/* PENDING APPROVALS ALERT BANNER */}
      {pendingApprovals.length > 0 && (
        <div className="card-panel p-4 border-amber-500/50 bg-amber-950/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>APPROVAL REQUIRED ({pendingApprovals.length}) — AI Action Waiting Approval</span>
          </div>

          {pendingApprovals.map(item => (
            <div key={item.id} className="p-3 rounded-xl bg-zinc-950/80 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-zinc-100 block">{item.automationName}</span>
                <span className="text-zinc-300 mt-0.5 block">{item.actionDetails}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="success" size="xs" onClick={() => handleApproveAction(item.id)} icon={Check}>
                  Approve Action
                </Button>
                <Button variant="danger" size="xs" onClick={() => handleRejectAction(item.id)} icon={X}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISUAL WORKFLOW BUILDER MODAL */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-2xl w-full p-6 space-y-5 border-indigo-500/50 bg-zinc-950 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-400" />
                Visual Workflow Diagram Builder (WHEN → IF → THEN)
              </h3>
              <button onClick={() => { setShowBuilder(false); setDuplicateWarning(null); }} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center justify-between">
                <span>⚠️ Similar automation "{duplicateWarning.nameToUse}" already exists.</span>
                <div className="flex gap-2">
                  <Button variant="ai" size="xs" onClick={() => handleSavePreview()}>Create Anyway</Button>
                  <Button variant="secondary" size="xs" onClick={() => setDuplicateWarning(null)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Automation Name</label>
                <input
                  type="text"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  placeholder="e.g. Daily Study Reminder"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* NODE FLOW DIAGRAM */}
              <div className="space-y-3">
                {/* NODE 1: WHEN */}
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">WHEN (TRIGGER)</span>
                  <input
                    type="text"
                    value={builderTrigger}
                    onChange={(e) => setBuilderTrigger(e.target.value)}
                    placeholder="e.g. Every day at 06:00 PM"
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100"
                  />
                </div>

                <div className="w-0.5 h-4 bg-indigo-500/40 mx-auto" />

                {/* NODE 2: IF */}
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">IF (CONDITIONS)</span>
                    <select
                      value={builderConditionLogic}
                      onChange={(e) => setBuilderConditionLogic(e.target.value)}
                      className="px-2 py-0.5 bg-zinc-950 border border-purple-500/30 text-[10px] font-bold text-purple-300 rounded"
                    >
                      <option value="AND">AND (All match)</option>
                      <option value="OR">OR (Any match)</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={builderCondition}
                    onChange={(e) => setBuilderCondition(e.target.value)}
                    placeholder="e.g. Study goal incomplete AND No conflicting calendar event"
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100"
                  />
                </div>

                <div className="w-0.5 h-4 bg-purple-500/40 mx-auto" />

                {/* NODE 3: THEN */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">THEN (ACTION)</span>
                  <input
                    type="text"
                    value={builderAction}
                    onChange={(e) => setBuilderAction(e.target.value)}
                    placeholder="e.g. Send study notification reminder"
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100"
                  />

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={builderApproval}
                      onChange={(e) => setBuilderApproval(e.target.checked)}
                      className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-zinc-300 font-medium">Require Approval Before Action Execution</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowBuilder(false)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={handleSavePreview}>Save & Activate Automation</Button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATES MODAL */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-lg w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-400" />
                Preset Automation Templates
              </h3>
              <button onClick={() => setShowTemplatesModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: 'Daily Focus Reminder', description: 'Reminds to start a 25-minute focus session at peak focus window.', trigger: 'Every day at 7 PM', condition: 'No active focus session', action: 'Send focus notification' },
                { name: 'Weekly Goal Review', description: 'Prompts milestone velocity review every Sunday evening.', trigger: 'Every Sunday at 9 PM', condition: 'Goals active', action: 'Generate goal progress summary' },
                { name: 'Weekly Study Report', description: 'Compiles completed study topics and revision progress.', trigger: 'Every Sunday at 8 PM', condition: 'Study records present', action: 'Generate study report' },
                { name: 'Upcoming Deadline Protection', description: 'Surface warning when task due in < 24h.', trigger: 'Task due in 24h', condition: 'Status != Completed', action: 'Create proactive insight' }
              ].map((tmpl, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-100 block">{tmpl.name}</span>
                    <span className="text-[11px] text-zinc-400 block">{tmpl.description}</span>
                  </div>
                  <Button variant="ai" size="xs" onClick={() => handleApplyTemplate(tmpl)}>Add</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RUN NOW CONFIRMATION MODAL */}
      {runNowModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center gap-2 text-indigo-400 border-b border-zinc-800 pb-3">
              <Play className="w-5 h-5 fill-current" />
              <h3 className="text-sm font-bold text-zinc-100">Run Automation Immediately</h3>
            </div>
            <p className="text-xs text-zinc-300">
              This will execute <strong className="text-zinc-100">"{runNowModal.name}"</strong> right now. Action: <span className="font-mono text-indigo-300">{runNowModal.actionConfig?.type || 'Workflow'}</span>.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setRunNowModal(null)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={executeRunNow}>Run Now</Button>
            </div>
          </div>
        </div>
      )}

      {/* TABBED MAIN VIEW: ACTIVE | PAUSED | SUGGESTED | HISTORY */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
          {[
            { id: 'active', label: `Active (${activeAutomationsList.length})`, icon: Play },
            { id: 'paused', label: `Paused (${pausedAutomationsList.length})`, icon: Pause },
            { id: 'suggested', label: `AI Suggested (${suggestedAutomations.length})`, icon: Sparkles },
            { id: 'history', label: `History (${runHistory.length})`, icon: History }
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

        {/* ACTIVE & PAUSED TAB */}
        {(activeTab === 'active' || activeTab === 'paused') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeTab === 'active' ? activeAutomationsList : pausedAutomationsList).map(auto => (
              <div key={auto.id} className="card-panel p-5 card-hover space-y-3 flex flex-col justify-between border-zinc-800">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                      auto.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {auto.status}
                    </span>

                    {auto.requiresApproval && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                        APPROVAL REQUIRED
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-zinc-100">{auto.name}</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed mt-1">{auto.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Trigger:</span>
                    <span className="font-mono text-indigo-300">{auto.triggerType} ({auto.triggerConfig?.schedule || 'Event'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Action:</span>
                    <span className="font-mono text-zinc-200">{auto.actionConfig?.type}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60 text-xs">
                  <button
                    onClick={() => handleRunNow(auto)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 font-bold transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" /> Run Now
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(auto.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        auto.status === 'ACTIVE' ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {auto.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI SUGGESTED TAB */}
        {activeTab === 'suggested' && (
          <div className="space-y-3">
            {suggestedAutomations.map(sug => (
              <div key={sug.id} className="card-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-indigo-500/30">
                <div>
                  <span className="font-bold text-zinc-100 text-xs block">{sug.name}</span>
                  <span className="text-[11px] text-zinc-400 block">Trigger: {sug.trigger} • Action: {sug.action}</span>
                  <span className="text-[10px] text-indigo-300 italic block mt-0.5">Reason: {sug.reason}</span>
                </div>
                <Button
                  variant="ai"
                  size="xs"
                  onClick={() => handleApplyTemplate({ name: sug.name, description: sug.reason, trigger: sug.trigger, condition: 'User activity pattern', action: sug.action })}
                >
                  Create Automation
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="card-panel p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Automation Execution Log History
            </h3>

            <div className="divide-y divide-zinc-800/60">
              {runHistory.map(log => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400">{log.time}</span>
                      <span className="font-bold text-zinc-100">{log.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        log.status === 'WAITING_APPROVAL' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-zinc-400 mt-1">{log.result}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{log.trigger}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
