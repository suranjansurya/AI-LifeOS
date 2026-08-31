import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { getProjectOverviewAi, generateAiProjectPlanProposalClient } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  ShieldCheck,
  X,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Calendar as CalendarIcon,
  Zap,
  Target
} from 'lucide-react';

export const Projects = () => {
  const navigate = useNavigate();
  const { tasks, goals, showToast } = useApp();

  const [projects, setProjects] = useState([
    {
      id: 'prj-1',
      name: 'AI-LifeOS System Upgrade',
      description: 'Building multi-agent workspace, study system, habits, wellness, and project management suite.',
      status: 'Active',
      priority: 'High',
      start_date: '2026-08-01',
      deadline: '2026-09-30',
      category: 'Engineering',
      progress: 72,
      health: 'HEALTHY'
    },
    {
      id: 'prj-2',
      name: 'DBMS Exam Prep Sprint',
      description: 'Complete normalization, joins practice, and exam revision syllabus.',
      status: 'Active',
      priority: 'Medium',
      start_date: '2026-08-15',
      deadline: '2026-09-10',
      category: 'Academic',
      progress: 70,
      health: 'HEALTHY'
    }
  ]);

  const [decisions, setDecisions] = useState([
    {
      id: 'dec-1',
      projectId: 'prj-1',
      title: 'Use Supabase PostgreSQL RLS',
      decision: 'Implement Row Level Security across all tables.',
      reason: 'Ensures strict user data isolation and security.',
      decision_date: '2026-08-05'
    }
  ]);

  const [resources, setResources] = useState([
    {
      id: 'res-1',
      projectId: 'prj-1',
      title: 'Supabase RLS Documentation',
      type: 'Link',
      url: 'https://supabase.com/docs/guides/auth/row-level-security',
      description: 'Official guide for Supabase security policies.'
    }
  ]);

  const [overview, setOverview] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);

  // Form Fields
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [priorityInput, setPriorityInput] = useState('Medium');
  const [deadlineInput, setDeadlineInput] = useState('2026-09-30');
  const [categoryInput, setCategoryInput] = useState('Engineering');

  const fetchOverview = async () => {
    try {
      const res = await getProjectOverviewAi(projects, tasks);
      setOverview(res);
    } catch (e) {
      showToast('Error loading project overview.', 'error');
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [projects, tasks]);

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      showToast('Project name is required.', 'warning');
      return;
    }

    const newPrj = {
      id: `prj-${Date.now()}`,
      name: nameInput,
      description: descInput,
      status: 'Active',
      priority: priorityInput,
      start_date: new Date().toISOString().split('T')[0],
      deadline: deadlineInput,
      category: categoryInput,
      progress: 0,
      health: 'HEALTHY'
    };

    setProjects(prev => [...prev, newPrj]);
    showToast(`Project "${nameInput}" created!`, 'success');
    setNameInput('');
    setDescInput('');
    setShowNewModal(false);
  };

  const handleGenerateAiPlan = async (prjName) => {
    try {
      const res = await generateAiProjectPlanProposalClient(prjName);
      if (res.proposedPlan) {
        setAiPlan(res.proposedPlan);
        setShowPlanModal(true);
      }
    } catch (e) {
      showToast('Error generating AI project plan.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Project Management Suite"
        subtitle="Central workspace connecting tasks, goals, milestones, calendar, decisions, and resources."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={() => handleGenerateAiPlan('AI-LifeOS Ecosystem')} icon={Sparkles}>
              AI Project Planner
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowNewModal(true)} icon={Plus}>
              New Project
            </Button>
          </div>
        }
      />

      {/* METRICS DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center justify-between border-indigo-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">ACTIVE PROJECTS</span>
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {overview?.activeCount || 2}
            </span>
          </div>
          <FolderKanban className="w-6 h-6 text-indigo-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-emerald-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">OVERALL PROGRESS</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {overview?.overallProgress || 72}%
            </span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-amber-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">AT RISK</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {overview?.atRiskCount || 0}
            </span>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-cyan-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">UPCOMING DEADLINES</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">
              2
            </span>
          </div>
          <Clock className="w-6 h-6 text-cyan-400 opacity-60" />
        </div>
      </div>

      {/* AI INSIGHTS BANNER */}
      {overview?.insights && (
        <div className="card-panel p-4 space-y-2 border-indigo-500/30 bg-indigo-950/20">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI PROJECT INTELLIGENCE DIAGNOSTICS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overview.insights.map((ins, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-950/80 border border-indigo-500/30 text-xs space-y-1">
                <span className="font-bold text-zinc-100 block">{ins.title}</span>
                <p className="text-zinc-300">{ins.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROJECTS LIST */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">MY PROJECTS</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const pTasks = tasks.filter(t => t.project_id === p.id || t.project === p.name);
            const completedCount = pTasks.filter(t => t.status === 'Completed').length;
            const progress = pTasks.length > 0 ? Math.round((completedCount / pTasks.length) * 100) : p.progress;

            return (
              <div key={p.id} className="card-panel p-5 space-y-4 border-zinc-800 hover:border-indigo-500/40 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-zinc-100">{p.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{p.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    p.health === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {p.health}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Progress ({completedCount}/{pTasks.length || 25} tasks)</span>
                    <span className="font-mono text-indigo-400 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">NEXT BEST ACTION</span>
                    <span className="text-zinc-200 font-medium">Execute RLS security verification test suite</span>
                  </div>
                  <Button variant="outline" size="xs" onClick={() => navigate('/focus')} icon={Zap}>
                    Start Focus
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs text-zinc-400">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Deadline: {p.deadline}</span>
                  </div>
                  <Button variant="ghost" size="xs" onClick={() => setSelectedProject(p)} icon={ArrowRight}>
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-indigo-400" />
                Create New Project
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. AI-LifeOS System Upgrade"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Project scope and core deliverables..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Priority</label>
                  <select
                    value={priorityInput}
                    onChange={(e) => setPriorityInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Category</label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Academic">Academic</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={deadlineInput}
                  onChange={(e) => setDeadlineInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowNewModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Create Project</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI PROJECT PLANNER PROPOSAL MODAL */}
      {showPlanModal && aiPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-lg w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Proposed Plan: {aiPlan.projectName}
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {aiPlan.phases.map((phase, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-300">{phase.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{phase.timeframe}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {phase.tasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowPlanModal(false)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={() => { showToast('Project plan applied!', 'success'); setShowPlanModal(false); }}>
                Apply Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
