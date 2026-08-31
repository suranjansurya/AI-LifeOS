/**
 * AI LifeOS — AI Smart Automation & Routines Frontend Service
 * Workflow builder, smart routines (Morning, Study, Weekly), dry run simulation, and execution.
 */

export function getDefaultAutomations2() {
  return [
    {
      id: 'auto-1',
      name: 'Smart Daily Planning Routine',
      description: 'Generates an autonomous daily plan every morning at 8:00 AM.',
      status: 'Active',
      trigger: 'Every Morning at 8:00 AM',
      condition: 'Active tasks count > 0',
      action: 'Generate Daily Brief & Task Priorities',
      autonomyMode: 'Approval Required',
      lastRun: 'Today 08:00 AM',
      nextRun: 'Tomorrow 08:00 AM'
    },
    {
      id: 'auto-2',
      name: 'Deadline Risk Early Preparation',
      description: 'Creates a focus preparation session when a task deadline is within 24 hours.',
      status: 'Active',
      trigger: 'Task Deadline Approach (< 24h)',
      condition: 'Task priority == High AND Task status != Completed',
      action: 'Schedule 45m Focus Sprint',
      autonomyMode: 'Approval Required',
      lastRun: '2 hours ago',
      nextRun: 'On Trigger'
    },
    {
      id: 'auto-3',
      name: 'Study & Knowledge Gap Review Routine',
      description: 'Prompts revision quiz for topics marked "Needs Review" after completing study sessions.',
      status: 'Active',
      trigger: 'Study Session Completed',
      condition: 'Knowledge topic status == Developing',
      action: 'Generate 5-Question Revision Quiz',
      autonomyMode: 'Approval Required',
      lastRun: 'Yesterday 07:30 PM',
      nextRun: 'On Trigger'
    }
  ];
}

export function getSmartRoutines() {
  return [
    {
      id: 'routine-morning',
      name: 'Morning Intelligence Planning Routine',
      steps: ['Scan Calendar Events', 'Check Priority Backlog', 'Generate Next Best Action', 'Send Daily Brief Notification'],
      frequency: 'Every Morning at 08:00 AM'
    },
    {
      id: 'routine-study',
      name: 'Study & Knowledge Retention Routine',
      steps: ['Identify Low-Score Topics', 'Generate Practice Flashcards', 'Start 50m Focus Session', 'Log Study Activity'],
      frequency: 'On Study Completion'
    },
    {
      id: 'routine-weekly',
      name: 'Weekly LifeOS Performance Review',
      steps: ['Aggregate Completed Tasks', 'Calculate Focus Hours', 'Assess Goal Progress', 'Generate AI Summary Report'],
      frequency: 'Every Sunday at 09:00 PM'
    }
  ];
}

export function runDryRunSimulation(workflow = {}) {
  return {
    isDryRun: true,
    badge: 'DRY RUN / SIMULATION MODE',
    triggerEvaluated: `Trigger [${workflow.trigger || 'Time/Event'}] evaluated TRUE.`,
    conditionEvaluated: `Conditions [${workflow.condition || 'IF High Priority'}] passed validation.`,
    actionPreview: `Action [${workflow.action || 'Generate Task'}] simulated successfully.`,
    outcome: 'Zero database modifications occurred during dry run test.'
  };
}

export function executeAutomationRun(automation = {}, eventData = {}, executionDepth = 0) {
  if (executionDepth > 3) {
    return {
      success: false,
      status: 'FAILED',
      errorMessage: 'Loop protection triggered: Maximum execution depth exceeded (3).'
    };
  }

  if (automation.autonomyMode === 'Approval Required' || automation.requiresApproval) {
    return {
      success: true,
      status: 'WAITING_APPROVAL',
      message: `Action requires user approval before execution: ${automation.action}`,
      approvalDetails: {
        automationId: automation.id,
        name: automation.name,
        actionType: automation.action
      }
    };
  }

  return {
    success: true,
    status: 'SUCCESS',
    executedAt: new Date().toISOString(),
    result: {
      message: `Automation "${automation.name}" executed successfully.`,
      actionTaken: automation.action
    }
  };
}
