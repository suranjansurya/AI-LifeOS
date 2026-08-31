/**
 * AI LifeOS — Personal AI Memory & Preference Engine
 * Security scanner, relevant retrieval ranker, duplicate detector, and preference inferrer.
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

/**
 * Secret & Sensitive Data Detector
 */
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

/**
 * Duplicate / Conflict Checker
 */
export function checkForDuplicatesOrConflicts(newContent = '', existingMemories = []) {
  const cleanNew = newContent.toLowerCase().trim();

  const match = existingMemories.find(m => {
    const cleanExisting = (m.content || '').toLowerCase().trim();
    return cleanExisting.includes(cleanNew) || cleanNew.includes(cleanExisting);
  });

  if (match) {
    return {
      isDuplicate: true,
      existingMemory: match,
      warning: `Memory already exists: "${match.content}"`
    };
  }

  return { isDuplicate: false };
}

/**
 * Relevant Memory Retrieval Ranker (Max 5 relevant memories)
 */
export function retrieveRelevantMemories(userPrompt = '', memories = [], maxLimit = 5) {
  const activeMemories = memories.filter(m => m.enabled !== false);
  if (activeMemories.length === 0) return [];

  const lowerPrompt = userPrompt.toLowerCase();

  const scored = activeMemories.map(m => {
    const content = (m.content || '').toLowerCase();
    const tags = (m.tags || []).map(t => t.toLowerCase());
    let score = 0;

    if (lowerPrompt.includes('plan') && (content.includes('plan') || tags.includes('planning'))) score += 10;
    if (lowerPrompt.includes('study') || lowerPrompt.includes('focus')) if (content.includes('focus') || content.includes('study')) score += 10;
    if (lowerPrompt.includes('goal')) if (content.includes('goal')) score += 10;
    if (lowerPrompt.includes('night') || lowerPrompt.includes('evening')) if (content.includes('night') || content.includes('evening')) score += 10;

    return { memory: m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxLimit).map(s => s.memory);
}
