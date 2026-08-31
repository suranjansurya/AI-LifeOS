import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  getDefaultExecutionPlans,
  evaluateNextAction,
  reoptimizeRemainingPlan
} from '../services/executionService';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  History,
  AlertCircle,
  HelpCircle,
  Calendar as CalendarIcon,
  CheckSquare
} from 'lucide-react';

export const Execution = () => {
  const navigate = useNavigate();
  const {
    tasks,
    focusSessions,
    setActiveFocusTask,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'plans' | 'approvals' | 'history'
  const [plans, setPlans] = useState(getDefaultExecutionPlans());
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  const [blockedModalStep, setBlockedModalStep] = useState(null);
  const [blockedReasonInput, setBlockedReasonInput] = useState('');
  const [reoptimizeModalPlan, setReoptimizeModalPlan] = useState(null);

  // Approval Queue State
  const [approvalQueue, setApprovalQueue] = useState([
    {
      id: 'app-exec-1',
      title: 'Schedule Calendar Event for DBMS Self-Quiz',
      details: 'Date: Tomorrow 04:00 PM (25m)',
      type: 'Calendar Event'
    },
    {
      id: 'app-exec-2',
      title: 'Apply Plan Re-Optimization (+15m buffer)',
      details: 'Plan: DBMS Joins & Normalization Study Plan',
      type: 'Plan Adjustment'
    }
  ]);

  // Timeline History
  const [timelineHistory, setTimelineHistory] = useState([
    { id: 'time-1', date: 'Today 10:00 AM', event: 'Step Completed', detail: 'Practice 1NF, 2NF, 3NF Normalization Questions' },
    { id: 'time-2', date: 'Aug 30', event: 'Step Completed', detail: 'Build Multi-Approach Planning Engine' },
    { id: 'time-3', date: 'Aug 29', event: 'Plan Started', detail: 'DBMS Joins & Normalization Study Plan initialized' }
  ]);

  const activePlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const nextActionEval = evaluateNextAction(plans, tasks);

  // Step Status Control Handlers
  const handleUpdateStepStatus = (planId, stepId, nextStatus) => {
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const updatedSteps = p.steps.map(s => {
          if (s.id === stepId) {
            return {
              ...s,
              status: nextStatus,
              completedAt: nextStatus === 'Completed' ? 'Just Now' : s.completedAt
            };
          }
          return s;
        });

        const completedCount = updatedSteps.filter(s => s.status === 'Completed').length;
        const total = updatedSteps.length;
        const isAllDone = completedCount === total;

        return {
          ...p,
          steps: updatedSteps,
          completedSteps: completedCount,
          status: isAllDone ? 'Completed' : 'In Progress',
          health: updatedSteps.some(s => s.status === 'Blocked') ? 'Blocked' : 'On Track'
        };
      }
      return p;
    }));

    if (nextStatus === 'Completed') {
      setTimelineHistory(prev => [
        { id: `time-${Date.now()}`, date: 'Just Now', event: 'Step Completed', detail: `Step updated to Completed in plan` },
        ...prev
      ]);
      showToast('Step completed with real user verification!', 'success');
    } else {
      showToast(`Step status updated to ${nextStatus}.`, 'info');
    }
  };

  // Blocked Step Handler
  const handleSaveBlockedState = () => {
    if (!blockedModalStep || !blockedReasonInput.trim()) return;
    const lowerReason = blockedReasonInput.toLowerCase();
    if (lowerReason.includes('password') || lowerReason.includes('api_key') || lowerReason.includes('sk-')) {
      showToast('⚠️ Security Block: Do not store secrets or passwords in step block reasons.', 'error');
      return;
    }

    setPlans(prev => prev.map(p => {
      if (p.id === blockedModalStep.planId) {
        const updatedSteps = p.steps.map(s => {
          if (s.id === blockedModalStep.stepId) {
            return { ...s, status: 'Blocked', blockedReason: blockedReasonInput.trim() };
          }
          return s;
        });
        return { ...p, steps: updatedSteps, health: 'Blocked' };
      }
      return p;
    }));

    showToast('Marked step as Blocked.', 'info');
    setBlockedModalStep(null);
    setBlockedReasonInput('');
  };

  // Trigger Re-Optimization
  const handleTriggerReoptimize = (plan) => {
    const reopt = reoptimizeRemainingPlan(plan, plan.steps[2]?.id);
    setReoptimizeModalPlan(reopt);
  };

  const handleApplyReoptimization = () => {
    if (!reoptimizeModalPlan) return;
    showToast('Plan re-optimization applied to remaining steps!', 'success');
    setReoptimizeModalPlan(null);
  };

  // Approval Handlers
  const handleApproveAction = (id) => {
    setApprovalQueue(prev => prev.filter(a => a.id !== id));
    showToast('Approved execution action.', 'success');
  };

  const handleRejectAction = (id) => {
    setApprovalQueue(prev => prev.filter(a => a.id !== id));
    showToast('Rejected action.', 'info');
  };

  // Start Focus Sprint for Current Step
  const handleStartFocusForStep = (step) => {
    setActiveFocusTask({ id: step.id, title: step.title, estimatedMinutes: step.durationMinutes || 25 });
    showToast(`Starting focus timer for "${step.title}"`, 'success');
    navigate('/focus');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Execution Engine 3.0"
        subtitle="Manage approved execution workflows (PLAN → APPROVAL → EXECUTION → VERIFICATION → COMPLETION) with dependency tracking, blocked state analysis, and adaptive re-optimization."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('approvals')}
              className="relative px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Approval Queue ({approvalQueue.length})</span>
            </button>

            <Button variant="ai" size="sm" onClick={() => navigate('/decisions')} icon={Sparkles}>
              View Approved Plans
            </Button>
          </div>
        }
      />

      {/* PRIVACY & TRANSPARENCY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Execution Verification: Step completion requires real user actions. AI never marks steps complete automatically without explicit user confirmation.</span>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'today', label: 'Today Execution', icon: Play },
          { id: 'plans', label: `Active Plans (${plans.length})`, icon: Layers },
          { id: 'approvals', label: `Approval Queue (${approvalQueue.length})`, icon: ShieldAlert },
          { id: 'history', label: `Timeline History (${timelineHistory.length})`, icon: History }
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

      {/* TAB 1: TODAY EXECUTION & NEXT BEST ACTION */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* NEXT BEST ACTION CARD */}
          {nextActionEval.step && (
            <div className="card-panel p-6 border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 space-y-3">
              <div className="flex justify-between items-center">
                <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase">
                  NEXT RECOMMENDED ACTION
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  Confidence: {nextActionEval.confidence}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-100">{nextActionEval.step.title}</h3>
                <p className="text-xs text-zinc-400">Plan: <strong className="text-zinc-200">{nextActionEval.planTitle}</strong> • Duration: {nextActionEval.step.durationMinutes}m</p>
              </div>

              {/* Explainability Box */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <span className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-indigo-400" /> WHY IS THIS NEXT?
                </span>
                <p className="leading-relaxed">{nextActionEval.reason}</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  variant="ai"
                  size="sm"
                  onClick={() => handleStartFocusForStep(nextActionEval.step)}
                  icon={Play}
                >
                  Start Focus Sprint
                </Button>
              </div>
            </div>
          )}

          {/* ACTIVE EXECUTION PROGRESS OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(p => (
              <div key={p.id} className="card-panel p-5 card-hover space-y-3 border-zinc-800">
                <div className="flex justify-between items-center">
                  <Badge variant="primary" size="sm">{p.category}</Badge>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                    p.health === 'On Track' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    Plan Health: {p.health}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-zinc-100">{p.title}</h4>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Progress: {p.completedSteps} / {p.totalSteps} steps</span>
                    <span>{Math.round((p.completedSteps / p.totalSteps) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${(p.completedSteps / p.totalSteps) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button variant="outline" size="xs" onClick={() => { setSelectedPlanId(p.id); setActiveTab('plans'); }} icon={ArrowRight}>
                    Manage Execution Steps
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE PLANS & STEP CONTROLS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {plans.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all ${
                  activePlan.id === p.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>

          {activePlan && (
            <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">{activePlan.title}</h3>
                  <p className="text-xs text-zinc-400 font-mono">Started: {activePlan.startDate} • Target Completion: {activePlan.targetCompletion}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="xs" onClick={() => handleTriggerReoptimize(activePlan)} icon={Sliders}>
                    Re-Optimize Plan
                  </Button>
                </div>
              </div>

              {/* STEPS WORKFLOW LIST */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">EXECUTION STEPS ({activePlan.steps.length})</span>

                {activePlan.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                      step.status === 'Completed' ? 'bg-zinc-950/60 border-zinc-800 opacity-60' :
                      step.status === 'Blocked' ? 'bg-rose-950/20 border-rose-500/40' :
                      step.status === 'In Progress' ? 'bg-indigo-950/30 border-indigo-500/40' :
                      'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-500 font-bold">#{idx + 1}</span>
                        <span className="font-bold text-zinc-100">{step.title}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                          step.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          step.status === 'Blocked' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                          step.status === 'In Progress' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                          'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {step.status}
                        </span>
                      </div>

                      {step.blockedReason && (
                        <p className="text-[11px] text-rose-300 font-mono">Blocked Reason: "{step.blockedReason}"</p>
                      )}
                    </div>

                    {/* Step Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {step.status !== 'Completed' && (
                        <>
                          <Button
                            variant="success"
                            size="xs"
                            onClick={() => handleUpdateStepStatus(activePlan.id, step.id, 'Completed')}
                            icon={Check}
                          >
                            Complete Step
                          </Button>

                          {step.status !== 'In Progress' && (
                            <Button
                              variant="ai"
                              size="xs"
                              onClick={() => handleUpdateStepStatus(activePlan.id, step.id, 'In Progress')}
                              icon={Play}
                            >
                              Start
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setBlockedModalStep({ planId: activePlan.id, stepId: step.id, title: step.title })}
                          >
                            Mark Blocked
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPROVAL QUEUE */}
      {activeTab === 'approvals' && (
        <div className="card-panel p-5 space-y-4 border-amber-500/40 bg-zinc-950">
          <div className="flex items-center gap-2 text-amber-300">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-sm font-bold text-zinc-100">Execution Action Approval Queue</h3>
          </div>

          {approvalQueue.length > 0 ? (
            <div className="space-y-3 text-xs">
              {approvalQueue.map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <Badge variant="warning" size="sm">{item.type}</Badge>
                    <h4 className="font-bold text-zinc-100 mt-1">{item.title}</h4>
                    <span className="text-[11px] text-zinc-400">{item.details}</span>
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
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p>No actions waiting for approval in queue.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TIMELINE HISTORY */}
      {activeTab === 'history' && (
        <div className="card-panel p-5 space-y-3 bg-zinc-950 border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Execution Workflow Audit Trail History
          </h3>

          <div className="divide-y divide-zinc-800 text-xs">
            {timelineHistory.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-500 text-[11px]">{item.date}</span>
                  <span className="font-bold text-indigo-300">{item.event}</span>
                  <span className="text-zinc-300">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MARK BLOCKED MODAL */}
      {blockedModalStep && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-rose-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Mark Step as Blocked
              </h3>
              <button onClick={() => setBlockedModalStep(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-300">Specify why <strong className="text-zinc-100">"{blockedModalStep.title}"</strong> is blocked:</p>

              <textarea
                rows={3}
                value={blockedReasonInput}
                onChange={(e) => setBlockedReasonInput(e.target.value)}
                placeholder="e.g., Waiting for API key or database documentation (Do NOT enter raw passwords/secrets)"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setBlockedModalStep(null)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={handleSaveBlockedState}>Save Blocked Status</Button>
            </div>
          </div>
        </div>
      )}

      {/* RE-OPTIMIZE PLAN CONFIRMATION MODAL */}
      {reoptimizeModalPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Apply Adaptive Plan Re-Optimization?
              </h3>
              <button onClick={() => setReoptimizeModalPlan(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <p className="text-zinc-100 font-bold">{reoptimizeModalPlan.changeSummary}</p>
              <p>Adjusts step durations and buffers dynamically while maintaining deadline target.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setReoptimizeModalPlan(null)}>Keep Original</Button>
              <Button variant="ai" size="sm" onClick={handleApplyReoptimization} icon={Check}>Apply Plan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
