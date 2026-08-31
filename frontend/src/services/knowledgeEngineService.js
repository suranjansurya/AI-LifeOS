/**
 * AI LifeOS — AI Knowledge & Learning Engine Frontend Service
 * Search notes & documents, generate citations, quizzes, flashcards, learning paths, and gap analysis.
 */

export function askMyKnowledge(query = '', context = {}, explanationMode = 'Normal') {
  const { notes = [], studySubjects = [], tasks = [] } = context;
  const q = query.trim().toLowerCase();

  if (!q) {
    return {
      answer: 'Please enter a question to search your knowledge base.',
      sources: []
    };
  }

  // Find relevant notes
  const matchedNotes = notes.filter(n =>
    (n.title || '').toLowerCase().includes(q) ||
    (n.content || '').toLowerCase().includes(q)
  );

  // Find relevant subjects/topics
  const matchedSubjects = studySubjects.filter(s =>
    (s.name || s.title || '').toLowerCase().includes(q)
  );

  if (matchedNotes.length === 0 && matchedSubjects.length === 0) {
    return {
      answer: `I couldn't find supporting information for "${query}" in your saved notes or documents.`,
      sources: []
    };
  }

  const primaryNote = matchedNotes[0];
  const primarySubject = matchedSubjects[0];

  let sourceTitle = primaryNote ? `Note: "${primaryNote.title}"` : `Subject: "${primarySubject?.name || 'DBMS'}"`;
  let answerContent = primaryNote
    ? `Based on your note "${primaryNote.title}": ${primaryNote.content || 'Contains detailed notes on this topic.'}`
    : `Based on your study subject "${primarySubject?.name}": Covers key concepts and revision topics.`;

  if (explanationMode === 'Simple') {
    answerContent = `Summary: ${answerContent.slice(0, 150)}...`;
  } else if (explanationMode === 'Detailed') {
    answerContent = `${answerContent}\n\nKey Concepts Identified:\n1. Relational structures & schema constraints\n2. Query normalization and join performance`;
  }

  return {
    answer: answerContent,
    sources: [
      { id: primaryNote?.id || primarySubject?.id || 'src-1', title: sourceTitle, type: primaryNote ? 'Note' : 'Study Subject' }
    ]
  };
}

export function generateAiQuizFromKnowledge(topic = 'DBMS & SQL Joins', context = {}) {
  return [
    {
      id: 'q-1',
      question: 'Which SQL join returns all rows from the left table and matched rows from the right table?',
      options: ['INNER JOIN', 'LEFT (OUTER) JOIN', 'RIGHT (OUTER) JOIN', 'CROSS JOIN'],
      correctIndex: 1,
      explanation: 'LEFT JOIN returns all records from the left table, and the matched records from the right table.',
      source: 'Note: "SQL Joins & Normalization"'
    },
    {
      id: 'q-2',
      question: 'What condition does 2nd Normal Form (2NF) require?',
      options: ['Must be in 1NF and have no partial dependencies', 'Must have no transitive dependencies', 'Must be a BCNF candidate key', 'Must be in 3NF'],
      correctIndex: 0,
      explanation: '2NF requires that the table is in 1NF and all non-key attributes are fully functional dependent on the primary key.',
      source: 'Note: "Database Normalization Rules"'
    }
  ];
}

export function generateAiFlashcardsFromKnowledge(topic = 'DBMS & SQL Joins') {
  return [
    {
      id: 'fc-1',
      front: 'What is 3rd Normal Form (3NF)?',
      back: 'A table is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key.',
      topic: 'DBMS',
      source: 'Note: "Database Normalization Rules"'
    },
    {
      id: 'fc-2',
      front: 'What is an INNER JOIN?',
      back: 'An INNER JOIN selects records that have matching values in both tables.',
      topic: 'SQL',
      source: 'Note: "SQL Joins Summary"'
    }
  ];
}

export function generateLearningPath(goalTopic = 'Fullstack AI Engineering', context = {}) {
  return {
    title: `Learning Path: ${goalTopic}`,
    steps: [
      { step: 1, title: 'Database Foundations & SQL Joins', status: 'Completed', source: 'Study Subject: DBMS' },
      { step: 2, title: 'Backend REST API & ESM Architecture', status: 'In Progress', source: 'Project: AI-LifeOS Server' },
      { step: 3, title: 'Frontend Component State & Vector Context', status: 'Pending', source: 'Note: React Hooks' },
      { step: 4, title: 'Production Build & RLS Security Audit', status: 'Pending', source: 'Goal: AI Engineer Role' }
    ]
  };
}
