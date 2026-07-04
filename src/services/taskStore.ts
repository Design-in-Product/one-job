// src/services/taskStore.ts
// The persistence seam for One Job. The app is local-first: tasks live on
// the device (LocalTaskStore) unless a backend is explicitly configured
// (ApiTaskStore) or the demo is running (DemoService = local + seed data).
//
// Everything the UI does goes through this interface, which is also the
// place future adapters (Todoist, Jira, MCP...) will plug in.

import { Task, Substack } from '@/types/task';
import { storageMode } from '@/config';
import { LocalTaskStore } from './localTaskStore';
import { ApiTaskStore } from './apiTaskStore';
import { DemoService } from './demoService';

export interface TaskStore {
  getAllTasks(): Promise<Task[]>;
  createTask(title: string, description?: string): Promise<Task>;
  /** Edit title/description */
  updateTask(id: string, updates: { title?: string; description?: string }): Promise<Task>;
  completeTask(id: string): Promise<Task>;
  /** Move a task to the bottom of the stack, tracking deferral count */
  deferTask(id: string): Promise<Task>;
  createSubstack(taskId: string, name: string): Promise<Substack>;
  addSubstackTask(substackId: string, title: string, description?: string): Promise<Task>;
  completeSubstackTask(id: string): Promise<Task>;
  /**
   * Replace all tasks with an imported backup. Absent on stores that
   * don't own their data (the API store) — the UI disables import there.
   */
  importTasks?(tasks: Task[]): Promise<void>;
  /**
   * Undo support: restore a task to a pre-action snapshot. Absent on
   * stores that can't guarantee it (the API store) — the UI only offers
   * Undo when this exists.
   */
  restoreTask?(snapshot: Task): Promise<void>;
}

let store: TaskStore | null = null;

export function getTaskStore(): TaskStore {
  if (!store) {
    switch (storageMode) {
      case 'demo':
        store = DemoService.getInstance();
        break;
      case 'remote':
        store = new ApiTaskStore();
        break;
      default:
        store = new LocalTaskStore('oneJobTasks');
    }
  }
  return store;
}
