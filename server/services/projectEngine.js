/**
 * AI LifeOS — Project Management Suite Engine
 * Progress calculations, project health diagnostics, risk detection, decision logging,
 * and AI project plan generator.
 */

export function calculateProjectOverview(projects = [], tasks = []) {
  if (!projects || projects.length === 0) {
    return {
      success: true,
      hasData: false,
      activeCount: 0,
      completedCount: 0,
      atRiskCount: 0,
      overallProgress: 0,
      projectsList: [],
      insights: [
        {
          type: 'info',
          title: 'Create Your First Project',
          message: 'Organize tasks, goals, milestones, and decisions under dedicated project workspaces.',
          citation: 'Project Suite'
        }
      ]
    };
  }

  const activeProjects = projects.filter(p => p.status !== 'Completed' && p.status !== 'Archived');
  const completedProjects = projects.filter(p => p.status === 'Completed');

  const projectsList = projects.map(p => {
    const pTasks = tasks.filter(t => t.project_id === p.id || t.project === p.name);
    const pCompleted = pTasks.filter(t => t.status === 'Completed').length;
    const progress = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : p.progress || 0;
    const overdueCount = pTasks.filter(t => t.status !== 'Completed' && (t.dueDate || t.due_date || '').toLowerCase().includes('overdue')).length;
    const health = overdueCount > 2 ? 'CRITICAL' : overdueCount > 0 ? 'AT_RISK' : 'HEALTHY';

    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      status: p.status || 'Active',
      priority: p.priority || 'Medium',
      deadline: p.deadline || 'Sept 30, 2026',
      totalTasks: pTasks.length,
      completedTasks: pCompleted,
      progress,
      health,
      overdueCount,
      nextAction: pTasks.find(t => t.status !== 'Completed')?.title || 'Review Project Milestones'
    };
  });

  const atRiskCount = projectsList.filter(p => p.health === 'AT_RISK' || p.health === 'CRITICAL').length;
  const overallProgress = Math.round(projectsList.reduce((acc, p) => acc + p.progress, 0) / projectsList.length);

  return {
    success: true,
    hasData: true,
    activeCount: activeProjects.length,
    completedCount: completedProjects.length,
    atRiskCount,
    overallProgress,
    projectsList,
    insights: [
      {
        type: atRiskCount > 0 ? 'risk' : 'positive',
        title: atRiskCount > 0 ? '⚠️ Project Risks Identified' : '🚀 Healthy Project Velocity',
        message: atRiskCount > 0 ? `${atRiskCount} project(s) have overdue tasks requiring schedule rebalancing.` : 'All active projects are currently progressing within target pace.',
        citation: 'Project Suite Engine'
      }
    ]
  };
}

export function generateAiProjectPlanProposal(projectName = 'AI-LifeOS System') {
  return {
    success: true,
    requiresApproval: true,
    proposedPlan: {
      projectName,
      phases: [
        {
          name: 'Phase 1: Architecture & Scope Definition',
          timeframe: 'Week 1',
          tasks: ['Define core requirements', 'Draft database schema', 'Setup initial API endpoints']
        },
        {
          name: 'Phase 2: Core Engineering & Component Build',
          timeframe: 'Weeks 2–3',
          tasks: ['Implement backend services', 'Build frontend UI views', 'Integrate AI Copilot router']
        },
        {
          name: 'Phase 3: Testing, Verification & Production Release',
          timeframe: 'Week 4',
          tasks: ['Execute RLS security tests', 'Run production build verification', 'Deploy application']
        }
      ]
    }
  };
}
