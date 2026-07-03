// src/services/demoService.ts
// The demo is just the local store with seed data and playful messages,
// kept in its own localStorage key so it never touches real tasks.

import { mockTasks } from '@/data/mockTasks';
import i18n from '@/i18n';
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

  // Get demo message for user feedback (arrays live in the locale files)
  getDemoMessage(type: 'taskCompleted' | 'taskDeferred' | 'taskAdded' | 'substackCreated'): string {
    const messages = i18n.t(`demo.${type}`, { returnObjects: true }) as string[];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
