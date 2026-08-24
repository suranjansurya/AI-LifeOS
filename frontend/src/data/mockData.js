export const initialProfile = {
  name: 'Suranjan',
  email: 'suranjan@ai-lifeos.dev',
  role: 'Student & AI Engineer Track',
  avatar: 'S',
  peakEnergy: '09:00 - 12:00',
  dailyFocusTargetMinutes: 180
};

export const initialNextBestAction = {
  id: 'task-1',
  title: 'Complete DBMS Assignment',
  subtitle: 'Normalization & ER Diagram Lab',
  durationMinutes: 35,
  priority: 'High',
  deadline: 'Due Tomorrow',
  reasoning: 'This task has the closest deadline and is currently your highest-risk priority. Completing it now unlocks 40% of your DBMS milestone.',
  category: 'Academics'
};

export const initialProgressStats = {
  completedTasks: 6,
  totalTasks: 10,
  focusTime: '2h 35m',
  focusMinutes: 155,
  goalProgress: 68,
  completionRate: 82
};

export const initialPlan = [
  {
    id: 'p-1',
    time: '09:00',
    title: 'DBMS Revision',
    duration: '45 min',
    status: 'completed',
    category: 'Academics'
  },
  {
    id: 'p-2',
    time: '10:00',
    title: 'Break & Coffee Reset',
    duration: '15 min',
    status: 'completed',
    category: 'Rest'
  },
  {
    id: 'p-3',
    time: '10:15',
    title: 'Python Practice',
    duration: '45 min',
    status: 'current',
    category: 'Career'
  },
  {
    id: 'p-4',
    time: '11:15',
    title: 'Project Work',
    duration: '60 min',
    status: 'upcoming',
    category: 'Development'
  }
];

export const initialUpcoming = [
  {
    id: 'u-1',
    dateLabel: 'Tomorrow',
    title: 'DBMS Assignment',
    due: 'Due 11:59 PM',
    priority: 'High',
    category: 'Academics'
  },
  {
    id: 'u-2',
    dateLabel: 'Friday',
    title: 'AI Project Milestone',
    due: 'Due in 2 days',
    priority: 'Medium',
    category: 'Development'
  },
  {
    id: 'u-3',
    dateLabel: 'Monday',
    title: 'Machine Learning Exam',
    due: 'Due in 5 days',
    priority: 'Critical',
    category: 'Academics'
  }
];

export const initialAiInsight = {
  id: 'ins-1',
  title: 'AI INSIGHT',
  message: 'You have 2.5 hours available today. Your highest-value task is DBMS revision. Completing it now reduces tomorrow\'s deadline pressure.',
  actionText: 'Apply Recommendation'
};

export const initialTasksList = [
  {
    id: 'task-1',
    title: 'Complete DBMS Assignment & Normalization Lab',
    category: 'Academics',
    priority: 'High',
    deadline: 'Tomorrow',
    durationMinutes: 35,
    status: 'Todo',
    aiReasoning: 'Closest deadline (24 hours remaining). High academic weight.'
  },
  {
    id: 'task-2',
    title: 'Python NumPy & Pandas Vectorized Operations',
    category: 'Career',
    priority: 'Medium',
    deadline: 'Friday',
    durationMinutes: 45,
    status: 'In Progress',
    aiReasoning: 'Foundational prerequisite for your AI Roadmap goal.'
  },
  {
    id: 'task-3',
    title: 'Setup PyTorch GPU Environment & CUDA Drivers',
    category: 'Development',
    priority: 'Medium',
    deadline: 'Saturday',
    durationMinutes: 30,
    status: 'Todo',
    aiReasoning: 'Low friction setup task suitable for afternoon focus window.'
  },
  {
    id: 'task-4',
    title: 'Review System Design - Scalable Caching Strategies',
    category: 'Career',
    priority: 'High',
    deadline: 'Today',
    durationMinutes: 40,
    status: 'Completed',
    completedAt: '09:45 AM'
  },
  {
    id: 'task-5',
    title: 'Practice 3 LeetCode Graph Traversal Problems',
    category: 'Career',
    priority: 'High',
    deadline: 'Monday',
    durationMinutes: 60,
    status: 'Todo',
    aiReasoning: 'Targeting technical interview readiness.'
  }
];

export const initialGoalsList = [
  {
    id: 'g-1',
    title: 'Achieve Grade A in DBMS Course',
    category: 'Academics',
    targetDate: '30 Days',
    progress: 75,
    status: 'Active',
    color: 'from-indigo-500 to-blue-600',
    milestones: [
      { id: 'm-1', title: 'Normalization & ER Lab Assignment', completed: false },
      { id: 'm-2', title: 'SQL Joins & Performance Tuning', completed: true },
      { id: 'm-3', title: 'Mid-Term Exam Revision Pass', completed: true }
    ]
  },
  {
    id: 'g-2',
    title: 'Become an AI / ML Engineer Path',
    category: 'Career',
    targetDate: '6 Months',
    progress: 42,
    status: 'Active',
    color: 'from-emerald-500 to-teal-600',
    milestones: [
      { id: 'm-4', title: 'Phase 1: Advanced Python & Math Core', completed: true },
      { id: 'm-5', title: 'Phase 2: NumPy, Pandas & SciKit-Learn', completed: false },
      { id: 'm-6', title: 'Phase 3: PyTorch Neural Networks & RAG', completed: false }
    ]
  },
  {
    id: 'g-3',
    title: 'Log 50 Deep Focus Hours This Month',
    category: 'Personal',
    targetDate: '15 Days',
    progress: 62,
    status: 'Active',
    color: 'from-amber-500 to-orange-600',
    milestones: [
      { id: 'm-7', title: 'Week 1 Focus Target (12.5h)', completed: true },
      { id: 'm-8', title: 'Week 2 Focus Target (12.5h)', completed: true },
      { id: 'm-9', title: 'Week 3 Focus Target (12.5h)', completed: false }
    ]
  }
];

export const initialNotesList = [
  {
    id: 'n-1',
    title: 'Prof. Miller DBMS Lecture Key Points',
    content: 'Focus heavily on BCNF decomposition step-by-step for tomorrow\'s assignment. Make sure to check multi-valued dependencies.',
    tags: ['DBMS', 'Academics'],
    createdAt: '2 hours ago'
  },
  {
    id: 'n-2',
    title: 'Project Idea: Vector DB RAG Pipeline',
    content: 'Build a local document Q&A system using ChromaDB + PyTorch embeddings. Need to setup GPU environment first.',
    tags: ['AI', 'Ideas'],
    createdAt: 'Yesterday'
  },
  {
    id: 'n-3',
    title: 'Peak Productivity Observations',
    content: 'Morning focus window (09:00 - 11:30 AM) is 2x more effective for complex problem solving than late afternoon.',
    tags: ['Insights', 'Self'],
    createdAt: '3 days ago'
  }
];

export const initialNotificationsList = [
  {
    id: 'notif-1',
    title: 'High Priority Deadline Warning',
    message: 'DBMS Assignment is due tomorrow! Complete focus session today to avoid evening bottleneck.',
    type: 'warning',
    time: '10 mins ago',
    unread: true
  },
  {
    id: 'notif-2',
    title: 'Schedule Rebalanced',
    message: 'AI re-optimized your afternoon schedule to include a 15-minute break buffer.',
    type: 'info',
    time: '1 hour ago',
    unread: true
  },
  {
    id: 'notif-3',
    title: 'Milestone Completed 🎉',
    message: 'You completed "SQL Joins & Performance Tuning" milestone!',
    type: 'success',
    time: 'Yesterday',
    unread: false
  }
];

export const initialChatMessages = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: 'Hello Suranjan! I am your AI LifeOS Copilot. I have analyzed your schedule, deadlines, and goals.\n\nYour **NEXT BEST ACTION** right now is: **Complete DBMS Assignment** (35 min, High Priority).\n\nHow would you like to proceed?',
    timestamp: '10:15 AM'
  }
];
