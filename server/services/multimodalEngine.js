/**
 * AI LifeOS — Multimodal AI Engine 2.0
 * Voice command parser, image OCR/understanding simulation, document parsing,
 * and source citation resolver.
 */

export function parseVoiceCommand(transcriptText = '') {
  const lower = transcriptText.toLowerCase().trim();
  let actionType = 'GENERAL_QUERY';
  let targetModule = 'copilot';
  let requiresApproval = false;
  let proposedData = null;

  if (lower.includes('create task') || lower.includes('add task')) {
    actionType = 'CREATE_TASK';
    targetModule = 'tasks';
    requiresApproval = true;
    proposedData = {
      title: transcriptText.replace(/create task|add task/gi, '').trim() || 'New Voice Task',
      priority: 'High',
      dueDate: 'Tomorrow'
    };
  } else if (lower.includes('plan my day') || lower.includes('generate day')) {
    actionType = 'PLAN_DAY';
    targetModule = 'planner';
    requiresApproval = false;
  } else if (lower.includes('start focus') || lower.includes('focus session')) {
    actionType = 'START_FOCUS';
    targetModule = 'focus';
    requiresApproval = false;
  } else if (lower.includes('show tasks') || lower.includes('my tasks')) {
    actionType = 'NAVIGATE';
    targetModule = 'tasks';
    requiresApproval = false;
  } else if (lower.includes('show calendar') || lower.includes('calendar')) {
    actionType = 'NAVIGATE';
    targetModule = 'calendar';
    requiresApproval = false;
  }

  return {
    transcript: transcriptText,
    actionType,
    targetModule,
    requiresApproval,
    proposedData,
    confirmationMessage: requiresApproval ? `Create task "${proposedData?.title}" due tomorrow?` : null
  };
}

export function analyzeUploadedImage(fileData = {}) {
  const fileName = fileData.name || 'image.png';

  return {
    fileName,
    extractedText: `Sample OCR Extracted Text from ${fileName}: DBMS Normalization 1NF 2NF 3NF. Due date: Tomorrow 5 PM.`,
    summary: 'Diagram illustrates 3-Tier Web Architecture with React Frontend, Express Node.js Server, and Supabase PostgreSQL Database.',
    suggestedTask: {
      title: `Task from ${fileName}: Implement Database Normalization`,
      priority: 'High',
      dueDate: 'Tomorrow'
    },
    suggestedQuiz: [
      { question: 'What layer does the Node.js Express server belong to?', options: ['Database', 'Application Backend', 'Presentation UI'], correctIndex: 1 }
    ],
    citation: `Source: Uploaded Image "${fileName}"`
  };
}

export function parseUploadedDocument(docData = {}) {
  const fileName = docData.name || 'document.pdf';

  return {
    fileName,
    fileType: docData.type || 'application/pdf',
    summary: `Document "${fileName}" summarizes software architecture best practices, Row Level Security guidelines, and API authentication patterns.`,
    citation: `Source: Document "${fileName}"`
  };
}
