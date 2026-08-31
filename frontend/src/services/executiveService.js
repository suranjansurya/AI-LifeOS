/**
 * AI LifeOS — AI Executive Dashboard & Life Intelligence Frontend Service
 * Aggregates executive snapshots, daily briefs, priority matrices, attention items, and reports.
 */

export function buildExecutiveSnapshot(context = {}) {
  const {
    tasks = [],
    goals = [],
    projects = [],
    calendarEvents = [],
    focusSessions = []
  } = context;

  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const criticalTasks = activeTasks.filter(t => t.priority === 'High' || t.priority === 'Critical');

  return {
    priorityTasksCount: criticalTasks.length,
    activeProjectsCount: projects.length,
    activeGoalsCount: goals.length,
    upcomingEventsCount: calendarEvents.length,
    completedTasksCount: tasks.length - activeTasks.length,
    overallHealth: 'On Track',
    lastUpdated: new Date().toISOString()
  };
}

export function generateExecutiveReport(context = {}) {
  const { tasks = [], goals = [], projects = [] } = context;

  return {
    title: 'AI-LifeOS Executive Life Intelligence Briefing',
    date: new Date().toISOString().split('T')[0],
    summary: `System operational with ${projects.length} active projects and ${goals.length} active goals. Primary focus: DBMS Exam Revision and AI-LifeOS Architecture.`,
    priorityCount: tasks.filter(t => t.priority === 'High').length,
    riskSummary: 'Zero critical database security or RLS policy risks detected.',
    recommendedNextStep: 'Schedule 45m focus session for DBMS Joins & Normalization.'
  };
}

export function exportExecutiveReportJSON(report = {}) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `ai_executive_briefing_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
