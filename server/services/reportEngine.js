import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateProductivityAnalytics } from './analyticsEngine.js';

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
 * AI Report Compiler — Formulates Weekly & Monthly Intelligence Reports
 */
export async function generateProductivityReport(reportType = 'weekly', contextData = {}) {
  const analytics = calculateProductivityAnalytics(contextData);
  const apiKey = getGeminiKey();

  const isWeekly = reportType === 'weekly';
  const periodLabel = isWeekly ? 'Aug 17 – Aug 23' : 'August 2026';

  const baseMetrics = {
    reportType,
    periodLabel,
    productivityScore: analytics.productivityScore || 82,
    scoreStatus: analytics.scoreStatus,
    tasksCompleted: analytics.workload.completedCount,
    tasksTotal: analytics.workload.totalTasks,
    completionRate: analytics.workload.completionRate,
    overdueTasks: analytics.workload.overdueCount,
    focusTimeFormatted: analytics.focusStats.focusTimeFormatted,
    focusMinutes: analytics.focusStats.totalFocusMins,
    bestFocusPeriod: analytics.focusStats.bestPeriod,
    goalProgressAvg: analytics.goalHealth.avgProgress,
    activeGoalsCount: analytics.goalHealth.activeGoals,
    completedGoalsCount: analytics.goalHealth.completedGoals,
    deadlineAdherenceRate: analytics.deadlineAdherence.rate,
    weeklyComparison: analytics.weeklyComparison,
    personalRecords: analytics.personalRecords
  };

  // Try Gemini 2.5 Flash for Executive Summary, Wins, Challenges, and Recommendations
  if (apiKey && analytics.hasData) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const systemPrompt = `You are the executive AI Intelligence Reporting Engine for AI LifeOS.
Based ONLY on these verified metrics, synthesize a ${reportType} report JSON object:
Metrics: ${JSON.stringify(baseMetrics)}

Output JSON format strictly:
{
  "aiSummary": "2-3 sentence executive summary of productivity velocity.",
  "wins": [
    "✓ Empirical win 1",
    "✓ Empirical win 2",
    "✓ Empirical win 3"
  ],
  "challenges": [
    "⚠️ Empirical challenge 1",
    "⚠️ Empirical challenge 2"
  ],
  "recommendations": [
    { "title": "Recommendation 1", "action": "Schedule", "link": "/calendar" },
    { "title": "Recommendation 2", "action": "Open Goal", "link": "/goals" },
    { "title": "Recommendation 3", "action": "Start Focus", "link": "/focus" }
  ],
  "insightOfTheWeek": {
    "title": "Insight Title",
    "explanation": "Why this matters based on data",
    "nextStep": "Actionable next step"
  }
}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemPrompt }] }] })
      });

      if (response.ok) {
        const resData = await response.json();
        const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            id: `report-${reportType}-${Date.now()}`,
            createdAt: new Date().toISOString(),
            metrics: baseMetrics,
            ...parsed
          };
        }
      }
    } catch (err) {
      console.warn('[reportEngine] Gemini report call failed, using fallback summary:', err.message);
    }
  }

  // Fallback Structured Report
  return {
    success: true,
    id: `report-${reportType}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    metrics: baseMetrics,
    aiSummary: `You completed ${baseMetrics.tasksCompleted} tasks and logged ${baseMetrics.focusTimeFormatted} of deep focus work during ${periodLabel}. Your strongest area was deadline adherence (${baseMetrics.deadlineAdherenceRate}%).`,
    wins: [
      `✓ Completed ${baseMetrics.tasksCompleted} tasks with a ${baseMetrics.completionRate}% completion rate`,
      `✓ Logged ${baseMetrics.focusTimeFormatted} total focus time across sessions`,
      `✓ Maintained a ${baseMetrics.deadlineAdherenceRate}% deadline adherence rate`
    ],
    challenges: [
      baseMetrics.overdueTasks > 0 ? `⚠️ ${baseMetrics.overdueTasks} overdue tasks require schedule rebalancing` : `⚠️ Goal milestones need accelerated velocity`
    ],
    recommendations: [
      { title: 'Complete highest priority milestone task', action: 'Open Goal', link: '/goals' },
      { title: 'Schedule deep work sprint during peak window', action: 'Start Focus', link: '/focus' }
    ],
    insightOfTheWeek: {
      title: '💡 Peak Energy Window Utilization',
      explanation: `Your highest task completion velocity occurs during ${baseMetrics.bestFocusPeriod}.`,
      nextStep: 'Schedule complex technical tasks in your peak window.'
    }
  };
}
