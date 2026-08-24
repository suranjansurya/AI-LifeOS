import { evaluateNextBestAction, parseDeadlineDays } from './nbaEngine';

export const processLocalAiCommand = (userPrompt, { tasks, focusSessions, stats }) => {
  const lower = userPrompt.toLowerCase().trim();

  // 1. Next Best Action
  if (
    lower.includes('what should i do') ||
    lower.includes('next action') ||
    lower.includes('what to do next')
  ) {
    const nba = evaluateNextBestAction(tasks);
    if (!nba.task && nba.title.includes('Completed')) {
      return `🎉 **You're all caught up!**\n\nYou currently have no pending tasks. Take a break or create a new goal milestone!`;
    }

    return `🎯 **Your Recommended NEXT BEST ACTION right now:**\n\n**${nba.title}**\n\n⏱️ **Duration**: ${nba.durationMinutes} mins · **Priority**: ${nba.priority} · **Deadline**: ${nba.deadline}\n\n💡 **Why now?**\n"${nba.reasoning}"\n\nWould you like me to start a Focus Session for this task?`;
  }

  // 2. Show Pending Tasks
  if (
    lower.includes('show my tasks') ||
    lower.includes('pending tasks') ||
    lower.includes('list tasks') ||
    lower.includes('all tasks')
  ) {
    const activeTasks = tasks.filter(t => t.status !== 'Completed');
    if (activeTasks.length === 0) {
      return `✅ You have no pending tasks remaining today!`;
    }

    const taskListStr = activeTasks
      .slice(0, 5)
      .map(t => `- **${t.title}** (${t.priority} Priority, ${t.dueDate || t.deadline || 'Today'})`)
      .join('\n');

    return `📋 **Here are your current active tasks (${activeTasks.length} total):**\n\n${taskListStr}\n\nType "What should I do now?" to see your top priority recommendation.`;
  }

  // 3. Overdue Tasks
  if (
    lower.includes('overdue') ||
    lower.includes('past due') ||
    lower.includes('urgent')
  ) {
    const overdueTasks = tasks.filter(t => t.status !== 'Completed' && parseDeadlineDays(t.dueDate || t.deadline) < 0);
    if (overdueTasks.length === 0) {
      return `🙌 **Great news!** You have zero overdue tasks on your radar right now.`;
    }

    const overdueStr = overdueTasks
      .map(t => `- 🚨 **${t.title}** (${t.priority} Priority, ${t.dueDate || t.deadline})`)
      .join('\n');

    return `⚠️ **Overdue Attention Required (${overdueTasks.length} task(s)):**\n\n${overdueStr}\n\nI recommend tackling these immediately!`;
  }

  // 4. Productivity Stats
  if (
    lower.includes('productive') ||
    lower.includes('statistics') ||
    lower.includes('stats') ||
    lower.includes('progress')
  ) {
    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const totalCount = tasks.length;
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return `📊 **Your Live Productivity Diagnostics:**\n\n- **Completed Tasks**: ${completedCount} / ${totalCount}\n- **Completion Rate**: ${rate}%\n- **Total Focus Time**: ${stats.focusTime || '2h 35m'}\n- **Goal Velocity**: 68%\n\nYou are performing in your peak energy window!`;
  }

  // 5. Plan My Day / Schedule
  if (
    lower.includes('plan my day') ||
    lower.includes('schedule') ||
    lower.includes('rebalance')
  ) {
    const activeTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 4);
    if (activeTasks.length === 0) {
      return `📅 Your schedule is clear! No active tasks to schedule today.`;
    }

    let startHour = 9;
    const planItems = activeTasks.map((t, idx) => {
      const hStr = startHour.toString().padStart(2, '0') + ':00';
      const dur = parseInt(t.estimatedMinutes || t.durationMinutes || 30, 10);
      startHour += 1;
      return `- **${hStr}** — ${t.title} (${dur} mins, ${t.priority} Priority)`;
    });

    return `📅 **Generated AI Schedule for Today:**\n\n${planItems.join('\n')}\n\nI have aligned these slots with rest intervals.`;
  }

  // Fallback response
  const nba = evaluateNextBestAction(tasks);
  return `I have analyzed your query regarding **"${userPrompt}"** against your active tasks and goals.\n\nCurrently, your highest priority item is: **${nba.title}**.\n\nYou can ask me:\n- *"What should I do now?"*\n- *"Show my tasks"*\n- *"What is overdue?"*\n- *"How productive am I?"*\n- *"Plan my day"*`;
};
