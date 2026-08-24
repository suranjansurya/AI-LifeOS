import express from 'express';
import { isGeminiConfigured, callGeminiAPI } from '../services/geminiService.js';
import { buildCompactContextPrompt } from '../services/contextEngine.js';

const router = express.Router();

// GET /api/ai/status — Server AI health & configuration status
router.get('/status', (req, res) => {
  const configured = isGeminiConfigured();
  res.json({
    success: true,
    configured,
    provider: 'Google Gemini 1.5 Flash',
    message: configured
      ? 'Gemini AI Brain active & ready'
      : 'Gemini API key missing on server. Operating in local fallback mode.'
  });
});

// POST /api/ai/chat — Conversational AI Copilot with Context & Structured Actions
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!isGeminiConfigured()) {
      return res.json({
        success: false,
        fallbackMode: true,
        message: 'Gemini API key is not configured on the server.',
        provider: 'local-fallback'
      });
    }

    const contextPrompt = buildCompactContextPrompt(context);
    const systemPrompt = `
You are AI LifeOS Copilot, a high-value personal operating system assistant.
Core Directive: "AI that understands your context, decides what matters next, and helps you get it done."

${contextPrompt}

Instructions:
- Provide clear, concise, actionable advice based on the user's live context.
- Be crisp, professional, and encouraging. Never invent credentials.
`.trim();

    const rawResponse = await callGeminiAPI(systemPrompt, message, false);

    res.json({
      success: true,
      message: rawResponse,
      provider: 'gemini-1.5-flash',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[routes/ai/chat] Error:', err.message);
    res.json({
      success: false,
      fallbackMode: true,
      error: err.message || 'Failed to process AI chat request',
      provider: 'local-fallback'
    });
  }
});

// POST /api/ai/recommendation — Hybrid NEXT BEST ACTION reasoning generator
router.post('/recommendation', async (req, res) => {
  try {
    const { task, context } = req.body;

    if (!isGeminiConfigured()) {
      return res.json({
        success: false,
        fallbackMode: true,
        reasoning: null
      });
    }

    const contextPrompt = buildCompactContextPrompt(context);
    const systemPrompt = `
You are the AI LifeOS Recommendation Engine.
Context:
${contextPrompt}

Task to analyze:
Title: "${task.title}"
Priority: ${task.priority}
Deadline: ${task.dueDate || task.deadline}
Estimated Duration: ${task.estimatedMinutes || task.durationMinutes} mins

Task:
Write a single, compelling, 2-sentence natural explanation answering "WHY NOW?" for this task.
`.trim();

    const reasoning = await callGeminiAPI(systemPrompt, "Provide why-now reasoning.", false);

    res.json({
      success: true,
      reasoning: reasoning.trim(),
      provider: 'gemini-1.5-flash'
    });
  } catch (err) {
    res.json({
      success: false,
      fallbackMode: true,
      reasoning: null
    });
  }
});

// POST /api/ai/breakdown — AI Subtask Breakdown Generator
router.post('/breakdown', async (req, res) => {
  try {
    const { taskTitle, context } = req.body;

    if (!taskTitle) {
      return res.status(400).json({ success: false, error: 'taskTitle is required' });
    }

    if (!isGeminiConfigured()) {
      return res.json({
        success: false,
        fallbackMode: true,
        subtasks: [
          { title: `Define requirements for ${taskTitle}`, estimatedMinutes: 20, priority: 'High' },
          { title: `Core implementation step for ${taskTitle}`, estimatedMinutes: 45, priority: 'High' },
          { title: `Verification & testing phase`, estimatedMinutes: 25, priority: 'Medium' }
        ]
      });
    }

    const systemPrompt = `
You are the AI LifeOS Task Breakdown Engine.
Break down the main task "${taskTitle}" into 3 to 5 clear, bite-sized subtasks.

Return strictly a JSON array of objects with keys:
- "title": string
- "description": string
- "priority": "High" | "Medium" | "Low"
- "estimatedMinutes": number

JSON Format Only. No markdown codeblocks.
`.trim();

    const rawJson = await callGeminiAPI(systemPrompt, `Break down "${taskTitle}"`, true);
    let subtasks = [];
    try {
      subtasks = JSON.parse(rawJson);
    } catch (e) {
      subtasks = [
        { title: `Define requirements for ${taskTitle}`, estimatedMinutes: 20, priority: 'High' },
        { title: `Implementation phase for ${taskTitle}`, estimatedMinutes: 45, priority: 'High' },
        { title: `Testing & verification`, estimatedMinutes: 25, priority: 'Medium' }
      ];
    }

    res.json({
      success: true,
      subtasks,
      provider: 'gemini-1.5-flash'
    });
  } catch (err) {
    res.json({
      success: false,
      fallbackMode: true,
      subtasks: [
        { title: `Define requirements for ${taskTitle}`, estimatedMinutes: 20, priority: 'High' },
        { title: `Implementation phase for ${taskTitle}`, estimatedMinutes: 45, priority: 'High' },
        { title: `Testing & verification`, estimatedMinutes: 25, priority: 'Medium' }
      ]
    });
  }
});

export default router;
