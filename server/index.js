import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateTaskIntelligenceScore, analyzeWorkload, generateWhyNowReasoning as generateNbaReasoning } from './services/aiIntelligenceEngine.js';
import { generateSmartDailySchedule } from './services/schedulerEngine.js';
import { generateAdvancedInsights } from './services/insightsEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load .env file without external dependencies
const loadEnv = () => {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = val;
        }
      }
    });
  }
};

loadEnv();

const PORT = process.env.PORT || 3001;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const isGeminiConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 10 && !key.includes('YOUR_KEY_HERE'));
};

const callGeminiAPI = async (systemPrompt, userPrompt, jsonFormat = false) => {
  if (!isGeminiConfigured()) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const apiKey = process.env.GEMINI_API_KEY.trim();
  const endpoint = `${GEMINI_API_URL}?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1000,
      responseMimeType: jsonFormat ? 'application/json' : 'text/plain'
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[geminiService] HTTP Error ${response.status}:`, errText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error('Empty content from Gemini API');
    return rawText;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

const buildCompactContextPrompt = (contextData = {}) => {
  const { profile = {}, tasks = [], goals = [], memories = [], focusStats = {} } = contextData;
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const taskSummaryStr = activeTasks.slice(0, 5).map(t =>
    `- [ID: ${t.id}] "${t.title}" (${t.priority} Priority, ${t.estimatedMinutes || 30} mins, Due: ${t.dueDate || 'Today'})`
  ).join('\n') || 'No pending tasks.';

  const goalSummaryStr = goals.slice(0, 3).map(g =>
    `- "${g.title}" (${g.progress}% completed)`
  ).join('\n') || 'No active goals.';

  const memorySummaryStr = memories.map(m =>
    `- Preference [${m.key}]: ${m.value}`
  ).join('\n') || 'No custom preferences set.';

  return `
[USER CONTEXT SNAPSHOT]
User Name: ${profile.name || 'User'}
Role Track: ${profile.role || 'Student & Engineer'}
Peak Energy: ${profile.peakEnergy || '09:00 - 12:00'}

[PRODUCTIVITY METRICS]
Active Tasks: ${activeTasks.length}
Focus Today: ${focusStats.focusTime || '2h 35m'}

[TOP CANDIDATE TASKS]
${taskSummaryStr}

[ACTIVE GOALS]
${goalSummaryStr}

[USER PREFERENCES & AI MEMORY]
${memorySummaryStr}
`.trim();
};

// HTTP Request Handler
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const parseBody = () => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { resolve({}); }
    });
    req.on('error', err => reject(err));
  });

  const url = req.url;

  // GET /api/health
  if (req.method === 'GET' && url === '/api/health') {
    return sendJSON(200, { status: 'ok', service: 'AI LifeOS Server API', time: new Date().toISOString() });
  }

  // GET /api/ai/status
  if (req.method === 'GET' && url === '/api/ai/status') {
    const configured = isGeminiConfigured();
    return sendJSON(200, {
      success: true,
      configured,
      provider: 'Google Gemini 1.5 Flash',
      message: configured
        ? 'Gemini AI Brain active & ready'
        : 'Gemini API key missing on server. Operating in local fallback mode.'
    });
  }

  // POST /api/ai/intelligence — Workload Analysis & Next Best Action Scores
  if (req.method === 'POST' && url === '/api/ai/intelligence') {
    const { tasks = [], goals = [] } = await parseBody();
    const workload = analyzeWorkload(tasks);

    const active = tasks.filter(t => t.status !== 'Completed');
    let topTask = null;
    let topScores = { totalScore: 0, urgency: 0, importance: 0, risk: 0 };

    active.forEach(t => {
      const scores = calculateTaskIntelligenceScore(t, tasks, goals);
      if (scores.totalScore > topScores.totalScore) {
        topScores = scores;
        topTask = t;
      }
    });

    const reasoning = generateNbaReasoning(topTask, topScores);

    return sendJSON(200, {
      success: true,
      workload,
      nextBestAction: topTask ? {
        task: topTask,
        scores: topScores,
        whyNow: reasoning
      } : null
    });
  }

  // POST /api/ai/plan-day — Daily Schedule Planner
  if (req.method === 'POST' && url === '/api/ai/plan-day') {
    const { tasks = [], availableHours = 4, startHour = 9, calendarEvents = [], preferences = {}, userMemory = [] } = await parseBody();
    const result = generateSmartDailySchedule(tasks, availableHours, startHour, calendarEvents, preferences, userMemory);
    return sendJSON(200, { success: true, ...result });
  }

  // POST /api/ai/insights — Data-driven Productivity Analytics
  if (req.method === 'POST' && url === '/api/ai/insights') {
    const { tasks = [], focusSessions = [], goals = [] } = await parseBody();
    const result = generateAdvancedInsights(tasks, focusSessions, goals);
    return sendJSON(200, { success: true, ...result });
  }

  // POST /api/ai/chat
  if (req.method === 'POST' && url === '/api/ai/chat') {
    const { message, context } = await parseBody();
    if (!message || !message.trim()) {
      return sendJSON(400, { success: false, error: 'Message is required' });
    }

    if (!isGeminiConfigured()) {
      return sendJSON(200, {
        success: false,
        fallbackMode: true,
        message: 'Gemini API key is not configured on server.',
        provider: 'local-fallback'
      });
    }

    try {
      const contextPrompt = buildCompactContextPrompt(context);
      const systemPrompt = `You are AI LifeOS Copilot.\n${contextPrompt}\nProvide concise, actionable advice. If user asks to plan their day or schedule tasks, explain the recommended order and tell them they can also click 'Plan My Day' on the dashboard.`;
      const rawResponse = await callGeminiAPI(systemPrompt, message, false);

      return sendJSON(200, {
        success: true,
        message: rawResponse,
        provider: 'gemini-1.5-flash',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('[POST /api/ai/chat error]:', err.message);
      return sendJSON(200, {
        success: false,
        fallbackMode: true,
        error: err.message,
        provider: 'local-fallback'
      });
    }
  }

  // POST /api/ai/recommendation
  if (req.method === 'POST' && url === '/api/ai/recommendation') {
    const { task, context } = await parseBody();
    if (!isGeminiConfigured() || !task) {
      return sendJSON(200, { success: false, fallbackMode: true, reasoning: null });
    }

    try {
      const contextPrompt = buildCompactContextPrompt(context);
      const systemPrompt = `Analyze task "${task.title}" (${task.priority} Priority). Context:\n${contextPrompt}\nWrite a 2-sentence explanation answering "WHY NOW?".`;
      const reasoning = await callGeminiAPI(systemPrompt, "Provide why-now reasoning.", false);

      return sendJSON(200, { success: true, reasoning: reasoning.trim(), provider: 'gemini-1.5-flash' });
    } catch (err) {
      return sendJSON(200, { success: false, fallbackMode: true, reasoning: null });
    }
  }

  // POST /api/ai/breakdown
  if (req.method === 'POST' && url === '/api/ai/breakdown') {
    const { taskTitle } = await parseBody();
    if (!isGeminiConfigured() || !taskTitle) {
      return sendJSON(200, {
        success: false,
        fallbackMode: true,
        subtasks: [
          { title: `Define requirements for ${taskTitle}`, description: 'Brainstorm core objectives & deliverables', estimatedMinutes: 20, priority: 'High' },
          { title: `Core implementation step for ${taskTitle}`, description: 'Build foundational modules & backend logic', estimatedMinutes: 45, priority: 'High' },
          { title: `Verification & testing phase`, description: 'Execute unit tests and manual verification', estimatedMinutes: 25, priority: 'Medium' }
        ]
      });
    }

    try {
      const systemPrompt = `Break down "${taskTitle}" into 3 to 5 subtasks. Return strictly a JSON array of objects with keys "title", "description", "priority", "estimatedMinutes".`;
      const rawJson = await callGeminiAPI(systemPrompt, `Break down "${taskTitle}"`, true);
      let subtasks = JSON.parse(rawJson);
      return sendJSON(200, { success: true, subtasks, provider: 'gemini-1.5-flash' });
    } catch (err) {
      return sendJSON(200, {
        success: false,
        fallbackMode: true,
        subtasks: [
          { title: `Define requirements for ${taskTitle}`, description: 'Brainstorm core objectives & deliverables', estimatedMinutes: 20, priority: 'High' },
          { title: `Implementation phase for ${taskTitle}`, description: 'Build foundational modules & backend logic', estimatedMinutes: 45, priority: 'High' },
          { title: `Testing & verification`, description: 'Execute unit tests and manual verification', estimatedMinutes: 25, priority: 'Medium' }
        ]
      });
    }
  }

  // 404 Fallback
  return sendJSON(404, { success: false, error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 AI LifeOS Backend API Server listening on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Gemini Configured: ${isGeminiConfigured() ? 'YES' : 'NO (Local Fallback)'}`);
});
