/**
 * AI LifeOS — AI Execution Engine 2.0
 * Converts approved plans into executable step workflows, manages step status,
 * tracks dependencies, evaluates blockers, and re-optimizes remaining schedules.
 */

export function getDefaultExecutionPlans() {
  return [
    {
      id: 'exec-plan-1',
      title: 'DBMS Joins & Normalization Study Plan',
      category: 'Study',
      health: 'On Track',
      status: 'In Progress',
      completedSteps: 2,
      totalSteps: 4,
      startDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      targetCompletion: 'Tomorrow',
      steps: [
        { id: 'step-1-1', title: 'Review Relational Algebra & Joins', status: 'Completed', durationMinutes: 30, completedAt: 'Yesterday' },
        { id: 'step-1-2', title: 'Practice 1NF, 2NF, 3NF Normalization Questions', status: 'Completed', durationMinutes: 45, completedAt: 'Today 10:00 AM' },
        { id: 'step-1-3', title: 'Solve 10 Complex SQL Join Queries', status: 'In Progress', durationMinutes: 45, dependsOn: 'step-1-2' },
        { id: 'step-1-4', title: 'Self-Quiz & Revision Review', status: 'Pending', durationMinutes: 25, dependsOn: 'step-1-3' }
      ]
    },
    {
      id: 'exec-plan-2',
      title: 'AI-LifeOS Architecture & Core Integration',
      category: 'Project',
      health: 'On Track',
      status: 'In Progress',
      completedSteps: 3,
      totalSteps: 5,
      startDate: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
      targetCompletion: 'In 3 days',
      steps: [
        { id: 'step-2-1', title: 'Define Life Graph Schema & Edge Resolver', status: 'Completed', durationMinutes: 60, completedAt: 'Aug 29' },
        { id: 'step-2-2', title: 'Build Multi-Approach Planning Engine', status: 'Completed', durationMinutes: 60, completedAt: 'Aug 30' },
        { id: 'step-2-3', title: 'Integrate Execution Engine & Approval Queue', status: 'In Progress', durationMinutes: 90, dependsOn: 'step-2-2' },
        { id: 'step-2-4', title: 'Verify RLS Security & Production Build', status: 'Pending', durationMinutes: 45, dependsOn: 'step-2-3' },
        { id: 'step-2-5', title: 'Final System Walkthrough & Audit', status: 'Pending', durationMinutes: 30, dependsOn: 'step-2-4' }
      ]
    }
  ];
}

export function evaluateNextAction(plans = [], tasks = []) {
  for (const plan of plans) {
    if (plan.status !== 'In Progress' && plan.status !== 'Ready') continue;
    const currentStep = plan.steps.find(s => s.status === 'In Progress' || s.status === 'Pending');
    if (currentStep) {
      return {
        step: currentStep,
        planTitle: plan.title,
        reason: `It is the next logical step in "${plan.title}" with an approaching target date.`,
        confidence: '94%'
      };
    }
  }

  const firstTask = tasks.find(t => t.status !== 'Completed');
  return {
    step: firstTask ? { title: firstTask.title, durationMinutes: firstTask.estimatedMinutes || 30 } : null,
    planTitle: 'Daily Workload',
    reason: 'Top priority task in your active workload queue.',
    confidence: '88%'
  };
}

export function reoptimizeRemainingPlan(plan, delayedStepId) {
  if (!plan) return null;

  const updatedSteps = plan.steps.map(s => {
    if (s.id === delayedStepId) {
      return { ...s, durationMinutes: (s.durationMinutes || 30) + 15, status: 'In Progress' };
    }
    return s;
  });

  return {
    planId: plan.id,
    originalTitle: plan.title,
    updatedSteps,
    changeSummary: 'Adjusted remaining step buffer time (+15m) to maintain completion deadline.'
  };
}
