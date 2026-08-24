/**
 * Context Engine — Compresses user productivity state into a compact LLM prompt context.
 */

export const buildCompactContextPrompt = (contextData = {}) => {
  const {
    profile = {},
    tasks = [],
    goals = [],
    memories = [],
    focusStats = {},
    timeContext = {}
  } = contextData;

  const now = timeContext.currentTime || new Date().toLocaleString();
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const overdueTasks = activeTasks.filter(t => {
    const d = t.dueDate || t.deadline || '';
    return d.toLowerCase().includes('overdue');
  });

  const taskSummaryStr = activeTasks.slice(0, 5).map(t =>
    `- [ID: ${t.id}] "${t.title}" (${t.priority} Priority, ${t.estimatedMinutes || t.durationMinutes || 30} mins, Due: ${t.dueDate || t.deadline || 'Today'}, Category: ${t.category || 'General'})`
  ).join('\n') || 'No pending tasks.';

  const goalSummaryStr = goals.slice(0, 3).map(g =>
    `- "${g.title}" (${g.progress}% completed, Category: ${g.category})`
  ).join('\n') || 'No active goals.';

  const memorySummaryStr = memories.map(m =>
    `- Preference [${m.key || 'Note'}]: ${m.value || m.content}`
  ).join('\n') || 'No custom preferences set.';

  return `
[USER CONTEXT SNAPSHOT]
User Name: ${profile.name || 'User'}
Role Track: ${profile.role || 'Student & Engineer'}
Peak Energy Hours: ${profile.peakEnergy || '09:00 - 12:00'}
Current System Time: ${now}

[LIVE PRODUCTIVITY METRICS]
Active Incomplete Tasks: ${activeTasks.length}
Overdue Tasks: ${overdueTasks.length}
Total Focus Time Today: ${focusStats.focusTime || '2h 35m'}
Completion Rate: ${focusStats.completionRate || 80}%

[TOP CANDIDATE TASKS]
${taskSummaryStr}

[ACTIVE GOALS]
${goalSummaryStr}

[USER PREFERENCES & AI MEMORY]
${memorySummaryStr}
`.trim();
};
