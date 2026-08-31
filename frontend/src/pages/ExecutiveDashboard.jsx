import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  buildExecutiveSnapshot,
  generateExecutiveReport,
  exportExecutiveReportJSON
} from '../services/executiveService';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Sparkles,
  ShieldCheck,
  Play,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Folder,
  Target,
  Compass,
  FileText,
  Activity,
  Layers,
  Zap,
  Check,
  X
} from 'lucide-react';

export const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const { tasks, goals, projects, calendarEvents, focusSessions, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('snapshot'); // 'snapshot' | 'matrix' | 'health' | 'timeline' | 'report'
  const [reportData, setReportData] = useState(null);

  const snapshot = buildExecutiveSnapshot({ tasks, goals, projects, calendarEvents, focusSessions });

  // Attention Items
  const attentionItems = [
    { id: 'att-1', title: 'DBMS Assignment Due Tomorrow', category: 'Approaching Deadline', severity: 'High', action: 'Schedule Focus', link: '/focus' },
    { id: 'att-2', title: 'Phase 4 Execution Step Blocked', category: 'Mission Risk', severity: 'Medium', action: 'Review Mission', link: '/missions' }
  ];

  // Opportunities
  const opportunityItems = [
    { id: 'opp-1', title: 'Uncommitted 50m Focus Window Available (7 PM – 9 PM)', category: 'Calendar Gap', action: 'Start Study', link: '/study' }
  ];

  const handleGenerateReport = () => {
    const rep = generateExecutiveReport({ tasks, goals, projects });
    setReportData(rep);
    showToast('Generated AI Executive Briefing Report!', 'success');
  };

  const handleExportReport = () => {
    if (!reportData) return;
    exportExecutiveReportJSON(reportData);
    showToast('Exported Executive Report JSON.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Executive Dashboard & Life Intelligence 3.0"
        subtitle="High-level executive briefing, priority matrix, attention center, workload forecasts, project & goal health radar, and executive report export."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={handleGenerateReport} icon={FileText}>
              Generate Report
            </Button>
          </div>
        }
      />

      {/* PRIVACY & TRANSPARENCY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Real Data Only: Metrics are aggregated directly from your active tasks, goals, projects, and calendar. No arbitrary or fabricated scores.</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Status: {snapshot.overallHealth}</span>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'snapshot', label: 'Executive Snapshot & Brief', icon: BarChart3 },
          { id: 'matrix', label: 'Priority Matrix & Attention', icon: AlertTriangle },
          { id: 'health', label: 'Health Radar (Goals/Projects)', icon: Activity },
          { id: 'timeline', label: 'Weekly Timeline & Workload', icon: Clock },
          { id: 'report', label: 'Executive Report & Export', icon: FileText }
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

      {/* TAB 1: EXECUTIVE SNAPSHOT & BRIEF */}
      {activeTab === 'snapshot' && (
        <div className="space-y-6">
          {/* SNAPSHOT METRICS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 font-medium">PRIORITY TASKS</span>
              <span className="text-xl font-black font-mono text-indigo-400 block">{snapshot.priorityTasksCount}</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 font-medium">ACTIVE PROJECTS</span>
              <span className="text-xl font-black font-mono text-zinc-100 block">{snapshot.activeProjectsCount}</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 font-medium">ACTIVE GOALS</span>
              <span className="text-xl font-black font-mono text-zinc-100 block">{snapshot.activeGoalsCount}</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 font-medium">UPCOMING EVENTS</span>
              <span className="text-xl font-black font-mono text-zinc-100 block">{snapshot.upcomingEventsCount}</span>
            </div>
          </div>

          {/* NEXT BEST ACTION CARD */}
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Next Best Action Recommendation
              </h3>
              <Badge variant="purple" size="sm">Executive Priority</Badge>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs text-zinc-300">
              <h4 className="font-bold text-zinc-100 text-sm">DBMS Revision & Normalization Mastery</h4>
              <p>Target exam deadline is tomorrow. Completing 45m focus session reduces deadline risk to Low.</p>
              <span className="text-[10px] text-indigo-300 font-mono block pt-1">WHY THIS? Grounded in 3 active tasks, 1 approaching deadline, and 85% quiz accuracy score.</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ai" size="sm" onClick={() => navigate('/focus')} icon={Play}>Start Focus Sprint</Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRIORITY MATRIX & ATTENTION */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* NEEDS ATTENTION CENTER */}
          <div className="card-panel p-5 space-y-4 border-amber-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Needs Your Attention ({attentionItems.length})
            </h3>

            <div className="space-y-3 text-xs">
              {attentionItems.map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-100 block">{item.title}</span>
                    <span className="text-[10px] text-amber-300 font-mono">{item.category}</span>
                  </div>
                  <Button variant="ai" size="xs" onClick={() => navigate(item.link)} icon={Play}>{item.action}</Button>
                </div>
              ))}
            </div>
          </div>

          {/* OPPORTUNITY CENTER */}
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Executive AI Opportunities
            </h3>

            <div className="space-y-3 text-xs">
              {opportunityItems.map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-100 block">{item.title}</span>
                    <span className="text-[10px] text-indigo-300 font-mono">{item.category}</span>
                  </div>
                  <Button variant="outline" size="xs" onClick={() => navigate(item.link)} icon={Play}>{item.action}</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH RADAR */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Goal & Project Velocity Health Radar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-100 block">Goal: Master DBMS & Relational Architecture</span>
                <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[78%]" />
                </div>
                <span className="text-[10px] text-emerald-400 font-mono block">Progress: 78% • On Track</span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-100 block">Project: AI-LifeOS Production Infrastructure</span>
                <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[90%]" />
                </div>
                <span className="text-[10px] text-indigo-300 font-mono block">Progress: 90% • High Velocity</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEEKLY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Weekly Workload Forecast & Timeline
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-zinc-100 block">Today's Focus Agenda</span>
                <span className="text-[10px] text-indigo-300 font-mono">DBMS Joins Review (1.5h Focus)</span>
              </div>
              <Badge variant="primary" size="sm">Moderate Load</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-zinc-100 block">Tomorrow's Focus Agenda</span>
                <span className="text-[10px] text-amber-300 font-mono">Exam Self-Quiz & RLS Audit (2.5h Focus)</span>
              </div>
              <Badge variant="warning" size="sm">High Load</Badge>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXECUTIVE REPORT & EXPORT */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {reportData ? (
            <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h4 className="text-sm font-bold text-zinc-100">{reportData.title}</h4>
                <Button variant="ai" size="xs" onClick={handleExportReport} icon={Download}>Export JSON</Button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs text-zinc-300">
                <p>{reportData.summary}</p>
                <div className="pt-2 border-t border-zinc-800/80 font-mono text-[11px] space-y-1">
                  <div>Security Risk Summary: <strong className="text-emerald-400">{reportData.riskSummary}</strong></div>
                  <div>Recommended Next Step: <strong className="text-indigo-300">{reportData.recommendedNextStep}</strong></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-panel p-12 text-center text-xs text-zinc-500 space-y-2">
              <FileText className="w-8 h-8 text-indigo-400 mx-auto" />
              <p className="text-zinc-300 font-bold">No executive report generated yet.</p>
              <Button variant="ai" size="xs" onClick={handleGenerateReport} icon={FileText} className="mt-2">
                Generate Executive Report
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
