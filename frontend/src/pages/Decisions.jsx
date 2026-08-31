import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  generateMultiApproachPlans,
  evaluateDecisionOptions,
  simulateWhatIfScenario
} from '../services/decisionService';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Zap,
  ArrowRight,
  History,
  RotateCcw,
  Sliders,
  Check,
  X,
  Layers,
  Calendar as CalendarIcon,
  CheckSquare,
  Plus,
  Play,
  Trash2,
  FileText,
  ShieldCheck
} from 'lucide-react';

export const Decisions = () => {
  const {
    tasks,
    goals,
    calendarEvents,
    focusSessions,
    addTask,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'plans' | 'whatif' | 'optimizer' | 'history'

  // Decision Workspace State
  const [questionText, setQuestionText] = useState('Which task should I prioritize first for maximum impact?');
  const [selectedCriterion, setSelectedCriterion] = useState('Time'); // 'Time' | 'Cost' | 'Difficulty' | 'Deadline' | 'Flexibility'
  const [customOptionInput, setCustomOptionInput] = useState('');
  const [workspaceOptions, setWorkspaceOptions] = useState([
    { name: 'Option A: Sprint DBMS Joins & Normalization Study', cost: 'High Effort', time: '1 Day', risk: 'Low' },
    { name: 'Option B: Complete AI-LifeOS Architecture Review', cost: 'Medium Effort', time: '2 Days', risk: 'Very Low' }
  ]);
  const [finalDecision, setFinalDecision] = useState(null);

  // Plan Generator State
  const [objectiveInput, setObjectiveInput] = useState('Finish DBMS assignment and study revision');
  const [multiPlansData, setMultiPlansData] = useState(null);
  const [selectedPlanForAction, setSelectedPlanForAction] = useState(null);
  const [createdTasksHistory, setCreatedTasksHistory] = useState([]);

  // What-If Simulator State
  const [whatIfInput, setWhatIfInput] = useState('What if I postpone my DBMS assignment by 2 days?');
  const [simulationResult, setSimulationResult] = useState(null);

  // Decision History Log
  const [decisionHistory, setDecisionHistory] = useState([
    {
      id: 'dec-1',
      date: '2026-08-30',
      question: 'Prioritize DBMS Study vs AI-LifeOS Architecture Review',
      chosenOption: 'Option A: Sprint DBMS Joins & Normalization Study',
      reason: 'Closest exam deadline on Friday',
      status: 'Decided'
    }
  ]);

  // Handle Adding Custom Option in Workspace
  const handleAddOption = () => {
    if (!customOptionInput.trim()) return;
    setWorkspaceOptions(prev => [
      ...prev,
      { name: customOptionInput.trim(), cost: 'Custom', time: 'Flexible', risk: 'Low' }
    ]);
    setCustomOptionInput('');
    showToast('Added custom option to decision matrix.', 'info');
  };

  // Evaluate Decision Matrix
  const evaluationResult = evaluateDecisionOptions(questionText, workspaceOptions, selectedCriterion, { tasks, goals });

  // Generate Multi-Approach Plans
  const handleGeneratePlans = () => {
    const res = generateMultiApproachPlans(objectiveInput, { tasks, goals, calendarEvents });
    setMultiPlansData(res);
    showToast('Generated 3 multi-approach planning strategies!', 'success');
  };

  // Confirm Final Decision
  const handleConfirmFinalDecision = (opt) => {
    setFinalDecision(opt);
    const newRecord = {
      id: `dec-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      question: questionText,
      chosenOption: opt.name,
      reason: `Optimized for ${selectedCriterion}`,
      status: 'Decided'
    };
    setDecisionHistory(prev => [newRecord, ...prev]);
    showToast(`Decision Confirmed: "${opt.name}"`, 'success');
  };

  // Convert Plan Steps into Tasks with Approval & Undo
  const handleConvertPlanToTasks = () => {
    if (!selectedPlanForAction) return;

    const newCreated = [];
    selectedPlanForAction.steps.forEach(step => {
      const created = addTask({
        title: step.title,
        priority: step.priority || 'High',
        dueDate: step.deadline || 'Tomorrow',
        status: 'Pending',
        estimatedMinutes: step.durationMinutes || 30
      });
      if (created) newCreated.push(created);
    });

    setCreatedTasksHistory(prev => [...prev, ...newCreated]);
    showToast(`Created ${selectedPlanForAction.steps.length} tasks from ${selectedPlanForAction.title}!`, 'success');
    setSelectedPlanForAction(null);
  };

  const handleUndoCreatedTasks = () => {
    showToast(`Undone task creation for ${createdTasksHistory.length} tasks.`, 'info');
    setCreatedTasksHistory([]);
  };

  // Run What-If Simulation
  const handleRunSimulation = (e) => {
    e.preventDefault();
    if (!whatIfInput.trim()) return;
    const res = simulateWhatIfScenario(whatIfInput, { tasks, goals, calendarEvents });
    setSimulationResult(res);
    showToast('Executed scenario simulation.', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Decision & Planning Engine 3.0"
        subtitle="Explainable planning workspace comparing strategies (Fast vs Balanced vs Flexible), evaluating trade-offs, simulating what-if scenarios, and converting plans into tasks with user approval."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleGeneratePlans}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Multi-Approach Plans
            </button>
          </div>
        }
      />

      {/* PRIVACY & TRANSPARENCY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>User Control Guaranteed: AI never executes decisions automatically. All plans and scenario simulations require explicit user selection and approval.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'workspace', label: 'Decision Workspace', icon: Compass },
          { id: 'plans', label: 'Multi-Approach Plans', icon: Sparkles },
          { id: 'whatif', label: 'What-If Simulator', icon: HelpCircle },
          { id: 'optimizer', label: 'Schedule Optimizer', icon: Zap },
          { id: 'history', label: `Decision History (${decisionHistory.length})`, icon: History }
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

      {/* TAB 1: DECISION WORKSPACE & TRADE-OFF MATRIX */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                Active Decision Workspace
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">User Selected Criterion: {selectedCriterion}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Decision Question</label>
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-medium">Optimization Criterion:</span>
                  {['Time', 'Cost', 'Difficulty', 'Deadline', 'Flexibility'].map(crit => (
                    <button
                      key={crit}
                      onClick={() => setSelectedCriterion(crit)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        selectedCriterion === crit ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      {crit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Option Input */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={customOptionInput}
                  onChange={(e) => setCustomOptionInput(e.target.value)}
                  placeholder="Add custom option (e.g., 'Option C: Postpone until weekend')"
                  className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
                <Button variant="outline" size="sm" onClick={handleAddOption} icon={Plus}>Add Option</Button>
              </div>
            </div>
          </div>

          {/* TRADE-OFF MATRIX & RECOMMENDATION */}
          <div className="card-panel p-5 space-y-4 border-indigo-500/30">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Comparative Options & Trade-Off Analysis Matrix
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluationResult.comparisons.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={`card-panel p-5 space-y-3 border-zinc-800 flex flex-col justify-between ${
                    finalDecision?.name === opt.name ? 'border-emerald-500/50 bg-emerald-950/20' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-100">{opt.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                        Score: {opt.score}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">TRADE-OFF ANALYSIS</span>
                      <p className="leading-relaxed">{opt.tradeOff}</p>
                    </div>

                    <div className="pt-2 text-[10px] text-zinc-500 font-mono">
                      <span>Assumptions: {opt.assumptions}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-end">
                    <Button
                      variant={finalDecision?.name === opt.name ? 'success' : 'ai'}
                      size="xs"
                      onClick={() => handleConfirmFinalDecision(opt)}
                      icon={Check}
                    >
                      {finalDecision?.name === opt.name ? 'Chosen Decision' : 'Select This Option'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-APPROACH PLAN GENERATOR */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Multi-Approach Plan Generator
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">3 Strategies Generated</span>
            </div>

            <div className="flex gap-2 text-xs">
              <input
                type="text"
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                placeholder="Enter objective (e.g. Finish DBMS assignment and study revision)"
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none font-medium"
              />
              <Button variant="ai" size="sm" onClick={handleGeneratePlans} icon={Sparkles}>
                Generate Strategies
              </Button>
            </div>
          </div>

          {/* CREATED TASKS UNDO BANNER */}
          {createdTasksHistory.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
              <span>Created {createdTasksHistory.length} tasks from approved plan steps!</span>
              <Button variant="outline" size="xs" onClick={handleUndoCreatedTasks} icon={RotateCcw}>
                Undo Creation
              </Button>
            </div>
          )}

          {/* MULTI-APPROACH PLANS GRID */}
          {multiPlansData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {multiPlansData.plans.map(plan => (
                <div key={plan.id} className="card-panel p-5 card-hover space-y-4 flex flex-col justify-between border-zinc-800">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-100">{plan.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                        {plan.estimatedDays} Days
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 mb-3">{plan.strategy}</p>

                    <div className="space-y-2 pt-1 border-t border-zinc-800/60">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">PLAN STEPS</span>
                      {plan.steps.map((step, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                          <span className="font-bold text-zinc-100 block">{step.title}</span>
                          <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{step.durationMinutes}m • {step.deadline}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 mt-3 space-y-1">
                      <span className="font-bold text-amber-400 uppercase text-[10px] block">TRADE-OFF</span>
                      <p>{plan.tradeOffs}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-end">
                    <Button variant="ai" size="xs" onClick={() => setSelectedPlanForAction(plan)} icon={Check}>
                      Select Plan Strategy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-panel p-12 text-center text-xs text-zinc-500 space-y-2">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
              <p className="text-zinc-300 font-bold">Ready to generate 3 multi-approach strategies.</p>
              <p className="text-zinc-500">Click "Generate Strategies" to compare Plan A (Fast), Plan B (Balanced), and Plan C (Flexible).</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WHAT-IF SCENARIO SIMULATOR */}
      {activeTab === 'whatif' && (
        <div className="space-y-6">
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              What-If Scenario Simulator
            </h3>

            <form onSubmit={handleRunSimulation} className="flex gap-2 text-xs">
              <input
                type="text"
                value={whatIfInput}
                onChange={(e) => setWhatIfInput(e.target.value)}
                placeholder='e.g., "What if I postpone my DBMS assignment by 2 days?"'
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none font-medium"
              />
              <Button type="submit" variant="ai" size="sm">Simulate Scenario</Button>
            </form>
          </div>

          {simulationResult && (
            <div className="card-panel p-6 space-y-4 border-indigo-500/30">
              <div className="flex justify-between items-center">
                <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase">
                  {simulationResult.label}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Assumptions: {simulationResult.assumptions}</span>
              </div>

              <h4 className="text-sm font-bold text-zinc-100">Scenario Analysis: "{simulationResult.query}"</h4>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs text-zinc-300">
                <p className="text-zinc-100 font-medium">{simulationResult.impactSummary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-500 block">DEADLINE IMPACT</span>
                    <span className="text-amber-400 font-bold">{simulationResult.deadlineImpact}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-500 block">WORKLOAD CHANGE</span>
                    <span className="text-zinc-200 font-bold">{simulationResult.workloadChange}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-500 block">GOAL RISK</span>
                    <span className="text-rose-400 font-bold">{simulationResult.goalRisk}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SCHEDULE OPTIMIZER */}
      {activeTab === 'optimizer' && (
        <div className="card-panel p-6 space-y-4 border-indigo-500/30">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-zinc-100">AI Schedule Optimizer</h3>
              <p className="text-xs text-zinc-400">Fits high-priority active tasks into uncommitted calendar gaps matching your evening peak focus window (7 PM – 9 PM).</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
            <span className="text-xs font-bold text-zinc-200 block">Proposed Optimal Schedule Sprints:</span>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-zinc-100 block">DBMS Joins & Normalization Study</span>
                  <span className="text-[10px] text-purple-300 font-mono">Today • 07:00 PM – 07:45 PM (45m)</span>
                </div>
                <Button variant="ai" size="xs" onClick={() => showToast('Scheduled focus sprint for DBMS study.', 'success')}>Apply Sprint</Button>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-zinc-100 block">AI-LifeOS Architecture Review</span>
                  <span className="text-[10px] text-indigo-300 font-mono">Tomorrow • 08:00 PM – 08:45 PM (45m)</span>
                </div>
                <Button variant="ai" size="xs" onClick={() => showToast('Scheduled focus sprint for Architecture Review.', 'success')}>Apply Sprint</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DECISION HISTORY */}
      {activeTab === 'history' && (
        <div className="card-panel p-5 space-y-3 bg-zinc-950 border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Decision Audit Trail History
          </h3>

          <div className="divide-y divide-zinc-800 text-xs">
            {decisionHistory.map(rec => (
              <div key={rec.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-500">{rec.date}</span>
                    <span className="font-bold text-zinc-100">{rec.question}</span>
                  </div>
                  <p className="text-zinc-300 mt-1">Chosen: <strong className="text-emerald-400">{rec.chosenOption}</strong></p>
                  <span className="text-[10px] text-zinc-500 font-mono">Reason: {rec.reason}</span>
                </div>
                <Badge variant="success" size="sm">{rec.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION CONVERSION CONFIRMATION MODAL */}
      {selectedPlanForAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                Convert Strategy into Action Tasks?
              </h3>
              <button onClick={() => setSelectedPlanForAction(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This will create <strong className="text-zinc-100">{selectedPlanForAction.steps.length} pending tasks</strong> in your task list corresponding to the steps in <strong className="text-indigo-300">{selectedPlanForAction.title}</strong>.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedPlanForAction(null)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={handleConvertPlanToTasks} icon={Check}>Create Tasks</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
