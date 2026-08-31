import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  buildDigitalTwinSnapshot,
  runDigitalTwinSimulation,
  compareScenarioPair
} from '../services/digitalTwinService';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  History,
  ArrowRight,
  Sliders,
  Layers,
  Activity,
  Check,
  X,
  Target,
  Folder,
  CheckSquare
} from 'lucide-react';

export const DigitalTwin = () => {
  const navigate = useNavigate();
  const { tasks, goals, calendarEvents, focusSessions, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('snapshot'); // 'snapshot' | 'builder' | 'simulator' | 'comparison' | 'history'
  const [scenarioInput, setScenarioInput] = useState('What if I study 2 hours daily for DBMS revision?');
  const [simulationResult, setSimulationResult] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // History Log
  const [scenarioHistory, setScenarioHistory] = useState([
    { id: 'scen-hist-1', date: 'Today 11:00 AM', name: 'Study 2 hours daily for DBMS', risk: 'Low Risk', confidence: '92%', status: 'Simulated' },
    { id: 'scen-hist-2', date: 'Aug 29', name: 'Postpone DBMS assignment by 2 days', risk: 'Moderate Risk', confidence: '88%', status: 'Simulated' }
  ]);

  const snapshot = buildDigitalTwinSnapshot({ tasks, goals, calendarEvents, focusSessions });

  // Run Simulation
  const handleRunSimulation = (e) => {
    e.preventDefault();
    if (!scenarioInput.trim()) return;
    const res = runDigitalTwinSimulation(scenarioInput, { tasks, goals, calendarEvents });
    setSimulationResult(res);
    setScenarioHistory(prev => [
      { id: `scen-${Date.now()}`, date: 'Just Now', name: scenarioInput, risk: res.riskRating, confidence: res.confidence, status: 'Simulated' },
      ...prev
    ]);
    setActiveTab('simulator');
    showToast('Simulation complete. Isolated state displayed below.', 'info');
  };

  // Confirm Apply Scenario
  const handleApplyScenarioPlan = () => {
    setShowApplyModal(false);
    showToast(`Applied scenario plan to your AI execution queue!`, 'success');
    navigate('/execution');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Digital Twin & Personal Life Simulator 3.0"
        subtitle="Decision-support digital twin representing your LifeOS state, running isolated What-If scenario simulations, and comparing future trade-offs without altering real data."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={() => setActiveTab('builder')} icon={Sparkles}>
              New Simulation
            </Button>
          </div>
        }
      />

      {/* PRIVACY & TRANSPARENCY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Simulation Safety: Simulations run in isolated temporary state. Real task deadlines and calendar events are never modified until you explicitly approve a plan.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'snapshot', label: 'Current Life Snapshot', icon: Bot },
          { id: 'builder', label: 'Scenario Builder', icon: Sparkles },
          { id: 'simulator', label: 'What-If Simulator', icon: HelpCircle },
          { id: 'comparison', label: 'Scenario Comparison (A vs B)', icon: Activity },
          { id: 'history', label: `Scenario History (${scenarioHistory.length})`, icon: History }
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

      {/* TAB 1: CURRENT LIFE SNAPSHOT */}
      {activeTab === 'snapshot' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  Digital Twin State Baseline
                </h3>
                <p className="text-xs text-zinc-400">Grounded strictly in your authenticated LifeOS records.</p>
              </div>
              <Badge variant="primary" size="sm">{snapshot.workloadState}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium">ACTIVE TASKS</span>
                <span className="text-lg font-black font-mono text-zinc-100 block">{snapshot.activeTasksCount}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium">ACTIVE GOALS</span>
                <span className="text-lg font-black font-mono text-zinc-100 block">{snapshot.activeGoalsCount}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium">LOGGED FOCUS</span>
                <span className="text-lg font-black font-mono text-zinc-100 block">{snapshot.loggedFocusHours}h</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium">UPCOMING EVENTS</span>
                <span className="text-lg font-black font-mono text-zinc-100 block">{snapshot.upcomingEventsCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCENARIO BUILDER */}
      {activeTab === 'builder' && (
        <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Create Hypothetical Life Scenario
          </h3>

          <form onSubmit={handleRunSimulation} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Scenario Query</label>
              <input
                type="text"
                value={scenarioInput}
                onChange={(e) => setScenarioInput(e.target.value)}
                placeholder='e.g., "What if I study 2 hours daily for DBMS revision?"'
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none font-medium"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="ai" size="sm" icon={Play}>
                Run Isolated Simulation
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: WHAT-IF SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {simulationResult ? (
            <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <div>
                  <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase">
                    {simulationResult.simulationBadge}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-100 mt-1.5">Scenario: "{simulationResult.scenarioName}"</h4>
                </div>
                <span className="text-[10px] text-indigo-300 font-mono font-bold">{simulationResult.confidence}</span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs text-zinc-300">
                <p className="text-zinc-100 font-bold">{simulationResult.projectedImpact}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block">TARGET SHIFT</span>
                    <span className="text-emerald-400 font-bold">{simulationResult.timeShift}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block">FOCUS SHIFT</span>
                    <span className="text-indigo-300 font-bold">{simulationResult.focusShift}</span>
                  </div>
                </div>

                <span className="text-[10px] text-zinc-500 font-mono block">Baseline: {simulationResult.sourcesUsed}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSimulationResult(null)}>Discard Simulation</Button>
                <Button variant="ai" size="sm" onClick={() => setShowApplyModal(true)} icon={Check}>Apply This Plan</Button>
              </div>
            </div>
          ) : (
            <div className="card-panel p-12 text-center text-xs text-zinc-500 space-y-2">
              <HelpCircle className="w-8 h-8 text-indigo-400 mx-auto" />
              <p className="text-zinc-300 font-bold">No active simulation.</p>
              <p className="text-zinc-500">Go to Scenario Builder to run a What-If simulation.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SCENARIO COMPARISON (A VS B) */}
      {activeTab === 'comparison' && (
        <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Scenario Comparison Matrix (Current vs Simulated Pace)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="font-bold text-zinc-100 block">Scenario A: Current Pace</span>
              <p className="text-zinc-400">Completion Date: In 5 Days • Daily Focus: 45m/day</p>
              <span className="text-[10px] text-emerald-400 font-mono font-bold block">Status: Moderate Workload</span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
              <span className="font-bold text-indigo-300 block">Scenario B: Accelerated Study (+2h/day)</span>
              <p className="text-zinc-200">Completion Date: In 2 Days • Daily Focus: 120m/day</p>
              <span className="text-[10px] text-amber-300 font-mono font-bold block">Status: High Intensity</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCENARIO HISTORY */}
      {activeTab === 'history' && (
        <div className="card-panel p-5 space-y-3 bg-zinc-950 border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Simulation Audit Log History
          </h3>

          <div className="divide-y divide-zinc-800 text-xs">
            {scenarioHistory.map(rec => (
              <div key={rec.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-500">{rec.date}</span>
                    <span className="font-bold text-zinc-100">{rec.name}</span>
                  </div>
                  <span className="text-[11px] text-indigo-300 font-mono mt-0.5 block">Confidence: {rec.confidence}</span>
                </div>
                <Badge variant="primary" size="sm">{rec.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPLY SCENARIO CONFIRMATION MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400" />
                Apply Scenario Plan to Real State?
              </h3>
              <button onClick={() => setShowApplyModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This will queue the simulation's task schedule and focus sprints into your active execution engine.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowApplyModal(false)}>Discard</Button>
              <Button variant="ai" size="sm" onClick={handleApplyScenarioPlan} icon={Check}>Apply Plan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
