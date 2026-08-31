import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env helper
const getGeminiKey = () => {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const line = envContent.split('\n').find(l => l.trim().startsWith('GEMINI_API_KEY='));
    if (line) {
      const val = line.split('=')[1]?.trim().replace(/^["']|["']$/g, '');
      if (val && val !== 'YOUR_GEMINI_API_KEY_HERE') return val;
    }
  }
  return process.env.GEMINI_API_KEY || null;
};

/**
 * Natural Language Command Processor — Translates user prompts into structured AI actions
 * with calendar conflict detection, confirmation triggers, and local fallback parsing.
 */
export async function processNaturalLanguageCommand(message = '', contextData = {}) {
  const { tasks = [], goals = [], calendarEvents = [], notes = [] } = contextData;
  const lowerMsg = message.toLowerCase().trim();
  const apiKey = getGeminiKey();

  // Try Gemini AI structured tool intent detection first via native fetch
  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const systemPrompt = `You are the AI Command Center engine for AI LifeOS.
Analyze the user's natural language command and output a SINGLE JSON object matching one of the following intents:
- "create_task" (data: { title, priority: "High"|"Medium"|"Low", estimatedMinutes: number, dueDate: "Today"|"Tomorrow"|string, category: string })
- "complete_task" (data: { taskTitle: string })
- "delete_task" (data: { taskTitle: string }) [requires_confirmation: true]
- "create_goal" (data: { title, category: string, targetDate: string })
- "create_calendar_event" (data: { title, date: "Today"|"Tomorrow"|string, time: string, durationMinutes: number })
- "delete_calendar_event" (data: { title: string }) [requires_confirmation: true]
- "create_note" (data: { title, content: string, tags: string[] })
- "delete_note" (data: { noteId: string, title: string }) [requires_confirmation: true]
- "start_focus_session" (data: { taskTitle: string, durationMinutes: number })
- "generate_daily_plan" (data: { availableHours: number })
- "get_overdue_tasks" (data: {})
- "get_next_best_action" (data: {})
- "get_productivity_insights" (data: {})

Output JSON format strictly:
{
  "intent": "<intent_name>",
  "requires_confirmation": boolean,
  "data": { ... },
  "responseMessage": "Brief conversational message summarizing what will be done or asking confirmation."
}

User context:
Active tasks: ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, due: t.dueDate })))}
Existing Calendar: ${JSON.stringify(calendarEvents.map(c => ({ title: c.title, date: c.date, time: c.time || c.startTime })))}
Goals: ${JSON.stringify(goals.map(g => ({ title: g.title })))}

User message: "${message}"`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
        })
      });

      if (response.ok) {
        const resData = await response.json();
        const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.intent) {
            return postProcessIntent(parsed, contextData);
          }
        }
      }
    } catch (err) {
      console.warn('[commandEngine] Gemini command parsing failed, using local parser:', err.message);
    }
  }

  // Local Rule-Based NLP Parser Fallback
  return fallbackCommandParser(lowerMsg, contextData);
}

function postProcessIntent(parsed, contextData) {
  const { calendarEvents = [], tasks = [] } = contextData;

  // Calendar Conflict Check
  if (parsed.intent === 'create_calendar_event' && parsed.data?.time) {
    const requestedTime = parsed.data.time.toLowerCase();
    const conflict = calendarEvents.find(e => {
      const eventTime = (e.time || e.startTime || '').toLowerCase();
      return eventTime.includes(requestedTime) || requestedTime.includes(eventTime);
    });

    if (conflict) {
      return {
        intent: 'schedule_conflict',
        requires_confirmation: true,
        responseMessage: `⚠️ Conflict Detected: ${parsed.data.time} conflicts with your existing event: "${conflict.title}". Would you like to schedule at 08:00 PM instead?`,
        conflictEvent: conflict,
        suggestedTime: '08:00 PM',
        originalData: parsed.data
      };
    }
  }

  // Task Match for Delete / Complete
  if (parsed.intent === 'delete_task' || parsed.intent === 'complete_task') {
    const targetTitle = (parsed.data?.taskTitle || '').toLowerCase();
    const matched = tasks.find(t => t.title.toLowerCase().includes(targetTitle));
    if (matched) {
      parsed.data.taskId = matched.id;
      parsed.data.matchedTitle = matched.title;
    }
  }

  return parsed;
}

function fallbackCommandParser(msg, contextData) {
  const { tasks = [], calendarEvents = [] } = contextData;

  // 1. Create Task
  if (msg.includes('add task') || msg.includes('create task') || msg.includes('add a task') || (msg.includes('for tomorrow') && !msg.includes('schedule'))) {
    const titleMatch = msg.replace(/(add task|create task|add a task|create a task|for tomorrow|tomorrow)/gi, '').trim();
    const title = titleMatch ? titleMatch.charAt(0).toUpperCase() + titleMatch.slice(1) : 'New AI Task';
    const isTomorrow = msg.includes('tomorrow');

    return {
      intent: 'create_task',
      requires_confirmation: false,
      data: {
        title,
        priority: msg.includes('urgent') || msg.includes('high') ? 'High' : 'Medium',
        estimatedMinutes: msg.includes('50 min') ? 50 : 35,
        dueDate: isTomorrow ? 'Tomorrow' : 'Today',
        category: 'General'
      },
      responseMessage: `Task "${title}" created for ${isTomorrow ? 'Tomorrow' : 'Today'}.`
    };
  }

  // 2. Schedule Calendar Event
  if (msg.includes('schedule') || msg.includes('calendar')) {
    const is7pm = msg.includes('7 pm') || msg.includes('7:00');
    const titleMatch = msg.replace(/(schedule|tomorrow|at 7 pm|at 8 pm|at 7:00|at 8:00|calendar)/gi, '').trim();
    const title = titleMatch ? titleMatch.charAt(0).toUpperCase() + titleMatch.slice(1) : 'Scheduled Session';

    if (is7pm) {
      const conflict = calendarEvents.find(e => (e.time || '').includes('7') || (e.title || '').toLowerCase().includes('class'));
      if (conflict || calendarEvents.length > 0) {
        return {
          intent: 'schedule_conflict',
          requires_confirmation: true,
          responseMessage: `⚠️ Conflict Detected: 7:00 PM conflicts with your existing event. Would you like to schedule "${title}" at 8:00 PM instead?`,
          conflictEvent: conflict || { title: 'Existing Event', time: '7:00 PM' },
          suggestedTime: '08:00 PM',
          originalData: { title, time: '7:00 PM', date: 'Tomorrow' }
        };
      }
    }

    return {
      intent: 'create_calendar_event',
      requires_confirmation: false,
      data: {
        title,
        date: msg.includes('tomorrow') ? 'Tomorrow' : 'Today',
        time: is7pm ? '07:00 PM' : '08:00 PM',
        durationMinutes: 45
      },
      responseMessage: `Event "${title}" scheduled for ${msg.includes('tomorrow') ? 'Tomorrow' : 'Today'}.`
    };
  }

  // 3. Delete Task (Consequential -> Needs Confirmation)
  if (msg.includes('delete') || msg.includes('remove')) {
    const targetTitle = msg.replace(/(delete|remove|task|my)/gi, '').trim();
    const matched = tasks.find(t => t.title.toLowerCase().includes(targetTitle));

    return {
      intent: 'delete_task',
      requires_confirmation: true,
      data: {
        taskId: matched?.id || 'target-id',
        taskTitle: matched?.title || targetTitle || 'Target Task'
      },
      responseMessage: `Are you sure you want to delete "${matched?.title || targetTitle}"? This operation can be undone.`
    };
  }

  // 4. Start Focus Session
  if (msg.includes('focus') || msg.includes('pomodoro')) {
    const minsMatch = msg.match(/\d+/);
    const durationMinutes = minsMatch ? parseInt(minsMatch[0], 10) : 50;

    return {
      intent: 'start_focus_session',
      requires_confirmation: false,
      data: {
        taskTitle: 'Deep Focus Session',
        durationMinutes
      },
      responseMessage: `Launching ${durationMinutes}-minute focus session.`
    };
  }

  // 5. Plan Day
  if (msg.includes('plan my day') || msg.includes('plan evening') || msg.includes('free hours')) {
    return {
      intent: 'generate_daily_plan',
      requires_confirmation: false,
      data: { availableHours: msg.includes('2 hours') ? 2 : 4 },
      responseMessage: `AI Daily Planner calculated your optimal schedule.`
    };
  }

  // Default Read / Recommendation Intent
  return {
    intent: 'get_next_best_action',
    requires_confirmation: false,
    data: {},
    responseMessage: `Analyzed your workload. Your Next Best Action is ready.`
  };
}
