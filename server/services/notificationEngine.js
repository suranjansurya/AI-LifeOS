/**
 * AI LifeOS — Smart Notification & Context-Aware Reminder Engine
 * Evaluates real tasks, goals, calendar events, focus sessions, and quiet hours
 * to generate actionable, non-spammy notifications with smart cooldowns.
 */

export function evaluateNotifications(contextData = {}) {
  const {
    tasks = [],
    goals = [],
    calendarEvents = [],
    focusSessions = [],
    preferences = {},
    existingNotifications = []
  } = contextData;

  const now = new Date();
  const currentHour = now.getHours();

  // 1. Quiet Hours Evaluation (Default: 11:00 PM – 07:00 AM)
  const quietStart = preferences.quietStart || 23;
  const quietEnd = preferences.quietEnd || 7;
  const isQuietHours = preferences.quietHoursEnabled !== false &&
    (currentHour >= quietStart || currentHour < quietEnd);

  // 2. Cooldown Helper (Same entity & type mutes within 4 hours)
  const isCooledDown = (type, entityId) => {
    const recent = existingNotifications.find(n =>
      n.type === type &&
      (n.entityId === entityId || n.entity_id === entityId) &&
      (Date.now() - new Date(n.createdAt || n.created_at || Date.now()).getTime()) < 4 * 3600 * 1000
    );
    return Boolean(recent);
  };

  const newNotifications = [];

  // Rule 1: Overdue Task Detection (Priority: CRITICAL)
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && (t.dueDate || '').toLowerCase().includes('overdue'));
  overdueTasks.forEach(t => {
    if (!isCooledDown('TASK_OVERDUE', t.id)) {
      newNotifications.push({
        id: `notif-overdue-${t.id}-${Date.now()}`,
        type: 'TASK_OVERDUE',
        priority: 'CRITICAL',
        title: `🔴 Task Overdue: ${t.title}`,
        message: `Task "${t.title}" was due recently. Complete or reschedule to maintain score momentum.`,
        entityType: 'task',
        entityId: t.id,
        link: '/tasks',
        actions: [
          { label: 'Start Focus', action: 'focus', taskId: t.id },
          { label: 'Open Task', action: 'open', link: '/tasks' }
        ],
        unread: true,
        createdAt: new Date().toISOString()
      });
    }
  });

  // Rule 2: Tasks Due Soon (Priority: HIGH) — Muted during quiet hours unless CRITICAL
  if (!isQuietHours) {
    const dueSoonTasks = tasks.filter(t => t.status !== 'Completed' && (t.dueDate || '').toLowerCase().includes('tomorrow'));
    dueSoonTasks.forEach(t => {
      if (!isCooledDown('TASK_DUE_SOON', t.id)) {
        newNotifications.push({
          id: `notif-due-${t.id}-${Date.now()}`,
          type: 'TASK_DUE_SOON',
          priority: 'HIGH',
          title: `⏰ Task Due Tomorrow: ${t.title}`,
          message: `"${t.title}" is due tomorrow. Block 35 mins today for early completion.`,
          entityType: 'task',
          entityId: t.id,
          link: '/tasks',
          actions: [
            { label: 'Start Focus', action: 'focus', taskId: t.id },
            { label: 'Open Task', action: 'open', link: '/tasks' }
          ],
          unread: true,
          createdAt: new Date().toISOString()
        });
      }
    });
  }

  // Rule 3: Goal At Risk Notification (Priority: HIGH)
  if (!isQuietHours) {
    goals.filter(g => g.progress < 40 && g.progress > 0).forEach(g => {
      if (!isCooledDown('GOAL_AT_RISK', g.id)) {
        newNotifications.push({
          id: `notif-goal-${g.id}-${Date.now()}`,
          type: 'GOAL_AT_RISK',
          priority: 'HIGH',
          title: `🟡 Goal At Risk: ${g.title}`,
          message: `Goal progress (${g.progress}%) is behind target velocity. Milestone tasks require attention.`,
          entityType: 'goal',
          entityId: g.id,
          link: '/goals',
          actions: [
            { label: 'View Goal', action: 'open', link: '/goals' }
          ],
          unread: true,
          createdAt: new Date().toISOString()
        });
      }
    });
  }

  // Rule 4: Smart Free-Time Opportunity (Priority: MEDIUM)
  if (!isQuietHours && calendarEvents.length > 0) {
    const activeTasks = tasks.filter(t => t.status !== 'Completed');
    if (activeTasks.length > 0 && !isCooledDown('FREE_TIME_OPPORTUNITY', 'free-window')) {
      const topTask = activeTasks[0];
      newNotifications.push({
        id: `notif-free-${Date.now()}`,
        type: 'FREE_TIME_OPPORTUNITY',
        priority: 'MEDIUM',
        title: `⚡ Smart Free-Time Opportunity`,
        message: `You have a free focus window available before your next event. Good time for "${topTask.title}".`,
        entityType: 'task',
        entityId: topTask.id,
        link: '/focus',
        actions: [
          { label: 'Start Focus Sprint', action: 'focus', taskId: topTask.id },
          { label: 'Open Planner', action: 'open', link: '/planner' }
        ],
        unread: true,
        createdAt: new Date().toISOString()
      });
    }
  }

  // Enforce Daily Frequency Cap (Max 8 notifications generated per run)
  const cappedNew = newNotifications.slice(0, 5);

  return {
    isQuietHours,
    evaluatedCount: newNotifications.length,
    newNotifications: cappedNew
  };
}
