/**
 * Scheduler Engine — Generates realistic time-blocked schedules based on workload, deadlines, and calendar events.
 */

import { calculateTaskIntelligenceScore } from './aiIntelligenceEngine.js';

export const generateSmartDailySchedule = (
  tasks = [],
  availableHours = 4,
  startHour = 9,
  calendarEvents = [],
  preferences = {},
  userMemory = []
) => {
  // 1. Calculate Priority Scores & Sort
  const activeTasks = tasks
    .filter(t => t.status !== 'Completed')
    .map(t => {
      const scoring = calculateTaskIntelligenceScore(t, tasks);
      return {
        ...t,
        score: scoring.totalScore,
        whyReason: scoring.reasoning || `${t.priority || 'Medium'} priority item`
      };
    })
    .sort((a, b) => b.score - a.score);

  const totalAvailableMins = Math.round(availableHours * 60);
  let remainingMins = totalAvailableMins;
  let currentTimestamp = new Date();
  currentTimestamp.setHours(startHour, 0, 0, 0);

  const breakDurationMins = parseInt(preferences.breakDuration || 10, 10);
  const scheduleSlots = [];

  // Parse Calendar Busy Blocks
  const busyBlocks = calendarEvents.map(evt => {
    const start = new Date(evt.startTime || Date.now());
    const end = new Date(evt.endTime || Date.now() + 3600000);
    return { title: evt.title || 'Calendar Event', start, end };
  });

  const isOverlapWithBusy = (start, durationMins) => {
    const end = new Date(start.getTime() + durationMins * 60000);
    return busyBlocks.find(b => (start < b.end && end > b.start));
  };

  for (let i = 0; i < activeTasks.length && remainingMins > 15; i++) {
    const task = activeTasks[i];
    const taskDuration = Math.min(
      remainingMins,
      parseInt(task.estimatedMinutes || task.durationMinutes || 35, 10)
    );

    // Skip busy calendar blocks
    let busyConflict = isOverlapWithBusy(currentTimestamp, taskDuration);
    while (busyConflict) {
      // Jump current timestamp to end of busy block
      currentTimestamp = new Date(busyConflict.end.getTime());
      busyConflict = isOverlapWithBusy(currentTimestamp, taskDuration);
    }

    const startTimeStr = currentTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    currentTimestamp.setMinutes(currentTimestamp.getMinutes() + taskDuration);
    const endTimeStr = currentTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    scheduleSlots.push({
      id: `slot-${Date.now()}-${i}`,
      type: 'task',
      taskId: task.id,
      title: task.title,
      category: task.category || 'General',
      priority: task.priority || 'Medium',
      priorityScore: task.score,
      whyReason: task.whyReason,
      durationMinutes: taskDuration,
      timeWindow: `${startTimeStr} – ${endTimeStr}`,
      status: 'scheduled'
    });

    remainingMins -= taskDuration;

    // Add rest buffer break if time remains
    if (remainingMins >= breakDurationMins) {
      let breakConflict = isOverlapWithBusy(currentTimestamp, breakDurationMins);
      while (breakConflict) {
        currentTimestamp = new Date(breakConflict.end.getTime());
        breakConflict = isOverlapWithBusy(currentTimestamp, breakDurationMins);
      }

      const breakStart = currentTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      currentTimestamp.setMinutes(currentTimestamp.getMinutes() + breakDurationMins);
      const breakEnd = currentTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      scheduleSlots.push({
        id: `break-${Date.now()}-${i}`,
        type: 'break',
        title: 'Rest & Recovery Buffer ☕',
        durationMinutes: breakDurationMins,
        timeWindow: `${breakStart} – ${breakEnd}`,
        status: 'break'
      });

      remainingMins -= breakDurationMins;
    }
  }

  // Generate Why This Plan Reasons
  const topTask = activeTasks[0];
  const whyThisPlan = [
    topTask ? `"${topTask.title}" was scheduled first because it scored highest (${topTask.score}/100) due to deadline/priority urgency.` : 'Tasks prioritized based on real urgency and effort matching.',
    `${scheduleSlots.filter(s => s.type === 'task').length} high-impact action items fitted into your ${availableHours}-hour focus window.`,
    `${breakDurationMins}-minute buffer breaks were automatically inserted to prevent cognitive fatigue.`,
    calendarEvents.length > 0 ? `${calendarEvents.length} existing calendar commitments were preserved without overlap.` : 'No conflicting calendar events detected.'
  ];

  return {
    totalAvailableMinutes: totalAvailableMins,
    scheduledTasksCount: scheduleSlots.filter(s => s.type === 'task').length,
    schedule: scheduleSlots,
    whyThisPlan
  };
};
