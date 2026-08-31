import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateTaskIntelligenceScore, analyzeWorkload, generateWhyNowReasoning as generateNbaReasoning } from './services/aiIntelligenceEngine.js';
import { generateSmartDailySchedule } from './services/schedulerEngine.js';
import { generateAdvancedInsights } from './services/insightsEngine.js';
import { processNaturalLanguageCommand } from './services/commandEngine.js';
import { generateAiGoalBreakdown, generateAiGoalAnalysis, calculateGoalHealth } from './services/goalEngine.js';
import { calculateProductivityAnalytics } from './services/analyticsEngine.js';
import { generateProductivityReport } from './services/reportEngine.js';
import { evaluateNotifications } from './services/notificationEngine.js';
import { scanForSecretsAndSensitiveData, checkForDuplicatesOrConflicts, retrieveRelevantMemories } from './services/memoryEngine.js';
import { generateAutonomousDailyPlan } from './services/plannerEngine2.js';
import { generateIntelligenceHubData } from './services/hubEngine.js';
import { generateProactiveInsights } from './services/predictiveEngine.js';
import { getDefaultAutomations, parseNaturalLanguageWorkflow, executeAutomationRun } from './services/automationEngine.js';
import { performGlobalKnowledgeSearch, generateKnowledgeGraphData, generateMemorySuggestions } from './services/knowledgeEngine.js';
import { routeCopilotRequest } from './services/copilotEngine.js';
import { calculateFinanceOverview, generateFinanceInsights, generateAiBudgetProposal, generateWhatIfScenario } from './services/financeEngine.js';
import { calculateStudyOverview, generateAiQuiz, generateAiTopicExplanation, generateAiFlashcards } from './services/studyEngine.js';
import { calculateHabitOverview, generateAiRoutineProposal } from './services/habitEngine.js';
import { calculateWellnessOverview, generateAiWellnessPlanProposal } from './services/wellnessEngine.js';
import { calculateProjectOverview, generateAiProjectPlanProposal } from './services/projectEngine.js';
import { calculatePeopleOverview, generateAiMessageDraft } from './services/communicationEngine.js';
import { calculateResearchOverview, generateAiResearchReport } from './services/researchEngine.js';

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

// Helper to check if Gemini API key exists
const isGeminiConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== 'YOUR_GEMINI_API_KEY_HERE' && key.trim().length > 0);
};

// Call Gemini API via native fetch
const callGeminiApi = async (prompt, systemInstruction = '') => {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API key is not configured in server/.env');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API HTTP Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Empty or invalid response structure from Gemini API');
  }

  return textOutput;
};

// Create HTTP Server
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
      provider: 'Google Gemini 2.5 Flash',
      message: configured
        ? 'Gemini AI Brain active & ready'
        : 'Gemini API key missing on server. Operating in local fallback mode.'
    });
  }

  // POST /api/ai/research/overview — Research Intelligence 2.0 Engine
  if (req.method === 'POST' && url === '/api/ai/research/overview') {
    try {
      const { researchProjects = [], sources = [], notes = [] } = await parseBody();
      const overview = calculateResearchOverview(researchProjects, sources, notes);
      return sendJSON(200, overview);
    } catch (err) {
      console.error('[server] POST /api/ai/research/overview error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/research/generate-report — AI Research Report Generator
  if (req.method === 'POST' && url === '/api/ai/research/generate-report') {
    try {
      const { researchTitle = 'AI Personal Assistant Architecture' } = await parseBody();
      const reportRes = generateAiResearchReport(researchTitle);
      return sendJSON(200, reportRes);
    } catch (err) {
      console.error('[server] POST /api/ai/research/generate-report error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/people/overview — Personal CRM & Communication Engine
  if (req.method === 'POST' && url === '/api/ai/people/overview') {
    try {
      const { people = [], interactions = [], tasks = [] } = await parseBody();
      const overview = calculatePeopleOverview(people, interactions, tasks);
      return sendJSON(200, overview);
    } catch (err) {
      console.error('[server] POST /api/ai/people/overview error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/people/draft-message — AI Message & Email Drafter
  if (req.method === 'POST' && url === '/api/ai/people/draft-message') {
    try {
      const { personName = 'Mentor', purpose = 'Follow up on project milestone', tone = 'Professional' } = await parseBody();
      const draftRes = generateAiMessageDraft(personName, purpose, tone);
      return sendJSON(200, draftRes);
    } catch (err) {
      console.error('[server] POST /api/ai/people/draft-message error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/projects/overview — Project Management Suite Engine
  if (req.method === 'POST' && url === '/api/ai/projects/overview') {
    try {
      const { projects = [], tasks = [] } = await parseBody();
      const overview = calculateProjectOverview(projects, tasks);
      return sendJSON(200, overview);
    } catch (err) {
      console.error('[server] POST /api/ai/projects/overview error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/projects/plan-proposal — AI Project Plan Generator Proposal
  if (req.method === 'POST' && url === '/api/ai/projects/plan-proposal') {
    try {
      const { projectName = 'AI-LifeOS System' } = await parseBody();
      const proposal = generateAiProjectPlanProposal(projectName);
      return sendJSON(200, proposal);
    } catch (err) {
      console.error('[server] POST /api/ai/projects/plan-proposal error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/wellness/overview — Lifestyle & Wellness Intelligence Engine
  if (req.method === 'POST' && url === '/api/ai/wellness/overview') {
    try {
      const { checkins = [], focusSessions = [] } = await parseBody();
      const overview = calculateWellnessOverview(checkins, focusSessions);
      return sendJSON(200, overview);
    } catch (err) {
      console.error('[server] POST /api/ai/wellness/overview error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/wellness/plan-proposal — AI Wellness Planner Proposal
  if (req.method === 'POST' && url === '/api/ai/wellness/plan-proposal') {
    try {
      const proposal = generateAiWellnessPlanProposal();
      return sendJSON(200, proposal);
    } catch (err) {
      console.error('[server] POST /api/ai/wellness/plan-proposal error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/habits/overview — Habit & Routine Overview Engine
  if (req.method === 'POST' && url === '/api/ai/habits/overview') {
    try {
      const { habits = [], completions = [] } = await parseBody();
      const overview = calculateHabitOverview(habits, completions);
      return sendJSON(200, overview);
    } catch (err) {
      console.error('[server] POST /api/ai/habits/overview error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/habits/routine-proposal — AI Routine Builder Proposal
  if (req.method === 'POST' && url === '/api/ai/habits/routine-proposal') {
    try {
      const { timeOfDay = 'Morning' } = await parseBody();
      const proposal = generateAiRoutineProposal(timeOfDay);
      return sendJSON(200, proposal);
    } catch (err) {
      console.error('[server] POST /api/ai/habits/routine-proposal error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/study/overview — Study & Learning Overview Engine
  if (req.method === 'POST' && url === '/api/ai/study/overview') {
    try {
      const { subjects = [], topics = [], studySessions = [], quizzes = [] } = await parseBody();
      const overview = calculateStudyOverview(subjects, topics, studySessions, quizzes);
      return sendJSON(200, overview);
    } catch (err) {
      console.error('[server] POST /api/ai/study/overview error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/study/quiz — AI Practice Quiz Generator
  if (req.method === 'POST' && url === '/api/ai/study/quiz') {
    try {
      const { subject = 'DBMS', topic = 'Joins', difficulty = 'Intermediate' } = await parseBody();
      const quizResult = generateAiQuiz(subject, topic, difficulty);
      return sendJSON(200, quizResult);
    } catch (err) {
      console.error('[server] POST /api/ai/study/quiz error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/study/flashcards — AI Flashcard Generator
  if (req.method === 'POST' && url === '/api/ai/study/flashcards') {
    try {
      const { subject = 'DBMS', topic = 'Joins' } = await parseBody();
      const flashcardResult = generateAiFlashcards(subject, topic);
      return sendJSON(200, flashcardResult);
    } catch (err) {
      console.error('[server] POST /api/ai/study/flashcards error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/finance/overview — Finance Intelligence Overview & Insights
  if (req.method === 'POST' && url === '/api/ai/finance/overview') {
    try {
      const { transactions = [], budgets = [], accounts = [] } = await parseBody();
      const overview = calculateFinanceOverview(transactions, budgets, accounts);
      const insights = generateFinanceInsights(transactions, budgets);
      return sendJSON(200, { success: true, ...overview, ...insights });
    } catch (err) {
      console.error('[server] POST /api/ai/finance/overview error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/finance/what-if — What-If Financial Simulation Planner
  if (req.method === 'POST' && url === '/api/ai/finance/what-if') {
    try {
      const { savingsTarget = 2000, categoryReduction = 'Food', reductionAmount = 1000 } = await parseBody();
      const sim = generateWhatIfScenario(savingsTarget, categoryReduction, reductionAmount);
      return sendJSON(200, sim);
    } catch (err) {
      console.error('[server] POST /api/ai/finance/what-if error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/finance/budget-proposal — AI Budget Proposal Generator
  if (req.method === 'POST' && url === '/api/ai/finance/budget-proposal') {
    try {
      const { monthlyIncome = 50000 } = await parseBody();
      const proposal = generateAiBudgetProposal(monthlyIncome);
      return sendJSON(200, proposal);
    } catch (err) {
      console.error('[server] POST /api/ai/finance/budget-proposal error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/copilot — Personal AI Copilot & Multi-Agent Router
  if (req.method === 'POST' && url === '/api/ai/copilot') {
    try {
      const { prompt = '', context = {} } = await parseBody();
      const result = await routeCopilotRequest(prompt, context);
      return sendJSON(200, result);
    } catch (err) {
      console.error('[server] POST /api/ai/copilot error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/knowledge/search — Global & Semantic Knowledge Search
  if (req.method === 'POST' && url === '/api/ai/knowledge/search') {
    try {
      const { query = '', context = {} } = await parseBody();
      const result = performGlobalKnowledgeSearch(query, context);
      return sendJSON(200, result);
    } catch (err) {
      console.error('[server] POST /api/ai/knowledge/search error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/knowledge/graph — Knowledge Graph Visualizer Data
  if (req.method === 'POST' && url === '/api/ai/knowledge/graph') {
    try {
      const context = await parseBody();
      const graphResult = generateKnowledgeGraphData(context);
      const suggestionsResult = generateMemorySuggestions(context);
      return sendJSON(200, { ...graphResult, ...suggestionsResult });
    } catch (err) {
      console.error('[server] POST /api/ai/knowledge/graph error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/automations/parse — Natural Language Automation Parser
  if (req.method === 'POST' && url === '/api/ai/automations/parse') {
    try {
      const { prompt = '' } = await parseBody();
      const result = parseNaturalLanguageWorkflow(prompt);
      return sendJSON(200, result);
    } catch (err) {
      console.error('[server] POST /api/ai/automations/parse error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // GET /api/ai/automations — Get All Active Automations
  if (req.method === 'GET' && url === '/api/ai/automations') {
    return sendJSON(200, { success: true, automations: getDefaultAutomations() });
  }

  // POST /api/ai/command — Natural Language AI Command Center Processor
  if (req.method === 'POST' && url === '/api/ai/command') {
    try {
      const { message = '', context = {} } = await parseBody();
      const actionResult = await processNaturalLanguageCommand(message, context);
      return sendJSON(200, { success: true, ...actionResult });
    } catch (err) {
      console.error('[server] POST /api/ai/command error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/proactive — Proactive Assistant & Predictive Intelligence
  if (req.method === 'POST' && url === '/api/ai/proactive') {
    try {
      const context = await parseBody();
      const proactiveResult = generateProactiveInsights(context);
      return sendJSON(200, proactiveResult);
    } catch (err) {
      console.error('[server] POST /api/ai/proactive error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/hub — Central Context & Intelligence Hub
  if (req.method === 'POST' && url === '/api/ai/hub') {
    try {
      const context = await parseBody();
      const hubResult = generateIntelligenceHubData(context);
      return sendJSON(200, hubResult);
    } catch (err) {
      console.error('[server] POST /api/ai/hub error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/plan-day-2 — AI Life Planner 2.0 Autonomous Daily Execution Engine
  if (req.method === 'POST' && url === '/api/ai/plan-day-2') {
    try {
      const params = await parseBody();
      const planResult = generateAutonomousDailyPlan(params);
      return sendJSON(200, planResult);
    } catch (err) {
      console.error('[server] POST /api/ai/plan-day-2 error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/memories/scan — Security & Duplicate Scanner
  if (req.method === 'POST' && url === '/api/ai/memories/scan') {
    try {
      const { content = '', existingMemories = [] } = await parseBody();

      // 1. Secret & Sensitive Data Filter
      const secResult = scanForSecretsAndSensitiveData(content);
      if (secResult.isSensitive) {
        return sendJSON(200, { success: false, ...secResult });
      }

      // 2. Duplicate / Conflict Check
      const dupResult = checkForDuplicatesOrConflicts(content, existingMemories);
      if (dupResult.isDuplicate) {
        return sendJSON(200, { success: true, isDuplicate: true, ...dupResult });
      }

      return sendJSON(200, { success: true, isSensitive: false, isDuplicate: false });
    } catch (err) {
      console.error('[server] POST /api/ai/memories/scan error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/evaluate-notifications — Smart Notification Engine
  if (req.method === 'POST' && url === '/api/ai/evaluate-notifications') {
    try {
      const context = await parseBody();
      const result = evaluateNotifications(context);
      return sendJSON(200, { success: true, ...result });
    } catch (err) {
      console.error('[server] POST /api/ai/evaluate-notifications error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/generate-report — AI Weekly & Monthly Intelligence Report Engine
  if (req.method === 'POST' && url === '/api/ai/generate-report') {
    try {
      const { reportType = 'weekly', context = {} } = await parseBody();
      const reportResult = await generateProductivityReport(reportType, context);
      return sendJSON(200, reportResult);
    } catch (err) {
      console.error('[server] POST /api/ai/generate-report error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/productivity-insights — AI Productivity Intelligence Engine
  if (req.method === 'POST' && url === '/api/ai/productivity-insights') {
    try {
      const context = await parseBody();
      const analytics = calculateProductivityAnalytics(context);

      let aiSummary = null;
      if (isGeminiConfigured() && analytics.hasData) {
        try {
          const prompt = `Synthesize 3 concise actionable productivity insights from these real metrics:
Score: ${analytics.productivityScore}/100, Completion: ${analytics.workload.completionRate}%, Focus Time: ${analytics.focusStats.focusTimeFormatted}, Overdue: ${analytics.workload.overdueCount}.
Output JSON format array:
[
  { "type": "trend"|"risk"|"goal"|"focus", "title": "Insight Title", "message": "1 sentence explanation.", "recommendation": "1 actionable step" }
]`;
          const output = await callGeminiApi(prompt);
          const jsonMatch = output.match(/\[[\s\S]*\]/);
          if (jsonMatch) aiSummary = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.warn('[server] Insights Gemini call failed, using engine metrics:', e.message);
        }
      }

      return sendJSON(200, {
        success: true,
        analytics,
        aiInsights: aiSummary || [
          {
            type: 'trend',
            title: '📈 Positive Velocity',
            message: `Task completion rate reached ${analytics.workload.completionRate}% this week (+${analytics.weeklyComparison.taskChangePercent}%).`,
            recommendation: 'Maintain your morning focus sprint routine.'
          },
          {
            type: 'focus',
            title: '⏱ Peak Focus Window',
            message: `Your highest productive output occurs during ${analytics.focusStats.bestPeriod}.`,
            recommendation: 'Schedule high-priority tasks in your peak window.'
          }
        ]
      });
    } catch (err) {
      console.error('[server] POST /api/ai/productivity-insights error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/breakdown-goal — AI Goal Milestone Decomposition
  if (req.method === 'POST' && url === '/api/ai/breakdown-goal') {
    try {
      const { goalTitle = '', timeframeText = '30 Days', context = {} } = await parseBody();
      const result = await generateAiGoalBreakdown(goalTitle, timeframeText, context);
      return sendJSON(200, result);
    } catch (err) {
      console.error('[server] POST /api/ai/breakdown-goal error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/analyze-goal — AI Goal Diagnostic Analysis
  if (req.method === 'POST' && url === '/api/ai/analyze-goal') {
    try {
      const { goal, linkedTasks = [], milestones = [] } = await parseBody();
      const result = await generateAiGoalAnalysis(goal, linkedTasks, milestones);
      return sendJSON(200, result);
    } catch (err) {
      console.error('[server] POST /api/ai/analyze-goal error:', err.message);
      return sendJSON(500, { success: false, error: err.message });
    }
  }

  // POST /api/ai/intelligence — Workload Analysis & Next Best Action Scores
  if (req.method === 'POST' && url === '/api/ai/intelligence') {
    const { tasks = [], goals = [] } = await parseBody();
    const workload = analyzeWorkload(tasks);

    const active = tasks.filter(t => t.status !== 'Completed');
    const scoredTasks = active.map(t => ({
      task: t,
      scores: calculateTaskIntelligenceScore(t, active)
    })).sort((a, b) => b.scores.totalScore - a.scores.totalScore);

    const topAction = scoredTasks.length > 0 ? {
      task: scoredTasks[0].task,
      scores: scoredTasks[0].scores,
      whyNow: generateNbaReasoning(scoredTasks[0].task)
    } : null;

    return sendJSON(200, {
      success: true,
      workload,
      nextBestAction: topAction,
      rankedTasks: scoredTasks
    });
  }

  // POST /api/ai/plan-day — Smart Daily Schedule Planner
  if (req.method === 'POST' && url === '/api/ai/plan-day') {
    const { tasks = [], availableHours = 4, startHour = 9, calendarEvents = [], preferences = {}, userMemory = [] } = await parseBody();
    const planResult = generateSmartDailySchedule(tasks, availableHours, startHour, calendarEvents, preferences, userMemory);
    return sendJSON(200, planResult);
  }

  // POST /api/ai/breakdown — Subtask Decomposition Generator
  if (req.method === 'POST' && url === '/api/ai/breakdown') {
    const { taskTitle = 'Complex Task', context = {} } = await parseBody();
    if (isGeminiConfigured()) {
      try {
        const prompt = `Decompose the task titled "${taskTitle}" into 3 to 4 actionable subtasks.
Output JSON format array:
[
  {"title": "Subtask title", "description": "Brief instruction", "estimatedMinutes": 20, "priority": "High"|"Medium"}
]`;
        const output = await callGeminiApi(prompt);
        const jsonMatch = output.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const subtasks = JSON.parse(jsonMatch[0]);
          return sendJSON(200, { success: true, subtasks });
        }
      } catch (err) {
        console.warn('[server] Breakdown Gemini call failed, using engine fallback:', err.message);
      }
    }

    return sendJSON(200, {
      success: true,
      subtasks: [
        { title: `Define requirements & scope for ${taskTitle}`, description: 'Document main goals and constraints', estimatedMinutes: 20, priority: 'High' },
        { title: `Execution & core implementation step`, description: 'Build primary functionality', estimatedMinutes: 45, priority: 'High' },
        { title: `Review, verification & refinement`, description: 'Test functionality and fix bugs', estimatedMinutes: 25, priority: 'Medium' }
      ]
    });
  }

  // POST /api/ai/chat — Conversational AI Copilot Chat Endpoint
  if (req.method === 'POST' && url === '/api/ai/chat') {
    try {
      const { message, context } = await parseBody();

      if (!message || !message.trim()) {
        return sendJSON(400, { success: false, error: 'Message is required' });
      }

      if (!isGeminiConfigured()) {
        return sendJSON(200, {
          success: true,
          provider: 'local-fallback',
          isLocalFallback: true,
          message: null
        });
      }

      const systemInstruction = `You are AI LifeOS Copilot, an elite personal productivity OS assistant.
Respond concisely in GitHub Markdown. Help the user prioritize tasks, manage energy, and optimize focus.
User Context:
Profile: ${JSON.stringify(context?.profile || {})}
Tasks Summary: ${context?.tasks?.length || 0} tasks (${context?.tasks?.filter(t => t.status === 'Completed').length || 0} completed)
Goals: ${context?.goals?.map(g => g.title).join(', ') || 'None'}`;

      const replyText = await callGeminiApi(message, systemInstruction);

      return sendJSON(200, {
        success: true,
        provider: 'gemini-2.5-flash',
        isLocalFallback: false,
        message: replyText
      });

    } catch (err) {
      console.error('[server] POST /api/ai/chat error:', err.message);
      return sendJSON(200, {
        success: true,
        provider: 'local-fallback',
        isLocalFallback: true,
        message: null,
        error: err.message
      });
    }
  }

  // POST /api/ai/recommendation — Dynamic "WHY NOW?" Reasoning Endpoint
  if (req.method === 'POST' && url === '/api/ai/recommendation') {
    try {
      const { task, context } = await parseBody();

      if (!task) {
        return sendJSON(400, { success: false, error: 'Task object is required' });
      }

      if (!isGeminiConfigured()) {
        return sendJSON(200, {
          success: true,
          provider: 'local-fallback',
          reasoning: generateNbaReasoning(task)
        });
      }

      const prompt = `Explain in 2 to 3 punchy sentences why the task "${task.title}" (Priority: ${task.priority}, Deadline: ${task.dueDate || task.deadline || 'Today'}) is the user's optimal Next Best Action right now.`;
      const reasoningText = await callGeminiApi(prompt);

      return sendJSON(200, {
        success: true,
        provider: 'gemini-2.5-flash',
        reasoning: reasoningText
      });

    } catch (err) {
      console.error('[server] POST /api/ai/recommendation error:', err.message);
      return sendJSON(200, {
        success: true,
        provider: 'local-fallback',
        reasoning: generateNbaReasoning(req.body?.task)
      });
    }
  }

  // 404 Route
  return sendJSON(404, { error: 'Route not found' });
});

// Start listening
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` AI LifeOS Server Running on http://localhost:${PORT}`);
  console.log(` Gemini API Configured: ${isGeminiConfigured() ? 'YES (Active - Gemini 2.5 Flash)' : 'NO (Using Local AI Engine)'}`);
  console.log(`==================================================`);
});
