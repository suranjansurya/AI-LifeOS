/**
 * Deterministic Local Recommendation Engine for NEXT BEST ACTION
 */

// Helper to compute deadline difference in days
export const parseDeadlineDays = (deadlineStr) => {
  if (!deadlineStr) return 7;
  const lower = String(deadlineStr).toLowerCase();
  
  if (lower.includes('overdue')) return -1;
  if (lower.includes('today')) return 0;
  if (lower.includes('tomorrow')) return 1;

  // Try parsing ISO or YYYY-MM-DD date
  const parsedDate = new Date(deadlineStr);
  if (!isNaN(parsedDate.getTime())) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsedDate.setHours(0, 0, 0, 0);
    const diffTime = parsedDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (lower.includes('2 days') || lower.includes('friday')) return 2;
  if (lower.includes('3 days') || lower.includes('saturday')) return 3;
  if (lower.includes('5 days') || lower.includes('monday')) return 5;

  return 5;
};

export const calculateTaskScore = (task) => {
  let score = 0;

  // 1. Priority Score
  switch (task.priority) {
    case 'Critical':
      score += 40;
      break;
    case 'High':
      score += 30;
      break;
    case 'Medium':
      score += 20;
      break;
    case 'Low':
    default:
      score += 10;
      break;
  }

  // 2. Deadline Proximity
  const diffDays = parseDeadlineDays(task.dueDate || task.deadline);
  if (diffDays < 0) {
    score += 40; // Overdue bonus
  } else if (diffDays === 0) {
    score += 35; // Due today
  } else if (diffDays === 1) {
    score += 25; // Due tomorrow
  } else if (diffDays <= 3) {
    score += 15; // Due soon
  } else {
    score += 5;
  }

  // 3. Status momentum
  if (task.status === 'In Progress') {
    score += 15;
  }

  // 4. Effort bonus/penalty
  const duration = parseInt(task.estimatedMinutes || task.durationMinutes || 30, 10);
  if (duration >= 15 && duration <= 45) {
    score += 10; // Sweet spot
  } else if (duration > 90) {
    score -= 5;
  }

  return score;
};

export const generateWhyNowReasoning = (task) => {
  if (!task) return "All tasks completed! Take a well-deserved break or create a new goal milestone.";

  const diffDays = parseDeadlineDays(task.dueDate || task.deadline);
  const duration = parseInt(task.estimatedMinutes || task.durationMinutes || 30, 10);

  if (diffDays < 0) {
    return `This task is overdue and holds your highest risk factor. Completing it immediately clears your schedule bottleneck.`;
  }

  if (diffDays === 0) {
    return `This task has a ${task.priority} priority and is due today. Completing it now directly advances your ${task.category || 'primary'} goal.`;
  }

  if (diffDays === 1) {
    return `This task has a ${task.priority} priority and is due tomorrow. Working on it today (${duration} mins) eliminates deadline pressure.`;
  }

  if (duration <= 30) {
    return `This task has a short estimated duration (${duration} mins) and high priority (${task.priority}). It offers an immediate quick-win output.`;
  }

  return `This task currently holds the highest weighted value across your priority matrix and deadline schedule.`;
};

export const evaluateNextBestAction = (tasks = []) => {
  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  if (activeTasks.length === 0) {
    return {
      task: null,
      title: 'All Tasks Completed! 🎉',
      durationMinutes: 0,
      priority: 'Low',
      deadline: 'None',
      reasoning: 'You have zero pending tasks for today. Take a break or create a new goal milestone!',
      category: 'Rest',
      score: 0
    };
  }

  // Rank active tasks by score
  const scoredTasks = activeTasks.map(task => ({
    ...task,
    score: calculateTaskScore(task)
  })).sort((a, b) => b.score - a.score);

  const topTask = scoredTasks[0];

  return {
    ...topTask,
    durationMinutes: parseInt(topTask.estimatedMinutes || topTask.durationMinutes || 35, 10),
    deadline: topTask.dueDate || topTask.deadline || 'Today',
    reasoning: generateWhyNowReasoning(topTask)
  };
};
