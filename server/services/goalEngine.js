import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Real Mathematical Goal Health Calculation
 */
export function calculateGoalHealth(goal, linkedTasks = [], milestones = []) {
  if (!goal) return { healthStatus: 'ON TRACK', progressPercent: 0, reason: 'New Goal' };

  // Calculate Progress %
  let progressPercent = goal.progress || 0;
  if (linkedTasks.length > 0) {
    const completedCount = linkedTasks.filter(t => t.status === 'Completed').length;
    progressPercent = Math.round((completedCount / linkedTasks.length) * 100);
  } else if (goal.targetUnit > 0) {
    progressPercent = Math.min(100, Math.round(((goal.completedUnit || 0) / goal.targetUnit) * 100));
  }

  if (progressPercent >= 100) {
    return {
      healthStatus: 'COMPLETED',
      progressPercent: 100,
      badgeColor: 'blue',
      reason: '100% of milestones and linked tasks have been completed! 🎉'
    };
  }

  // Parse Target Deadline & Expected Pace
  let daysRemaining = 30;
  const targetStr = (goal.targetDate || '30 Days').toLowerCase();
  const numMatch = targetStr.match(/\d+/);
  if (numMatch) daysRemaining = parseInt(numMatch[0], 10);

  // Determine expected progress percentage based on elapsed time ratio (assuming 30-day baseline)
  const totalDurationDays = Math.max(daysRemaining, 30);
  const elapsedDays = Math.max(0, totalDurationDays - daysRemaining);
  const expectedProgressPercent = Math.min(90, Math.round((elapsedDays / totalDurationDays) * 100) || 50);

  const diff = progressPercent - expectedProgressPercent;

  if (diff >= -5) {
    return {
      healthStatus: 'ON TRACK',
      progressPercent,
      expectedProgressPercent,
      daysRemaining,
      badgeColor: 'emerald',
      reason: `Pace is optimal. Current progress (${progressPercent}%) meets expected velocity.`
    };
  } else if (diff >= -20) {
    return {
      healthStatus: 'AT RISK',
      progressPercent,
      expectedProgressPercent,
      daysRemaining,
      badgeColor: 'amber',
      reason: `Slightly behind pace. Current progress (${progressPercent}%) is below target (${expectedProgressPercent}%).`
    };
  } else {
    return {
      healthStatus: 'BEHIND',
      progressPercent,
      expectedProgressPercent,
      daysRemaining,
      badgeColor: 'rose',
      reason: `Behind schedule. Target deadline in ${daysRemaining} days with ${progressPercent}% completed vs ${expectedProgressPercent}% expected.`
    };
  }
}

/**
 * AI Goal Breakdown Generator via Gemini 2.5 Flash
 */
export async function generateAiGoalBreakdown(goalTitle = '', timeframeText = '30 Days', contextData = {}) {
  const apiKey = getGeminiKey();

  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const prompt = `Decompose the goal "${goalTitle}" (${timeframeText}) into 4 structured milestone stages.
Output JSON format strictly:
{
  "goalTitle": "${goalTitle}",
  "milestones": [
    {
      "title": "Milestone Name",
      "description": "Brief description",
      "timeframe": "Days 1–5",
      "tasks": [
        { "title": "Subtask Name", "priority": "High", "estimatedMinutes": 35 }
      ]
    }
  ]
}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const resData = await response.json();
        const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.milestones && parsed.milestones.length > 0) {
            return { success: true, ...parsed };
          }
        }
      }
    } catch (err) {
      console.warn('[goalEngine] Gemini breakdown call failed, using fallback:', err.message);
    }
  }

  // Fallback Structured Breakdown
  return {
    success: true,
    goalTitle,
    milestones: [
      {
        title: `Phase 1: ${goalTitle} Core Foundations`,
        description: 'Establish initial requirements, setup environment, and learn fundamentals.',
        timeframe: 'Days 1–7',
        tasks: [
          { title: `Define requirements for ${goalTitle}`, priority: 'High', estimatedMinutes: 30 },
          { title: `Complete initial setup and core reading`, priority: 'Medium', estimatedMinutes: 45 }
        ]
      },
      {
        title: 'Phase 2: Primary Implementation Sprint',
        description: 'Build core deliverables and complete primary milestone exercises.',
        timeframe: 'Days 8–18',
        tasks: [
          { title: 'Execute primary milestone sprint tasks', priority: 'High', estimatedMinutes: 60 },
          { title: 'Review intermediate outputs and test progress', priority: 'Medium', estimatedMinutes: 40 }
        ]
      },
      {
        title: 'Phase 3: Advanced Refinement & Final Project',
        description: 'Finalize deliverables, perform quality assurance, and complete goal target.',
        timeframe: 'Days 19–30',
        tasks: [
          { title: 'Complete final project milestone', priority: 'High', estimatedMinutes: 90 },
          { title: 'Final verification and goal review', priority: 'Medium', estimatedMinutes: 30 }
        ]
      }
    ]
  };
}

/**
 * AI Goal Diagnostic Analysis
 */
export async function generateAiGoalAnalysis(goal, linkedTasks = [], milestones = []) {
  const health = calculateGoalHealth(goal, linkedTasks, milestones);
  const apiKey = getGeminiKey();

  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const prompt = `Analyze the goal "${goal.title}" (Status: ${health.healthStatus}, Progress: ${health.progressPercent}%, Deadline: ${goal.targetDate || '30 Days'}).
Linked tasks: ${linkedTasks.length} total, ${linkedTasks.filter(t => t.status === 'Completed').length} completed.
Milestones: ${milestones.length} total.

Output JSON format strictly:
{
  "currentStatus": "${health.healthStatus}",
  "progress": ${health.progressPercent},
  "deadlineRisk": "${health.healthStatus === 'BEHIND' ? 'HIGH' : health.healthStatus === 'AT RISK' ? 'MEDIUM' : 'LOW'}",
  "goingWell": "Brief sentence on positive progress",
  "bottlenecks": "Brief sentence on incomplete tasks or delays",
  "recommendedActions": [
    "Specific task or milestone action 1",
    "Specific task or milestone action 2"
  ]
}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
      });

      if (response.ok) {
        const resData = await response.json();
        const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { success: true, analysis: parsed };
        }
      }
    } catch (err) {
      console.warn('[goalEngine] Gemini goal analysis failed, using fallback:', err.message);
    }
  }

  // Fallback Goal Diagnostic
  return {
    success: true,
    analysis: {
      currentStatus: health.healthStatus,
      progress: health.progressPercent,
      deadlineRisk: health.healthStatus === 'BEHIND' ? 'HIGH' : health.healthStatus === 'AT RISK' ? 'MEDIUM' : 'LOW',
      goingWell: `${health.progressPercent}% of goal milestones have been completed so far.`,
      bottlenecks: linkedTasks.filter(t => t.status !== 'Completed').length > 0
        ? `${linkedTasks.filter(t => t.status !== 'Completed').length} pending tasks remain in the active queue.`
        : 'Milestones need consistent focus sessions.',
      recommendedActions: [
        `Focus on completing the highest priority task for "${goal.title}".`,
        `Schedule a 50-minute focus session today to accelerate milestone progress.`
      ]
    }
  };
}
