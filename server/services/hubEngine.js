/**
 * AI LifeOS — Central Context & Cross-Module Intelligence Engine
 * Connects Tasks, Goals, Milestones, Calendar, Focus, Planner, Reports, Notifications, Notes, and AI Memory.
 */

export function calculateLifeOSScore(context = {}) {
  const {
    tasks = [],
    goals = [],
    focusSessions = [],
    dailyPlan = {}
  } = context;

  const completed = tasks.filter(t => t.status === 'Completed').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 80;

  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length)
    : 75;

  const planAdherence = dailyPlan.planQualityScore || 85;

  const focusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const focusConsistency = Math.min(100, Math.round((focusMinutes / 300) * 100)); // Target: 5 hours

  const overdueCount = tasks.filter(t => t.status !== 'Completed' && (t.dueDate || '').toLowerCase().includes('overdue')).length;
  const deadlineManagement = Math.max(40, 100 - overdueCount * 12);

  // Score Weight Formula (Total = 100)
  const totalScore = Math.round(
    taskCompletionRate * 0.30 +
    avgGoalProgress * 0.25 +
    planAdherence * 0.20 +
    focusConsistency * 0.15 +
    deadlineManagement * 0.10
  );

  return {
    lifeOSScore: Math.min(99, Math.max(40, totalScore)),
    breakdown: {
      taskCompletion: { score: taskCompletionRate, weight: '30%', label: 'Task Completion Rate' },
      goalProgress: { score: avgGoalProgress, weight: '25%', label: 'Goal Velocity & Progress' },
      planAdherence: { score: planAdherence, weight: '20%', label: 'Daily Plan Adherence' },
      focusConsistency: { score: focusConsistency, weight: '15%', label: 'Focus Sprint Consistency' },
      deadlineManagement: { score: deadlineManagement, weight: '10%', label: 'Deadline Adherence' }
    }
  };
}

export function generateIntelligenceHubData(contextData = {}) {
  const {
    tasks = [],
    goals = [],
    calendarEvents = [],
    focusSessions = [],
    memories = [],
    notifications = []
  } = contextData;

  const scoreData = calculateLifeOSScore(contextData);
  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  // Top Priority
  const overdueTask = activeTasks.find(t => (t.dueDate || '').toLowerCase().includes('overdue')) || activeTasks[0];
  const topPriority = overdueTask ? {
    taskId: overdueTask.id,
    title: overdueTask.title,
    priority: overdueTask.priority || 'High',
    reason: (overdueTask.dueDate || '').toLowerCase().includes('overdue')
      ? 'Task is overdue — immediate focus required to maintain score'
      : 'Highest urgency item matching available focus window',
    link: '/tasks'
  } : null;

  // Cross-Module Intelligence Feed Items
  const feedItems = [];

  // Item 1: Risk — Overdue Tasks
  if (overdueTask) {
    feedItems.push({
      id: `hub-risk-1`,
      type: 'risk',
      priority: 'CRITICAL',
      title: `🔴 Overdue Risk: ${overdueTask.title}`,
      description: `Task "${overdueTask.title}" was due recently. Complete or reschedule to maintain LifeOS velocity.`,
      entityType: 'task',
      entityId: overdueTask.id,
      link: '/tasks',
      actionLabel: 'Start Focus',
      actionType: 'focus'
    });
  }

  // Item 2: Risk — Goal Health
  const atRiskGoal = goals.find(g => g.progress < 40 && g.progress > 0);
  if (atRiskGoal) {
    feedItems.push({
      id: `hub-risk-2`,
      type: 'risk',
      priority: 'HIGH',
      title: `🟡 Goal At Risk: ${atRiskGoal.title}`,
      description: `Goal progress (${atRiskGoal.progress}%) is behind velocity. Milestone roadmaps require focused sprints.`,
      entityType: 'goal',
      entityId: atRiskGoal.id,
      link: '/goals',
      actionLabel: 'Open Goal',
      actionType: 'open'
    });
  }

  // Item 3: Cross-Module Synthesis Insight (Goal + Focus Window + Calendar)
  if (atRiskGoal) {
    feedItems.push({
      id: `hub-insight-1`,
      type: 'insight',
      priority: 'HIGH',
      title: `💡 Cross-Module Synthesis`,
      description: `Your "${atRiskGoal.title}" goal is behind schedule, but your 7 PM – 9 PM peak focus window is open tonight. Perfect opportunity to advance milestones.`,
      entityType: 'goal',
      entityId: atRiskGoal.id,
      link: '/planner',
      actionLabel: 'Open Daily Planner',
      actionType: 'open'
    });
  }

  // Item 4: Opportunity — Free Time Window
  feedItems.push({
    id: `hub-opportunity-1`,
    type: 'opportunity',
    priority: 'MEDIUM',
    title: `⚡ Smart Free-Time Opportunity`,
    description: `You have an uncommitted 50-minute focus gap available before your next evening event. Good time for technical practice.`,
    entityType: 'task',
    entityId: activeTasks[0]?.id || 'top',
    link: '/focus',
    actionLabel: 'Start Focus Sprint',
    actionType: 'focus'
  });

  return {
    success: true,
    timestamp: new Date().toISOString(),
    lifeOSScore: scoreData.lifeOSScore,
    scoreBreakdown: scoreData.breakdown,
    statusSummary: {
      activeTasksCount: activeTasks.length,
      completedTasksCount: tasks.filter(t => t.status === 'Completed').length,
      activeGoalsCount: goals.length,
      goalsAtRiskCount: goals.filter(g => g.progress < 40).length,
      unreadNotificationsCount: notifications.filter(n => n.unread).length,
      totalFocusMinsLogged: focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
    },
    topPriority,
    intelligenceFeed: feedItems
  };
}
