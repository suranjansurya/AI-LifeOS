import { storageService } from './storageService';

const MEMORY_KEY = 'ai_lifeos_memories_v3';

const initialMemories = [
  {
    id: 'mem-1',
    type: 'preference',
    key: 'preferredStudyTime',
    value: 'Morning (09:00 - 11:30 AM)',
    createdAt: '2026-08-20'
  },
  {
    id: 'mem-2',
    type: 'preference',
    key: 'preferredFocusDuration',
    value: '25-minute Pomodoro sprints with 5m rest buffers',
    createdAt: '2026-08-21'
  },
  {
    id: 'mem-3',
    type: 'goal',
    key: 'primaryTrack',
    value: 'Targeting an AI/ML Engineer role with PyTorch & RAG skills',
    createdAt: '2026-08-22'
  }
];

export const aiMemoryService = {
  getMemories: () => {
    try {
      const raw = localStorage.getItem(MEMORY_KEY);
      if (!raw) return initialMemories;
      return JSON.parse(raw) || initialMemories;
    } catch (e) {
      return initialMemories;
    }
  },

  saveMemories: (memories) => {
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
    } catch (e) {
      console.error('Error saving memories:', e);
    }
  },

  addMemory: (memory) => {
    const memories = aiMemoryService.getMemories();
    const newMem = {
      id: `mem-${Date.now()}`,
      type: memory.type || 'preference',
      key: memory.key || 'Custom Preference',
      value: memory.value || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newMem, ...memories];
    aiMemoryService.saveMemories(updated);
    return updated;
  },

  deleteMemory: (id) => {
    const memories = aiMemoryService.getMemories();
    const updated = memories.filter(m => m.id !== id);
    aiMemoryService.saveMemories(updated);
    return updated;
  },

  clearAll: () => {
    aiMemoryService.saveMemories([]);
    return [];
  }
};
