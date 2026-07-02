// src/services/demoService.ts
// The demo is just the local store with seed data and playful messages,
// kept in its own localStorage key so it never touches real tasks.

import { mockTasks, getRandomDemoMessage } from '@/data/mockTasks';
import { LocalTaskStore } from './localTaskStore';

const DEMO_STORAGE_KEY = 'oneJobDemoTasks';

export class DemoService extends LocalTaskStore {
  private static instance: DemoService;

  private constructor() {
    super(DEMO_STORAGE_KEY, mockTasks, 'Demo');
  }

  static getInstance(): DemoService {
    if (!DemoService.instance) {
      DemoService.instance = new DemoService();
    }
    return DemoService.instance;
  }

  // Reset demo to initial state
  resetDemo(): void {
    this.reset(mockTasks);
  }

  // Get demo message for user feedback
  getDemoMessage(type: 'taskCompleted' | 'taskDeferred' | 'taskAdded' | 'substackCreated'): string {
    return getRandomDemoMessage(type);
  }
}
