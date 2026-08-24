/**
 * Scheduler Engine — Generates realistic time-blocked schedules based on workload and energy.
 */

import { calculateTaskIntelligenceScore } from './aiIntelligenceEngine.js';

export const generateSmartDailySchedule = (tasks = [], availableHours = 4, startHour = 9) => {
  const activeTasks = tasks
    .filter(t => t.status !== 'Completed')
    .map(t => ({
      ...t,
      score: calculateTaskIntelligenceScore(t, tasks).totalScore
    }))
    .sort((a, b) => b.score - a.score);

  const totalAvailableMins = Math.round(availableHours * 60);
  let remainingMins = totalAvailableMins;
  let currentTimestamp = new Date();
  currentTimestamp.setHours(startHour, 0, 0, 0);

  const scheduleSlots = [];

  for (let i = 0; i < activeTasks.length && remainingMins > 15; i++) {
    const task = activeTasks[i];
    const taskDuration = Math.min(
      remainingMins,
      parseInt(task.estimatedMinutes || task.durationMinutes || 35, 10)
    );

    const startTimeStr = currentTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    currentTimestamp.setMinutes(currentTimestamp.getMinutes() + taskDuration);
    const endTimeStr = currentTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    scheduleSlots.push({
      id: `slot-${Date.now()}-${i}`,
      type: 'task',
      taskId: task.id,
      title: task.title,
      category: task.category || 'General',
      durationMinutes: taskDuration,
      timeWindow: `${startTimeStr} – ${endTimeStr}`,
      status: 'scheduled'
    });

    remainingMins -= taskDuration;

    // Add rest buffer break if time remains
    if (remainingMins >= 10) {
      const breakDuration = 10;
      const breakStart = currentTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      currentTimestamp.setMinutes(currentTimestamp.getMinutes() + breakDuration);
      const breakEnd = currentTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      scheduleSlots.push({
        id: `break-${Date.now()}-${i}`,
        type: 'break',
        title: 'Rest & Recovery Buffer ☕',
        durationMinutes: breakDuration,
        timeWindow: `${breakStart} – ${breakEnd}`,
        status: 'break'
      });

      remainingMins -= breakDuration;
    }
  }

  return {
    totalAvailableMinutes: totalAvailableMins,
    scheduledTasksCount: scheduleSlots.filter(s => s.type === 'task').length,
    schedule: scheduleSlots
  };
};
