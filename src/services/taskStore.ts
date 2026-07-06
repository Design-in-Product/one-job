// src/services/taskStore.ts
// The persistence seam for One Job. The app is local-first: tasks live on
// the device (LocalTaskStore) unless a backend is explicitly configured
// (ApiTaskStore) or the demo is running (DemoService = local + seed data).
//
// Everything the UI does goes through this interface, which is also the
// place future adapters (Todoist, Jira, MCP...) will plug in.

import { Task, InteriorDeck } from '@/types/task';
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
  /** name null = the default unnamed sub-deck (Item 23) */
  createSubstack(taskId: string, name: string | null): Promise<InteriorDeck>;
  addSubstackTask(substackId: string, title: string, description?: string): Promise<Task>;
  completeSubstackTask(id: string): Promise<Task>;
  /** Persist a sub-deck deferral (card to the bottom of its deck). Optional
      until every store supports it — the UI falls back to local reorder. */
  deferSubstackTask?(id: string): Promise<Task>;
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
  /**
   * Recovery from accidental completion: return a completed task to the
   * top of the active deck. Optional for the same reason as above.
   */
  uncompleteTask?(id: string): Promise<Task>;
  /** Lifecycle chain (R1.2): Done → Archive → Trash, right advances,
      left regresses. Optional as a set — the UI shows the chain only
      when the store supports it. */
  archiveTask?(id: string): Promise<Task>;
  unarchiveTask?(id: string): Promise<Task>;
  trashTask?(id: string): Promise<Task>;
  restoreFromTrash?(id: string): Promise<Task>;
  /** Permanent removal; only from trash; UI confirms first. */
  purgeTask?(id: string): Promise<void>;
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
