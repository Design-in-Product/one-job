// src/services/localTaskStore.ts
// Device-local persistence (localStorage). This is the default store:
// One Job runs entirely on-device unless a backend is configured.

import { Task, InteriorDeck } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import type { TaskStore } from './taskStore';
import { mirrorToNativeStorage } from './nativeStorageBridge';
import { reviveTask, sortTasks, topSortOrder, applyCompletion, applyDeferral, applyUncompletion, applyArchive, applyUnarchive, applyTrash, applyRestoreFromTrash, cardRoom } from '@/domain/tasks';
import { migrateDocument, CURRENT_SCHEMA_VERSION } from '@/domain/migrate';

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
        const raw = JSON.parse(saved);
        const wasV1 = Array.isArray(raw);
        if (wasV1 && !localStorage.getItem(`${this.storageKey}.v1backup`)) {
          // Migration paranoia: preserve the untouched v1 document once,
          // BEFORE anything writes the new shape (irreversibility umbrella)
          localStorage.setItem(`${this.storageKey}.v1backup`, saved);
        }
        this.tasks = migrateDocument(raw).cards.map(reviveTask);
        if (wasV1) {
          console.warn(`Migrated "${this.storageKey}" v1 → v${CURRENT_SCHEMA_VERSION}; v1 copy kept at ${this.storageKey}.v1backup`);
          this.saveTasks(); // persist the v2 envelope immediately
        } else {
          this.writeSnapshot(this.serialize());
        }
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

  /** Current storage document as a string (v2 envelope). */
  private serialize(): string {
    return JSON.stringify({ schemaVersion: CURRENT_SCHEMA_VERSION, cards: this.tasks });
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
        // Snapshots may predate v2 (bare arrays) — migrate on the way in
        const tasks = migrateDocument(JSON.parse(raw)).cards.map(reviveTask);
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
      if (existing) {
        try {
          if (migrateDocument(JSON.parse(existing)).cards.length > 0) return;
        } catch {
          /* unreadable existing snapshot — overwriting is an improvement */
        }
      }
    }
    localStorage.setItem(key, serialized);
    const stale = this.listSnapshotKeys().reverse().slice(SNAPSHOT_RETENTION);
    stale.forEach(k => localStorage.removeItem(k));
  }

  protected saveTasks() {
    const serialized = this.serialize();
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
      sortOrder: topSortOrder(this.tasks),
      source: this.sourceLabel,
      decks: []
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

  async uncompleteTask(id: string): Promise<Task> {
    const task = applyUncompletion(this.findTask(id), this.tasks);
    this.saveTasks();
    return task;
  }

  async createSubstack(taskId: string, name: string | null): Promise<InteriorDeck> {
    const task = this.findTask(taskId);
    const newDeck: InteriorDeck = {
      id: uuidv4(),
      name,
      cards: [],
      createdAt: new Date()
    };
    task.decks = task.decks || [];
    task.decks.push(newDeck);
    this.saveTasks();
    return newDeck;
  }

  async addSubstackTask(substackId: string, title: string, description?: string): Promise<Task> {
    for (const task of this.tasks) {
      const deck = task.decks?.find(d => d.id === substackId);
      if (deck) {
        const newCard: Task = {
          id: uuidv4(),
          title,
          description,
          completed: false,
          createdAt: new Date(),
          sortOrder: topSortOrder(deck.cards)
        };
        // New items land on top in sub-decks too (display order = array order)
        deck.cards.unshift(newCard);
        this.saveTasks();
        return newCard;
      }
    }
    throw new Error('Substack not found');
  }

  async completeSubstackTask(id: string): Promise<Task> {
    for (const task of this.tasks) {
      for (const deck of task.decks || []) {
        const card = deck.cards.find(c => c.id === id);
        if (card) {
          card.completed = true;
          card.completedAt = new Date();
          this.saveTasks();
          return card;
        }
      }
    }
    throw new Error('Substack task not found');
  }

  // ---- Lifecycle chain (R1.2): each move guards on the room the card
  // is actually in, so a stale UI can never skip a card down the chain.

  async archiveTask(id: string): Promise<Task> {
    const task = this.findTask(id);
    if (cardRoom(task) !== 'done') throw new Error('Only done cards can be archived');
    applyArchive(task);
    this.saveTasks();
    return task;
  }

  async unarchiveTask(id: string): Promise<Task> {
    const task = this.findTask(id);
    if (cardRoom(task) !== 'archive') throw new Error('Card is not archived');
    applyUnarchive(task);
    this.saveTasks();
    return task;
  }

  async trashTask(id: string): Promise<Task> {
    const task = this.findTask(id);
    if (cardRoom(task) !== 'archive') throw new Error('Only archived cards can be trashed');
    applyTrash(task);
    this.saveTasks();
    return task;
  }

  async restoreFromTrash(id: string): Promise<Task> {
    const task = this.findTask(id);
    if (cardRoom(task) !== 'trash') throw new Error('Card is not in the trash');
    applyRestoreFromTrash(task);
    this.saveTasks();
    return task;
  }

  /** The only destructive operation in the app: permanent removal,
      allowed ONLY from the trash, confirmed by the UI beforehand. */
  async purgeTask(id: string): Promise<void> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    if (cardRoom(this.tasks[index]) !== 'trash') {
      throw new Error('Only trashed cards can be purged');
    }
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  async deferSubstackTask(id: string): Promise<Task> {
    for (const task of this.tasks) {
      for (const deck of task.decks || []) {
        const index = deck.cards.findIndex(c => c.id === id);
        if (index !== -1) {
          const card = applyDeferral(deck.cards[index], deck.cards);
          // display order = array order in sub-decks: move to the bottom
          deck.cards.splice(index, 1);
          deck.cards.push(card);
          this.saveTasks();
          return card;
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
    // Backups may be v1 (substacks) or v2 (decks) — migrate either way in
    this.tasks = migrateDocument(tasks).cards.map(reviveTask);
    this.saveTasks();
  }

  /** Wipe this store's data (used by the demo reset) */
  protected reset(seedTasks: Task[]) {
    localStorage.removeItem(this.storageKey);
    this.tasks = [...seedTasks];
    this.saveTasks();
  }
}
