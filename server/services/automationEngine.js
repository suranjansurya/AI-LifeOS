/**
 * AI LifeOS — AI Automation & Personal Workflow Engine
 * Trigger -> Condition -> AI Evaluation -> Action -> Approval System -> Execution History
 */

export function getDefaultAutomations() {
  return [
    {
      id: 'auto-1',
      name: 'Smart Daily Planning',
      description: 'Generates an autonomous daily plan every morning at 8:00 AM.',
      status: 'ACTIVE',
      triggerType: 'TIME_BASED',
      triggerConfig: { schedule: 'Every morning at 08:00 AM' },
      conditionConfig: { minTasks: 1 },
      actionConfig: { type: 'GENERATE_DAILY_PLAN', mode: 'Balanced' },
      requiresApproval: false,
      lastRunAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      nextRunAt: new Date(Date.now() + 3600000 * 20).toISOString()
    },
    {
      id: 'auto-2',
      name: 'Deadline Risk Protection',
      description: 'Creates a proactive warning when a High priority task deadline approaches.',
      status: 'ACTIVE',
      triggerType: 'EVENT_BASED',
      triggerConfig: { event: 'TASK_OVERDUE_RISK' },
      conditionConfig: { priority: 'High' },
      actionConfig: { type: 'CREATE_PROACTIVE_INSIGHT' },
      requiresApproval: false,
      lastRunAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      nextRunAt: 'On Trigger'
    },
    {
      id: 'auto-3',
      name: 'Goal Velocity Protection',
      description: 'Alerts when goal progress slips behind expected milestone pace.',
      status: 'ACTIVE',
      triggerType: 'STATE_BASED',
      triggerConfig: { state: 'GOAL_BEHIND_PACE' },
      conditionConfig: { progressLessThan: 50 },
      actionConfig: { type: 'SUGGEST_MILESTONE_SPRINT' },
      requiresApproval: false,
      lastRunAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      nextRunAt: 'On Trigger'
    },
    {
      id: 'auto-4',
      name: 'Focus Sprint Continuation',
      description: 'Suggests the next priority task after completing a focus session.',
      status: 'ACTIVE',
      triggerType: 'EVENT_BASED',
      triggerConfig: { event: 'FOCUS_SESSION_COMPLETED' },
      conditionConfig: { autoPromptNext: true },
      actionConfig: { type: 'PROMPT_NEXT_FOCUS_TASK' },
      requiresApproval: false,
      lastRunAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      nextRunAt: 'On Trigger'
    },
    {
      id: 'auto-5',
      name: 'Automated Task Reschedule (Approval Required)',
      description: 'Proposes moving overdue low-priority tasks to tomorrow.',
      status: 'ACTIVE',
      triggerType: 'EVENT_BASED',
      triggerConfig: { event: 'TASK_OVERDUE' },
      conditionConfig: { priority: 'Low' },
      actionConfig: { type: 'RESCHEDULE_TASK_DATE', newDate: 'Tomorrow' },
      requiresApproval: true,
      lastRunAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      nextRunAt: 'On Trigger'
    }
  ];
}

export function parseNaturalLanguageWorkflow(promptText = '') {
  const lower = promptText.toLowerCase();
  let triggerType = 'TIME_BASED';
  let triggerConfig = { schedule: 'Every morning' };
  let conditionConfig = {};
  let actionConfig = { type: 'GENERATE_AI_REMINDER' };
  let requiresApproval = false;

  if (lower.includes('morning') || lower.includes('daily plan')) {
    triggerType = 'TIME_BASED';
    triggerConfig = { schedule: 'Every morning at 08:00 AM' };
    actionConfig = { type: 'GENERATE_DAILY_PLAN', mode: 'Balanced' };
  } else if (lower.includes('overdue') || lower.includes('task is overdue')) {
    triggerType = 'EVENT_BASED';
    triggerConfig = { event: 'TASK_OVERDUE' };
    actionConfig = { type: 'CREATE_PROACTIVE_INSIGHT' };
  } else if (lower.includes('focus') || lower.includes('finish a focus')) {
    triggerType = 'EVENT_BASED';
    triggerConfig = { event: 'FOCUS_SESSION_COMPLETED' };
    actionConfig = { type: 'PROMPT_NEXT_FOCUS_TASK' };
  } else if (lower.includes('sunday') || lower.includes('weekly')) {
    triggerType = 'TIME_BASED';
    triggerConfig = { schedule: 'Every Sunday at 09:00 PM' };
    actionConfig = { type: 'GENERATE_WEEKLY_REVIEW' };
  }

  if (lower.includes('move') || lower.includes('reschedule') || lower.includes('delete')) {
    requiresApproval = true;
  }

  const name = promptText ? promptText.charAt(0).toUpperCase() + promptText.slice(1) : 'Custom AI Automation';

  return {
    success: true,
    automation: {
      id: `auto-nl-${Date.now()}`,
      name,
      description: `Natural language automation: "${promptText}"`,
      status: 'ACTIVE',
      triggerType,
      triggerConfig,
      conditionConfig,
      actionConfig,
      requiresApproval,
      createdAt: new Date().toISOString()
    }
  };
}

export function executeAutomationRun(automation, eventData = {}, executionDepth = 0) {
  // Loop Protection: Max depth 3
  if (executionDepth > 3) {
    return {
      success: false,
      status: 'FAILED',
      errorMessage: 'Loop protection triggered: Maximum execution depth exceeded (3).'
    };
  }

  if (automation.requiresApproval) {
    return {
      success: true,
      status: 'WAITING_APPROVAL',
      message: `Action requires user approval before execution: ${automation.actionConfig.type}`,
      approvalDetails: {
        automationId: automation.id,
        name: automation.name,
        actionType: automation.actionConfig.type,
        details: `Move task "${eventData.taskTitle || 'DBMS Assignment'}" to Tomorrow.`
      }
    };
  }

  return {
    success: true,
    status: 'SUCCESS',
    executedAt: new Date().toISOString(),
    result: {
      message: `Automation "${automation.name}" executed successfully.`,
      actionTaken: automation.actionConfig.type
    }
  };
}
