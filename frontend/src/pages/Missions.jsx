import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  getDefaultMissions,
  buildMissionPlanFromObjective,
  generateFinalMissionReport
} from '../services/missionService';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Plus,
  Check,
  X,
  History,
  RotateCcw,
  Sliders,
  FileText,
  Clock,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';

export const Missions = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'builder' | 'approvals' | 'templates' | 'history'
  const [missions, setMissions] = useState(getDefaultMissions());
  const [selectedMissionId, setSelectedMissionId] = useState(missions[0]?.id || '');
  const [showPlanApprovalModal, setShowPlanApprovalModal] = useState(false);
  const [pendingProposedMission, setPendingProposedMission] = useState(null);
  const [finalReportData, setFinalReportData] = useState(null);

  // New Mission Form State
  const [missionName, setMissionName] = useState('Fullstack AI System Audit');
  const [missionObjective, setMissionObjective] = useState('Audit RLS policies, run production build tests, and verify multi-agent routing.');
  const [missionCategory, setMissionCategory] = useState('Project');
  const [missionAutonomy, setMissionAutonomy] = useState('Approval Required');

  // Pending Approvals Queue
  const [pendingApprovalsQueue, setPendingApprovalsQueue] = useState([
    {
      id: 'app-m-1',
      missionTitle: 'DBMS Revision & Normalization Mastery',
      action: 'Execute Phase 4 Self-Quiz & Final Verification',
      agent: 'Execution Agent',
      reason: 'Prerequisite Phase 3 SQL Joins completed successfully.'
    }
  ]);

  // History Log
  const [missionHistory, setMissionHistory] = useState([
    { id: 'hist-m-1', title: 'Phase 39-42 System Architecture Integration', category: 'Project', completedDate: '2026-08-30', status: 'Completed', verification: 'Verified' }
  ]);

  const activeMission = missions.find(m => m.id === selectedMissionId) || missions[0];

  // Generate Mission Plan
  const handleGenerateMissionPlan = (e) => {
    e.preventDefault();
    if (!missionName.trim() || !missionObjective.trim()) return;

    const proposed = buildMissionPlanFromObjective({
      name: missionName.trim(),
      objective: missionObjective.trim(),
      category: missionCategory,
      autonomyLevel: missionAutonomy
    });

    setPendingProposedMission(proposed);
    setShowPlanApprovalModal(true);
    showToast('Generated 4-stage mission plan! Review and approve below.', 'info');
  };

  // Confirm Proposed Mission Plan
  const handleApproveProposedMission = () => {
    if (!pendingProposedMission) return;
    const approvedMission = { ...pendingProposedMission, status: 'Running' };
    setMissions(prev => [approvedMission, ...prev]);
    setSelectedMissionId(approvedMission.id);
    setShowPlanApprovalModal(false);
    setPendingProposedMission(null);
    setActiveTab('active');
    showToast(`Approved mission "${approvedMission.title}"! Execution started.`, 'success');
  };

  // Toggle Pause / Resume Mission
  const handleToggleMissionPause = (id) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'Running' ? 'Paused' : 'Running';
        return { ...m, status: nextStatus };
      }
      return m;
    }));
    showToast('Updated mission status.', 'info');
  };

  // Generate Final Mission Report
  const handleViewFinalReport = (m) => {
    const report = generateFinalMissionReport(m);
    setFinalReportData(report);
    showToast(`Generated final mission report for "${m.title}".`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Autonomous Workflow & Mission Control 3.0"
        subtitle="High-level objective planning, milestone task breakdown, dependency enforcement, multi-agent handoffs, and final verification reports."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('approvals')}
              className="relative px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Pending Approvals ({pendingApprovalsQueue.length})</span>
            </button>

            <Button variant="ai" size="sm" onClick={() => setActiveTab('builder')} icon={Plus}>
              New Mission
            </Button>
          </div>
        }
      />

      {/* PRIVACY & SAFETY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Safety Guards Active: Default autonomy mode is 'Approval Required'. High-impact actions strictly require explicit user approval before execution.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'active', label: `Active Missions (${missions.length})`, icon: Compass },
          { id: 'builder', label: 'New Mission Builder', icon: Sparkles },
          { id: 'approvals', label: `Approval Gate (${pendingApprovalsQueue.length})`, icon: ShieldAlert },
          { id: 'templates', label: 'Mission Templates', icon: Layers },
          { id: 'history', label: `History (${missionHistory.length})`, icon: History }
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

      {/* TAB 1: ACTIVE MISSIONS & MILESTONES */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {missions.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMissionId(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all ${
                  activeMission.id === m.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {m.title}
              </button>
            ))}
          </div>

          {activeMission && (
            <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{activeMission.category}</Badge>
                    <span className="text-xs text-amber-300 font-bold font-mono">Autonomy: {activeMission.autonomyLevel}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100 mt-1">{activeMission.title}</h3>
                  <p className="text-xs text-zinc-400">{activeMission.objective}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant={activeMission.status === 'Running' ? 'warning' : 'success'}
                    size="xs"
                    onClick={() => handleToggleMissionPause(activeMission.id)}
                    icon={activeMission.status === 'Running' ? Pause : Play}
                  >
                    {activeMission.status === 'Running' ? 'Pause Mission' : 'Resume Mission'}
                  </Button>

                  <Button variant="outline" size="xs" onClick={() => handleViewFinalReport(activeMission)} icon={FileText}>
                    Generate Report
                  </Button>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400 font-mono">
                  <span>Milestone Progress: {activeMission.completedSteps} / {activeMission.totalSteps} steps completed</span>
                  <span>{activeMission.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${activeMission.progress}%` }} />
                </div>
              </div>

              {/* MILESTONE TIMELINE BREAKDOWN */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">MISSION MILESTONES & AGENT HANDOFFS</span>

                {activeMission.milestones.map((ms, idx) => (
                  <div
                    key={ms.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      ms.status === 'Completed' ? 'bg-zinc-950/60 border-zinc-800 opacity-60' :
                      ms.status === 'Running' ? 'bg-indigo-950/30 border-indigo-500/40' :
                      'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-zinc-500 font-bold">#{idx + 1}</span>
                      <div>
                        <span className="font-bold text-zinc-100 block">{ms.title}</span>
                        <span className="text-[10px] text-indigo-300 font-mono block mt-0.5">Assigned Agent: {ms.agent}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                      ms.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      ms.status === 'Running' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                      'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {ms.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: NEW MISSION BUILDER */}
      {activeTab === 'builder' && (
        <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI Mission Builder & Plan Generator
          </h3>

          <form onSubmit={handleGenerateMissionPlan} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Mission Name</label>
              <input
                type="text"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1">High-Level Objective</label>
              <textarea
                rows={3}
                value={missionObjective}
                onChange={(e) => setMissionObjective(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Category</label>
                <select
                  value={missionCategory}
                  onChange={(e) => setMissionCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-medium focus:outline-none"
                >
                  {['Project', 'Study', 'Research', 'Personal', 'Goal Sprint'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">AI Autonomy Level</label>
                <select
                  value={missionAutonomy}
                  onChange={(e) => setMissionAutonomy(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-medium focus:outline-none text-amber-300 font-bold"
                >
                  {['Manual', 'Approval Required', 'Semi-Automatic'].map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="ai" size="sm" icon={Sparkles}>
                Generate Mission Plan
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: APPROVAL GATE */}
      {activeTab === 'approvals' && (
        <div className="card-panel p-6 space-y-4 border-amber-500/40 bg-zinc-950">
          <div className="flex items-center gap-2 text-amber-300">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-sm font-bold text-zinc-100">Mission Action Approval Queue</h3>
          </div>

          {pendingApprovalsQueue.length > 0 ? (
            <div className="space-y-3 text-xs">
              {pendingApprovalsQueue.map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-indigo-300 block">{item.missionTitle}</span>
                    <h4 className="font-bold text-zinc-100 mt-0.5">{item.action}</h4>
                    <span className="text-[10px] text-amber-400 font-mono block mt-1">Reason: {item.reason}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="success" size="xs" onClick={() => { setPendingApprovalsQueue(prev => prev.filter(a => a.id !== item.id)); showToast('Approved mission action.', 'success'); }} icon={Check}>
                      Approve Action
                    </Button>
                    <Button variant="danger" size="xs" onClick={() => setPendingApprovalsQueue(prev => prev.filter(a => a.id !== item.id))} icon={X}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p>No actions waiting for approval in mission queue.</p>
            </div>
          )}
        </div>
      )}

      {/* PROPOSED MISSION PLAN APPROVAL MODAL */}
      {showPlanApprovalModal && pendingProposedMission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-lg w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Mission Plan Ready for Review
              </h3>
              <button onClick={() => setShowPlanApprovalModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-zinc-100">{pendingProposedMission.title}</h4>
                <p className="text-zinc-400">{pendingProposedMission.objective}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider block">STAGE MILESTONES & AGENT ROLES</span>
                {pendingProposedMission.milestones.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center text-zinc-200">
                    <span>{m.title}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{m.agent}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowPlanApprovalModal(false)}>Reject</Button>
              <Button variant="ai" size="sm" onClick={handleApproveProposedMission} icon={Check}>Approve Plan</Button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL MISSION REPORT MODAL */}
      {finalReportData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Final Mission Verification Report
              </h3>
              <button onClick={() => setFinalReportData(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-2 text-zinc-200">
              <h4 className="font-bold text-zinc-100">{finalReportData.title}</h4>
              <p>{finalReportData.summary}</p>
              <span className="text-[10px] text-emerald-400 font-mono font-bold block pt-1">{finalReportData.verificationStatus}</span>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setFinalReportData(null)}>Close Report</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
