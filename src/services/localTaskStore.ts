// src/services/localTaskStore.ts
// Device-local persistence (localStorage). This is the default store:
// One Job runs entirely on-device unless a backend is configured.

import { Task, Substack } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import type { TaskStore } from './taskStore';
import { mirrorToNativeStorage } from './nativeStorageBridge';
import { reviveTask, sortTasks, nextSortOrder, applyCompletion, applyDeferral } from '@/domain/tasks';

/** Dated snapshots kept as a wipe/corruption safety net */
const SNAPSHOT_RETENTION = 7;

export class LocalTaskStore implements TaskStore {
  protected tasks: Task[] = [];

  constructor(
    private storageKey: string,
    seedTasks: Task[] = [],
    private sourceLabel?: string
  ) {
    this.initializeTasks(seedTasks);
  }

  private metaKey() {
    return `${this.storageKey}.meta`;
  }

  private snapshotPrefix() {
    return `${this.storageKey}.snapshot.`;
  }

  private listSnapshotKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(this.snapshotPrefix())) keys.push(k);
    }
    return keys.sort(); // ISO dates sort chronologically
  }

  private initializeTasks(seedTasks: Task[]) {
    const saved = localStorage.getItem(this.storageKey);
    if (saved !== null) {
      try {
        this.tasks = (JSON.parse(saved) as Task[]).map(reviveTask);
        this.writeSnapshot(saved);
        return;
      } catch {
        // Preserve the unreadable payload for manual recovery — never clobber it
        localStorage.setItem(`${this.storageKey}.corrupt.${Date.now()}`, saved);
        console.warn(`Corrupt data in "${this.storageKey}" quarantined; attempting snapshot restore`);
        if (this.restoreFromSnapshot()) return;
      }
    } else if (this.restoreFromSnapshot()) {
      return;
    }
    this.tasks = [...seedTasks];
    this.saveTasks();
  }

  /**
   * The main key vanished or was unreadable. If meta says data existed,
   * bring back the newest readable snapshot rather than starting empty.
   */
  private restoreFromSnapshot(): boolean {
    const metaRaw = localStorage.getItem(this.metaKey());
    if (!metaRaw) return false; // genuinely fresh install
    try {
      if (!(JSON.parse(metaRaw).count > 0)) return false;
    } catch {
      return false;
    }
    for (const key of this.listSnapshotKeys().reverse()) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const tasks = (JSON.parse(raw) as Task[]).map(reviveTask);
        if (tasks.length === 0) continue;
        this.tasks = tasks;
        console.warn(`"${this.storageKey}" was missing; restored ${tasks.length} tasks from ${key}`);
        this.saveTasks();
        return true;
      } catch {
        // unreadable snapshot — try the next older one
      }
    }
    return false;
  }

  private writeSnapshot(serialized: string) {
    const key = `${this.snapshotPrefix()}${new Date().toISOString().slice(0, 10)}`;
    // Guard: an empty deck never overwrites a non-empty snapshot
    if (this.tasks.length === 0) {
      const existing = localStorage.getItem(key);
      if (existing && existing !== '[]') return;
    }
    localStorage.setItem(key, serialized);
    const stale = this.listSnapshotKeys().reverse().slice(SNAPSHOT_RETENTION);
    stale.forEach(k => localStorage.removeItem(k));
  }

  protected saveTasks() {
    const serialized = JSON.stringify(this.tasks);
    localStorage.setItem(this.storageKey, serialized);
    localStorage.setItem(
      this.metaKey(),
      JSON.stringify({ count: this.tasks.length, updatedAt: new Date().toISOString() })
    );
    this.writeSnapshot(serialized);
    mirrorToNativeStorage(this.storageKey, serialized);
  }

  private findTask(id: string): Task {
    const task = this.tasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    return task;
  }

  async getAllTasks(): Promise<Task[]> {
    return sortTasks([...this.tasks]);
  }

  async createTask(title: string, description?: string): Promise<Task> {
    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      status: 'todo',
      createdAt: new Date(),
      sortOrder: nextSortOrder(this.tasks),
      source: this.sourceLabel,
      substacks: []
    };
    this.tasks.push(newTask);
    this.saveTasks();
    return newTask;
  }

  async updateTask(id: string, updates: { title?: string; description?: string }): Promise<Task> {
    const task = this.findTask(id);
    Object.assign(task, updates);
    this.saveTasks();
    return task;
  }

  async completeTask(id: string): Promise<Task> {
    const task = applyCompletion(this.findTask(id));
    this.saveTasks();
    return task;
  }

  async deferTask(id: string): Promise<Task> {
    const task = applyDeferral(this.findTask(id), this.tasks);
    this.saveTasks();
    return task;
  }

  async createSubstack(taskId: string, name: string): Promise<Substack> {
    const task = this.findTask(taskId);
    const newSubstack: Substack = {
      id: uuidv4(),
      name,
      tasks: [],
      createdAt: new Date()
    };
    task.substacks = task.substacks || [];
    task.substacks.push(newSubstack);
    this.saveTasks();
    return newSubstack;
  }

  async addSubstackTask(substackId: string, title: string, description?: string): Promise<Task> {
    for (const task of this.tasks) {
      const substack = task.substacks?.find(s => s.id === substackId);
      if (substack) {
        const newSubstackTask: Task = {
          id: uuidv4(),
          title,
          description,
          completed: false,
          createdAt: new Date(),
          sortOrder: substack.tasks.length + 1
        };
        substack.tasks.push(newSubstackTask);
        this.saveTasks();
        return newSubstackTask;
      }
    }
    throw new Error('Substack not found');
  }

  async completeSubstackTask(id: string): Promise<Task> {
    for (const task of this.tasks) {
      for (const substack of task.substacks || []) {
        const subtask = substack.tasks.find(st => st.id === id);
        if (subtask) {
          subtask.completed = true;
          subtask.completedAt = new Date();
          this.saveTasks();
          return subtask;
        }
      }
    }
    throw new Error('Substack task not found');
  }

  /**
   * Undo support: put a task back exactly as it was in the snapshot
   * (completion, timestamps, deferral count, sort order).
   */
  async restoreTask(snapshot: Task): Promise<void> {
    const index = this.tasks.findIndex(t => t.id === snapshot.id);
    if (index === -1) throw new Error('Task not found');
    this.tasks[index] = reviveTask(structuredClone(snapshot));
    this.saveTasks();
  }

  async importTasks(tasks: Task[]): Promise<void> {
    this.tasks = tasks.map(reviveTask);
    this.saveTasks();
  }

  /** Wipe this store's data (used by the demo reset) */
  protected reset(seedTasks: Task[]) {
    localStorage.removeItem(this.storageKey);
    this.tasks = [...seedTasks];
    this.saveTasks();
  }
}
