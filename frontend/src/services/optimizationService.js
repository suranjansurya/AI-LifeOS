/**
 * AI LifeOS — AI Life Optimization Frontend Service
 * Detects system bottlenecks, builds multi-option decision matrices, generates change previews,
 * and tracks optimization recommendation outcomes.
 */

export function detectSystemBottlenecks(context = {}) {
  const { tasks = [], projects = [] } = context;
  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  const bottlenecks = [];

  const overdue = activeTasks.find(t => (t.dueDate || '').toLowerCase().includes('tomorrow') || (t.dueDate || '').toLowerCase().includes('overdue'));
  if (overdue) {
    bottlenecks.push({
      id: `bot-${overdue.id}`,
      problem: `Approaching Deadline Bottleneck: "${overdue.title}"`,
      relatedResource: 'Task Backlog',
      impact: 'High Impact on Project Horizon',
      evidence: `Due date is ${overdue.dueDate} and estimated focus time is 45 minutes.`,
      suggestedAction: 'Schedule 45m Focus Sprint'
    });
  }

  bottlenecks.push({
    id: 'bot-m-1',
    problem: 'Pending Approval Bottleneck in DBMS Revision Mission',
    relatedResource: 'Mission Control',
    impact: 'Blocks Phase 4 Self-Quiz Verification',
    evidence: 'Stage 3 finished; Stage 4 waiting for approval.',
    suggestedAction: 'Approve Pending Action'
  });

  return bottlenecks;
}

export function buildDecisionMatrix(context = {}) {
  return [
    {
      option: 'Option A: High-Intensity Sprint (Fast)',
      benefits: 'Completes all 3 tasks in 1 day; eliminates deadline risk',
      costs: 'Requires 3h focus time today; zero buffer time',
      risks: 'Moderate Focus Fatigue',
      effort: 'High',
      time: '1 Day',
      goalImpact: 'High positive (+25% Goal Velocity)'
    },
    {
      option: 'Option B: Balanced Distribution (Recommended)',
      benefits: 'Spreads focus load across 2 days (1.5h/day); builds buffer time',
      costs: 'Completes tasks tomorrow afternoon',
      risks: 'Low Risk',
      effort: 'Medium',
      time: '2 Days',
      goalImpact: 'Optimal steady progress (+20% Goal Velocity)'
    },
    {
      option: 'Option C: Flexible Schedule (Extended)',
      benefits: 'Minimal daily focus load (45m/day); maximum flexibility',
      costs: 'Extends target completion date by 3 days',
      risks: 'Moderate Deadline Risk',
      effort: 'Low',
      time: '3 Days',
      goalImpact: 'Slower progress (+10% Goal Velocity)'
    }
  ];
}

export function generateOptimizationChangePreview(option = {}) {
  return {
    optionName: option.option || 'Option B: Balanced Distribution',
    beforeState: 'Task A Deadline: Today 05:00 PM • Focus Load: 3h Today',
    afterState: 'Task A Deadline: Tomorrow 05:00 PM • Focus Load: 1.5h Today + 1.5h Tomorrow',
    impactSummary: 'Reduces today focus fatigue while maintaining 100% deadline compliance.',
    requiresApproval: true
  };
}
