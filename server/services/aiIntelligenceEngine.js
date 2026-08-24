/**
 * AI Intelligence Engine — Server-side task scoring, workload analysis, and recommendation generator.
 */

export const calculateTaskIntelligenceScore = (task, allTasks = [], goals = []) => {
  if (!task) return { totalScore: 0, urgency: 0, importance: 0, risk: 0 };

  let priorityScore = 20;
  if (task.priority === 'Critical') priorityScore = 40;
  else if (task.priority === 'High') priorityScore = 30;
  else if (task.priority === 'Medium') priorityScore = 20;
  else if (task.priority === 'Low') priorityScore = 10;

  // Deadline Proximity Score
  let deadlineScore = 10;
  const due = (task.dueDate || task.deadline || '').toLowerCase();
  if (due.includes('overdue')) deadlineScore = 40;
  else if (due.includes('today')) deadlineScore = 35;
  else if (due.includes('tomorrow')) deadlineScore = 25;
  else if (due.includes('this week') || due.includes('soon')) deadlineScore = 15;

  // Effort Match (Tasks 25-45 mins are sweet spot for immediate focus)
  const duration = parseInt(task.estimatedMinutes || task.durationMinutes || 30, 10);
  let effortScore = 10;
  if (duration >= 20 && duration <= 50) effortScore = 15;
  else if (duration > 50 && duration <= 90) effortScore = 10;

  // Goal Alignment
  let goalScore = 5;
  if (task.category && goals.some(g => (g.category || '').toLowerCase() === task.category.toLowerCase())) {
    goalScore = 10;
  }

  const totalScore = Math.min(100, priorityScore + deadlineScore + effortScore + goalScore);

  const urgency = Math.min(100, deadlineScore * 2.2);
  const importance = Math.min(100, priorityScore * 2.3);
  const risk = deadlineScore >= 35 ? Math.min(100, deadlineScore * 2.4) : 25;

  return {
    totalScore: Math.round(totalScore),
    urgency: Math.round(urgency),
    importance: Math.round(importance),
    risk: Math.round(risk)
  };
};

export const analyzeWorkload = (tasks = []) => {
  const active = tasks.filter(t => t.status !== 'Completed');
  const critical = active.filter(t => t.priority === 'Critical');
  const important = active.filter(t => t.priority === 'High' || t.priority === 'Medium');
  const low = active.filter(t => t.priority === 'Low');
  const overdue = active.filter(t => (t.dueDate || t.deadline || '').toLowerCase().includes('overdue'));

  return {
    totalActive: active.length,
    criticalCount: critical.length,
    importantCount: important.length,
    lowCount: low.length,
    overdueCount: overdue.length
  };
};

export const generateWhyNowReasoning = (task, scores) => {
  if (!task) return 'No pending tasks found. All clear!';

  const due = task.dueDate || task.deadline || 'Today';
  const duration = task.estimatedMinutes || task.durationMinutes || 30;

  if (due.toLowerCase().includes('overdue')) {
    return `🚨 OVERDUE RISK: "${task.title}" is overdue (${duration} mins). Resolving this immediately eliminates your highest risk penalty.`;
  }
  if (due.toLowerCase().includes('today') && task.priority === 'Critical') {
    return `🔥 CRITICAL DEADLINE: High-impact task due today (${duration} mins). Completing it now prevents deadline overflow.`;
  }
  if (task.priority === 'High') {
    return `⚡ OPTIMAL SPRINT: High priority task aligned with your peak analytical focus window (${duration} mins).`;
  }

  return `🎯 HIGH VALUE ACTION: Completing "${task.title}" (${duration} mins) drives key goal momentum for ${task.category || 'General'}.`;
};
