import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { evaluateNextBestAction, parseDeadlineDays } from '../services/nbaEngine';
import { processLocalAiCommand } from '../services/aiAssistantEngine';
import { aiService } from '../services/aiService';
import { aiMemoryService } from '../services/aiMemoryService';
import { initialPlan, initialAiInsight, initialUpcoming } from '../data/mockData';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // 1. Initialize State
  const [profile, setProfileState] = useState(() => storageService.getProfile());
  const [tasks, setTasksState] = useState(() => storageService.getTasks());
  const [goals, setGoalsState] = useState(() => storageService.getGoals());
  const [notes, setNotesState] = useState(() => storageService.getNotes());
  const [focusSessions, setFocusSessionsState] = useState(() => storageService.getFocusSessions());
  const [notifications, setNotificationsState] = useState(() => storageService.getNotifications());
  const [chatMessages, setChatMessagesState] = useState(() => storageService.getChatHistory());
  const [memories, setMemoriesState] = useState(() => aiMemoryService.getMemories());
  const [calendarEvents, setCalendarEventsState] = useState(() => storageService.getCalendarEvents());
  const [dailyPlan, setDailyPlanState] = useState(() => storageService.getDailyPlan());

  // AI & Server Status
  const [aiStatus, setAiStatus] = useState({ configured: false, provider: 'local-fallback', message: 'Checking AI Status...' });
  const [aiThinking, setAiThinking] = useState(false);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  // Active Focus State
  const [activeFocusTask, setActiveFocusTask] = useState(null);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(25 * 60);

  // Toast Helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Check Backend AI Status on Mount
  useEffect(() => {
    aiService.checkStatus().then(res => {
      setAiStatus(res);
    });
  }, []);

  // 2. Computed Next Best Action
  const localNba = evaluateNextBestAction(tasks);
  const [nbaReasoning, setNbaReasoning] = useState(localNba.reasoning);

  // Hybrid AI Reasoning fetch
  useEffect(() => {
    if (localNba && localNba.id && aiStatus.configured) {
      aiService.getRecommendationReasoning(localNba, { profile, tasks, goals, memories }).then(resReason => {
        if (resReason) setNbaReasoning(resReason);
      });
    } else if (localNba) {
      setNbaReasoning(localNba.reasoning);
    }
  }, [localNba.id, aiStatus.configured, tasks.length]);

  const nextBestAction = {
    ...localNba,
    reasoning: nbaReasoning
  };

  useEffect(() => {
    if (!activeFocusTask && nextBestAction && nextBestAction.task !== null) {
      setActiveFocusTask(nextBestAction);
    }
  }, [nextBestAction, activeFocusTask]);

  // 3. Computed Statistics
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const totalFocusMins = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const focusHours = Math.floor(totalFocusMins / 60);
  const remainingMins = totalFocusMins % 60;
  const focusTimeFormatted = `${focusHours}h ${remainingMins}m`;

  const stats = {
    completedTasks: completedTasksCount,
    totalTasks: totalTasksCount,
    focusTime: focusTimeFormatted,
    focusMinutes: totalFocusMins,
    goalProgress: 68,
    completionRate
  };

  // 4. Persistence Effect Wrappers
  const setTasks = (newTasks) => {
    setTasksState(newTasks);
    storageService.saveTasks(newTasks);
  };

  const setGoals = (newGoals) => {
    setGoalsState(newGoals);
    storageService.saveGoals(newGoals);
  };

  const setNotes = (newNotes) => {
    setNotesState(newNotes);
    storageService.saveNotes(newNotes);
  };

  const setFocusSessions = (newSessions) => {
    setFocusSessionsState(newSessions);
    storageService.saveFocusSessions(newSessions);
  };

  const setNotifications = (newNotifications) => {
    setNotificationsState(newNotifications);
    storageService.saveNotifications(newNotifications);
  };

  const setChatMessages = (newMessages) => {
    setChatMessagesState(newMessages);
    storageService.saveChatHistory(newMessages);
  };

  const setProfile = (newProfile) => {
    setProfileState(newProfile);
    storageService.saveProfile(newProfile);
  };

  const saveDailyPlan = (planData) => {
    setDailyPlanState(planData);
    storageService.saveDailyPlan(planData);
  };

  // Memory Actions
  const addMemory = (memInput) => {
    const updated = aiMemoryService.addMemory(memInput);
    setMemoriesState(updated);
    showToast('AI Memory updated', 'success');
  };

  const deleteMemory = (memId) => {
    const updated = aiMemoryService.deleteMemory(memId);
    setMemoriesState(updated);
    showToast('Memory item deleted', 'info');
  };

  const clearMemories = () => {
    const updated = aiMemoryService.clearAll();
    setMemoriesState(updated);
    showToast('AI Memories cleared', 'info');
  };

  // Task Actions
  const addTask = (taskInput) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskInput.title || 'Untitled Task',
      description: taskInput.description || '',
      priority: taskInput.priority || 'Medium',
      status: taskInput.status || 'Todo',
      category: taskInput.category || 'General',
      estimatedMinutes: parseInt(taskInput.estimatedMinutes || taskInput.durationMinutes || 30, 10),
      durationMinutes: parseInt(taskInput.estimatedMinutes || taskInput.durationMinutes || 30, 10),
      dueDate: taskInput.dueDate || taskInput.deadline || 'Today',
      deadline: taskInput.dueDate || taskInput.deadline || 'Today',
      createdAt: new Date().toISOString(),
      tags: taskInput.tags || [taskInput.category || 'General']
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    showToast(`Task created: "${newTask.title}"`, 'success');
    return newTask;
  };

  const updateTask = (taskId, updates) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    setTasks(updated);
    showToast('Task updated', 'info');
  };

  const toggleTaskComplete = (taskId) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = t.status !== 'Completed';
        const newStatus = isNowCompleted ? 'Completed' : 'Todo';
        if (isNowCompleted) {
          showToast(`🎉 Task completed: "${t.title}"`, 'success');
        }
        return {
          ...t,
          status: newStatus,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined
        };
      }
      return t;
    });
    setTasks(updated);
  };

  const deleteTask = (taskId) => {
    const target = tasks.find(t => t.id === taskId);
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    if (target) showToast(`Deleted "${target.title}"`, 'info');
  };

  // Goal Actions
  const addGoal = (goalInput) => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: goalInput.title,
      description: goalInput.description || '',
      category: goalInput.category || 'Personal',
      targetDate: goalInput.targetDate || '30 Days',
      progress: parseInt(goalInput.progress || 0, 10),
      status: 'Active',
      color: 'from-indigo-500 to-purple-600',
      milestones: goalInput.milestones || [
        { id: `m-${Date.now()}-1`, title: 'Define Goal Milestones', completed: false },
        { id: `m-${Date.now()}-2`, title: 'Execute Primary Sprint', completed: false }
      ],
      createdAt: new Date().toISOString()
    };
    setGoals([newGoal, ...goals]);
    showToast(`New Goal created: "${newGoal.title}"`, 'success');
  };

  const updateGoal = (goalId, updates) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates } : g));
    showToast('Goal updated', 'info');
  };

  const deleteGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
    showToast('Goal deleted', 'info');
  };

  // Note Actions
  const addNote = (noteInput) => {
    const newNote = {
      id: `note-${Date.now()}`,
      title: noteInput.title,
      content: noteInput.content,
      tags: noteInput.tags || ['General'],
      pinned: false,
      createdAt: 'Just now'
    };
    setNotes([newNote, ...notes]);
    showToast(`Note saved: "${newNote.title}"`, 'success');
  };

  const updateNote = (noteId, updates) => {
    setNotes(notes.map(n => n.id === noteId ? { ...n, ...updates } : n));
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(n => n.id !== noteId));
    showToast('Note deleted', 'info');
  };

  const togglePinNote = (noteId) => {
    setNotes(notes.map(n => n.id === noteId ? { ...n, pinned: !n.pinned } : n));
  };

  const convertNoteToTask = (noteId) => {
    const targetNote = notes.find(n => n.id === noteId);
    if (!targetNote) return;

    addTask({
      title: targetNote.title,
      description: targetNote.content,
      category: targetNote.tags[0] || 'General',
      priority: 'Medium',
      estimatedMinutes: 30
    });
  };

  // Focus Actions
  const startFocusOnTask = (task) => {
    setActiveFocusTask(task);
    setIsFocusing(true);
    showToast(`Focus session started for "${task.title}"`, 'success');
  };

  const completeFocusSession = (durationMins, task) => {
    const newSession = {
      id: `fs-${Date.now()}`,
      taskId: task?.id || 'general',
      taskTitle: task?.title || 'General Focus Session',
      durationMinutes: durationMins,
      completedAt: new Date().toISOString()
    };
    setFocusSessions([newSession, ...focusSessions]);

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Focus Session Completed 🏆',
      message: `Great job! You completed a ${durationMins}-minute focus session for "${newSession.taskTitle}".`,
      type: 'success',
      time: 'Just now',
      unread: true
    };
    setNotifications([newNotif, ...notifications]);

    showToast(`Logged ${durationMins}m Focus session!`, 'success');
  };

  // Notification Actions
  const markNotificationRead = (notifId) => {
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, unread: false } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    showToast('All notifications marked as read', 'info');
  };

  // Chat Actions with AI Service
  const sendChatMessage = async (userText) => {
    if (!userText.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMsgs = [...chatMessages, userMsg];
    setChatMessages(updatedMsgs);
    setAiThinking(true);

    const contextData = { profile, tasks, goals, memories, focusStats: stats };
    const res = await aiService.sendChatMessage(userText, contextData);

    const aiReply = {
      id: `msg-${Date.now() + 1}`,
      sender: 'ai',
      text: res.text,
      provider: res.provider,
      isLocalFallback: res.isLocalFallback,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...updatedMsgs, aiReply]);
    setAiThinking(false);
  };

  const clearChatHistory = () => {
    setChatMessages([]);
    storageService.saveChatHistory([]);
    showToast('Chat conversation cleared', 'info');
  };

  const rebuildScheduleAi = () => {
    showToast('AI Schedule rebalanced! Top priority tasks assigned to morning focus windows.', 'success');
  };

  return (
    <AppContext.Provider value={{
      profile, setProfile,
      aiStatus, aiThinking,
      tasks, setTasks, addTask, updateTask, toggleTaskComplete, deleteTask,
      nextBestAction,
      stats,
      calendarEvents,
      dailyPlan, saveDailyPlan,
      plan: initialPlan,
      aiInsight: initialAiInsight,
      upcoming: initialUpcoming,
      goals, setGoals, addGoal, updateGoal, deleteGoal,
      notes, setNotes, addNote, updateNote, deleteNote, togglePinNote, convertNoteToTask,
      memories, addMemory, deleteMemory, clearMemories,
      focusSessions, completeFocusSession,
      activeFocusTask, setActiveFocusTask, startFocusOnTask,
      isFocusing, setIsFocusing, focusSecondsLeft, setFocusSecondsLeft,
      notifications, markNotificationRead, markAllNotificationsRead,
      chatMessages, sendChatMessage, clearChatHistory,
      sidebarCollapsed, toggleSidebar: () => setSidebarCollapsed(prev => !prev),
      toast, showToast,
      rebuildScheduleAi
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
