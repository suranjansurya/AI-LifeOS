/**
 * AI LifeOS — AI Life Graph & Unified Context Service
 * Builds nodes and edge relationships across Tasks, Projects, Goals, Calendar,
 * Study, Focus, Knowledge, Memory, and Automations from real user records.
 */

export function buildLifeGraphNodesAndEdges(context = {}) {
  const {
    tasks = [],
    goals = [],
    projects = [],
    notes = [],
    memories = [],
    calendarEvents = [],
    focusSessions = [],
    studySubjects = [],
    automations = []
  } = context;

  const nodes = [];
  const edges = [];

  // 1. Project Nodes
  projects.forEach(p => {
    nodes.push({
      id: `proj-${p.id || p._id || p.title}`,
      type: 'PROJECT',
      title: p.title || p.name || 'Untitled Project',
      status: p.status || 'Active',
      progress: p.progress || 0,
      icon: 'Folder'
    });
  });

  // 2. Goal Nodes & Goal -> Project Edges
  goals.forEach(g => {
    const goalNodeId = `goal-${g.id || g._id || g.title}`;
    nodes.push({
      id: goalNodeId,
      type: 'GOAL',
      title: g.title || 'Untitled Goal',
      status: 'Active',
      progress: g.progress || 0,
      icon: 'Target'
    });

    if (g.projectId) {
      edges.push({
        id: `e-g-p-${g.id}`,
        source: goalNodeId,
        target: `proj-${g.projectId}`,
        relationship: 'contributes to'
      });
    }
  });

  // 3. Task Nodes & Task -> Project / Goal Edges
  tasks.forEach(t => {
    const taskNodeId = `task-${t.id || t._id || t.title}`;
    nodes.push({
      id: taskNodeId,
      type: 'TASK',
      title: t.title || 'Untitled Task',
      status: t.status || 'Pending',
      priority: t.priority || 'Medium',
      icon: 'CheckSquare'
    });

    if (t.projectId) {
      edges.push({
        id: `e-t-p-${t.id}`,
        source: taskNodeId,
        target: `proj-${t.projectId}`,
        relationship: 'belongs to'
      });
    }

    if (t.goalId) {
      edges.push({
        id: `e-t-g-${t.id}`,
        source: taskNodeId,
        target: `goal-${t.goalId}`,
        relationship: 'contributes to'
      });
    }
  });

  // 4. Study Subject & Topic Nodes
  studySubjects.forEach(s => {
    const subjectNodeId = `study-${s.id || s.name}`;
    nodes.push({
      id: subjectNodeId,
      type: 'STUDY',
      title: s.name || s.title || 'Study Subject',
      status: 'Active',
      icon: 'BookOpen'
    });

    // Link Study -> Task if title matches
    const relatedTask = tasks.find(t => (t.title || '').toLowerCase().includes((s.name || '').toLowerCase()));
    if (relatedTask) {
      edges.push({
        id: `e-s-t-${s.id}`,
        source: subjectNodeId,
        target: `task-${relatedTask.id}`,
        relationship: 'relates to'
      });
    }
  });

  // 5. Knowledge Notes Nodes & Links
  notes.forEach(n => {
    const noteNodeId = `note-${n.id || n.title}`;
    nodes.push({
      id: noteNodeId,
      type: 'KNOWLEDGE',
      title: n.title || 'Untitled Note',
      status: 'Document',
      icon: 'Bookmark'
    });

    // Link note to project if title contains project name
    projects.forEach(p => {
      if ((n.title || '').toLowerCase().includes((p.title || '').toLowerCase())) {
        edges.push({
          id: `e-n-p-${n.id}-${p.id}`,
          source: noteNodeId,
          target: `proj-${p.id}`,
          relationship: 'documents'
        });
      }
    });
  });

  // 6. Memory Nodes
  memories.forEach(m => {
    const memNodeId = `mem-${m.id}`;
    nodes.push({
      id: memNodeId,
      type: 'MEMORY',
      title: m.content || m.value || 'Preference Memory',
      status: m.status || 'Approved',
      icon: 'Brain'
    });
  });

  // 7. Focus Session Edges
  focusSessions.forEach(f => {
    if (f.taskId) {
      const focusNodeId = `focus-${f.id || Date.now()}`;
      nodes.push({
        id: focusNodeId,
        type: 'FOCUS',
        title: `Focus Sprint (${f.durationMinutes || 25}m)`,
        status: 'Completed',
        icon: 'Zap'
      });
      edges.push({
        id: `e-f-t-${f.id}`,
        source: focusNodeId,
        target: `task-${f.taskId}`,
        relationship: 'works on'
      });
    }
  });

  return { nodes, edges };
}

export function searchLifeGraph(queryText = '', graph = { nodes: [], edges: [] }) {
  const cleanQuery = queryText.toLowerCase().trim();
  if (!cleanQuery) return graph;

  const matchedNodes = graph.nodes.filter(n =>
    n.title.toLowerCase().includes(cleanQuery) ||
    n.type.toLowerCase().includes(cleanQuery)
  );

  const matchedIds = new Set(matchedNodes.map(n => n.id));

  // Find connected edges (Depth 1)
  const connectedEdges = graph.edges.filter(e => matchedIds.has(e.source) || matchedIds.has(e.target));
  connectedEdges.forEach(e => {
    matchedIds.add(e.source);
    matchedIds.add(e.target);
  });

  const finalNodes = graph.nodes.filter(n => matchedIds.has(n.id));

  return {
    nodes: finalNodes,
    edges: connectedEdges
  };
}
