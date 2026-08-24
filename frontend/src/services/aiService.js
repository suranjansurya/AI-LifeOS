import { processLocalAiCommand } from './aiAssistantEngine';
import { generateWhyNowReasoning } from './nbaEngine';

/**
 * Frontend AI Service Client — Interacts with server /api/ai endpoints
 * with automatic local fallback mode when server or API key is unconfigured.
 */

export const aiService = {
  // Check backend server AI configuration status
  checkStatus: async () => {
    try {
      const res = await fetch('/api/ai/status');
      if (!res.ok) throw new Error(`Status HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        success: false,
        configured: false,
        provider: 'local-fallback',
        message: 'Server offline; operating in local AI engine mode.'
      };
    }
  },

  // Workload Analysis & Next Best Action Intelligence
  getIntelligenceSummary: async (tasks = [], goals = []) => {
    try {
      const res = await fetch('/api/ai/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, goals })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) return data;
    } catch (e) {
      // Fallback
    }

    const active = tasks.filter(t => t.status !== 'Completed');
    return {
      success: true,
      workload: {
        totalActive: active.length,
        criticalCount: active.filter(t => t.priority === 'Critical').length,
        importantCount: active.filter(t => t.priority === 'High' || t.priority === 'Medium').length,
        lowCount: active.filter(t => t.priority === 'Low').length,
        overdueCount: active.filter(t => (t.dueDate || '').toLowerCase().includes('overdue')).length
      },
      nextBestAction: active.length > 0 ? {
        task: active[0],
        scores: { totalScore: 88, urgency: 75, importance: 80, risk: 30 },
        whyNow: `High priority task "${active[0].title}" due soon. Tackle it now for maximum goal progress.`
      } : null
    };
  },

  // Smart Daily Schedule Generator
  generateDailySchedule: async (tasks = [], availableHours = 4, startHour = 9) => {
    try {
      const res = await fetch('/api/ai/plan-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, availableHours, startHour })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) return data;
    } catch (e) {
      // Fallback
    }

    const active = tasks.filter(t => t.status !== 'Completed');
    return {
      success: true,
      totalAvailableMinutes: availableHours * 60,
      scheduledTasksCount: active.length,
      schedule: active.slice(0, 4).map((t, idx) => ({
        id: `slot-${idx}`,
        type: 'task',
        taskId: t.id,
        title: t.title,
        category: t.category || 'General',
        durationMinutes: t.estimatedMinutes || 35,
        timeWindow: `${0 + idx * 1}:00 – ${0 + idx * 1 + 1}:00`,
        status: 'scheduled'
      }))
    };
  },

  // Conversational Copilot Chat
  sendChatMessage: async (message, contextData) => {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context: contextData })
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();

      if (data.success && data.message) {
        return {
          text: data.message,
          provider: data.provider || 'gemini-1.5-flash',
          isLocalFallback: false
        };
      }

      const localResponse = processLocalAiCommand(message, contextData);
      return {
        text: localResponse,
        provider: 'local-engine',
        isLocalFallback: true
      };
    } catch (err) {
      const localResponse = processLocalAiCommand(message, contextData);
      return {
        text: localResponse,
        provider: 'local-engine',
        isLocalFallback: true
      };
    }
  },

  // Dynamic "WHY NOW?" Recommendation Reasoning
  getRecommendationReasoning: async (task, contextData) => {
    if (!task) return generateWhyNowReasoning(null);

    try {
      const res = await fetch('/api/ai/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, context: contextData })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.success && data.reasoning) {
        return data.reasoning;
      }
    } catch (err) {
      // Fallback
    }

    return generateWhyNowReasoning(task);
  },

  // Subtask Breakdown Generator
  getTaskBreakdown: async (taskTitle, contextData) => {
    try {
      const res = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle, context: contextData })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.subtasks && data.subtasks.length > 0) {
        return data.subtasks;
      }
    } catch (err) {
      // Fallback
    }

    return [
      { title: `Define requirements & scope for ${taskTitle}`, estimatedMinutes: 20, priority: 'High' },
      { title: `Implementation & core development step`, estimatedMinutes: 45, priority: 'High' },
      { title: `Testing, verification & refinement`, estimatedMinutes: 25, priority: 'Medium' }
    ];
  }
};
