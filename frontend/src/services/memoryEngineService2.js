/**
 * AI LifeOS — AI Memory 2.0 & Personal Knowledge Graph Service
 * Structured memory types, conflict detection, security scanner, knowledge graph data generator, and memory export.
 */

const SECRET_PATTERNS = [
  /password\s*=\s*/i,
  /api[_-]?key\s*=\s*/i,
  /secret[_-]?key\s*=\s*/i,
  /bearer\s+[a-z0-9\-._~+/]+=*/i,
  /sk-[a-zA-Z0-9]{20,}/,
  /AIzaSy[a-zA-Z0-9_-]{33}/,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b.*(pass|cred)/i
];

export function scanForSecretsAndSensitiveData(content = '') {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      return {
        isSensitive: true,
        warning: '⚠️ Security Block: Passwords, API keys, and sensitive credentials cannot be stored in AI Memory.'
      };
    }
  }
  return { isSensitive: false };
}

export function getDefaultMemories() {
  return [
    {
      id: 'mem-1',
      content: 'Prefers concise explanations with direct technical bullet points.',
      category: 'Preference',
      importance: 'High',
      confidence: 'User Saved',
      source: 'Explicit Input',
      usedBy: ['AI Copilot', 'Planner Agent'],
      createdAt: '2026-08-30'
    },
    {
      id: 'mem-2',
      content: 'Peak focus energy window is during evening hours (7 PM – 9 PM).',
      category: 'Workflow Preference',
      importance: 'High',
      confidence: 'Confirmed',
      source: 'Focus Tracker',
      usedBy: ['Calendar Agent', 'Focus Agent'],
      createdAt: '2026-08-29'
    },
    {
      id: 'mem-3',
      content: 'Targeting DBMS exam completion by end of week.',
      category: 'Goal Context',
      importance: 'Normal',
      confidence: 'Confirmed',
      source: 'Study Center',
      usedBy: ['Study Agent'],
      createdAt: '2026-08-28'
    }
  ];
}

export function detectMemoryConflicts(newContent = '', existingMemories = []) {
  const lowerNew = newContent.toLowerCase();

  for (const m of existingMemories) {
    const lowerExisting = (m.content || '').toLowerCase();

    if (
      (lowerNew.includes('concise') && lowerExisting.includes('detailed')) ||
      (lowerNew.includes('detailed') && lowerExisting.includes('concise')) ||
      (lowerNew.includes('morning') && lowerExisting.includes('evening')) ||
      (lowerNew.includes('evening') && lowerExisting.includes('morning'))
    ) {
      return {
        hasConflict: true,
        conflictingMemory: m,
        message: `Potential conflict detected with existing memory: "${m.content}"`
      };
    }
  }

  return { hasConflict: false };
}

export function generatePersonalKnowledgeGraph(memories = [], context = {}) {
  const nodes = [
    { id: 'node-core', label: 'User Persona Context', type: 'Core', color: '#6366f1' }
  ];
  const edges = [];

  memories.forEach(m => {
    const mId = `mem-node-${m.id}`;
    nodes.push({ id: mId, label: m.content.slice(0, 30) + '...', type: 'Memory', color: '#a855f7' });
    edges.push({ source: 'node-core', target: mId, label: m.category });
  });

  nodes.push({ id: 'node-goal-dbms', label: 'Goal: Master DBMS', type: 'Goal', color: '#10b981' });
  nodes.push({ id: 'node-proj-lifeos', label: 'Project: AI-LifeOS', type: 'Project', color: '#3b82f6' });

  edges.push({ source: 'mem-node-mem-3', target: 'node-goal-dbms', label: 'influences' });
  edges.push({ source: 'mem-node-mem-1', target: 'node-proj-lifeos', label: 'guides' });

  return { nodes, edges };
}

export function exportUserMemoryJSON(memories = []) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `ai_lifeos_memory_export_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
