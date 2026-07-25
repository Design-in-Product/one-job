// src/services/localTaskStore.ts
// Device-local persistence (localStorage). This is the default store:
// One Job runs entirely on-device unless a backend is configured.

import { Task, InteriorDeck } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import type { TaskStore } from './taskStore';
import { mirrorToNativeStorage } from './nativeStorageBridge';
import { reviveTask, sortTasks, topSortOrder, applyCompletion, applyDeferral, applyUncompletion, applyArchive, applyUnarchive, applyTrash, applyRestoreFromTrash, cardRoom, findCardById, findDeckById, findDeckOfCard, findParentOfCard, collectDescendantIds } from '@/domain/tasks';
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
    // Recursive: a card is a card at any depth (sub-sub-tasks, Item 8)
    const task = findCardById(this.tasks, id);
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
    // Un-done returns the card to the TOP of whichever deck holds it:
    // sortOrder for the main deck, array order for interior decks.
    const deck = this.tasks.some(t => t.id === id)
      ? null
      : findDeckOfCard(this.tasks, id);
    const task = applyUncompletion(this.findTask(id), deck ? deck.cards : this.tasks);
    if (deck) {
      const index = deck.cards.findIndex(c => c.id === id);
      deck.cards.splice(index, 1);
      deck.cards.unshift(task);
    }
    this.saveTasks();
    return task;
  }

  /** Splice a card out of whichever collection holds it (root or any
      sub-deck) and return it. Shared by promote/move. */
  private removeCard(id: string): Task {
    const rootIndex = this.tasks.findIndex(t => t.id === id);
    if (rootIndex !== -1) return this.tasks.splice(rootIndex, 1)[0];
    const deck = findDeckOfCard(this.tasks, id);
    const index = deck?.cards.findIndex(c => c.id === id) ?? -1;
    if (!deck || index === -1) throw new Error('Task not found');
    return deck.cards.splice(index, 1)[0];
  }

  /** Promote a sub-card to be a peer of its parent (MVP blocker 1).
      A top-level card has no parent to rise past — that's an error. The
      promoted card lands newest-on-top of its new home. */
  async promoteCard(id: string): Promise<Task> {
    const parentCard = findParentOfCard(this.tasks, id);
    if (!parentCard) throw new Error('Card is already at the top level');
    const card = this.removeCard(id);
    if (this.tasks.some(t => t.id === parentCard.id)) {
      // Parent is top-level → the card joins the main deck, on top.
      card.sortOrder = topSortOrder(this.tasks);
      this.tasks.push(card);
    } else {
      // Parent is itself a sub-card → the card joins the parent's deck.
      findDeckOfCard(this.tasks, parentCard.id)!.cards.unshift(card);
    }
    this.saveTasks();
    return card;
  }

  /** Move a card into another card's interior deck (MVP blocker 1),
      creating the deck if the target has none. Newest-on-top. Rejects
      moving a card into itself or into its own descendant (no cycles). */
  async moveCardInto(id: string, targetId: string): Promise<Task> {
    if (id === targetId) throw new Error('Cannot move a card into itself');
    const card = findCardById(this.tasks, id);
    if (!card) throw new Error('Task not found');
    const target = findCardById(this.tasks, targetId);
    if (!target) throw new Error('Target card not found');
    if (collectDescendantIds(card).has(targetId)) {
      throw new Error('Cannot move a card into its own descendant');
    }
    const moved = this.removeCard(id);
    target.decks = target.decks ?? [];
    if (target.decks.length === 0) {
      target.decks.push({ id: uuidv4(), name: null, cards: [], createdAt: new Date() });
    }
    target.decks[0].cards.unshift(moved);
    this.saveTasks();
    return moved;
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
    const deck = findDeckById(this.tasks, substackId);
    if (!deck) throw new Error('Substack not found');
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

  async completeSubstackTask(id: string): Promise<Task> {
    const deck = findDeckOfCard(this.tasks, id);
    const card = deck?.cards.find(c => c.id === id);
    if (!card) throw new Error('Substack task not found');
    card.completed = true;
    card.completedAt = new Date();
    this.saveTasks();
    return card;
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
      allowed ONLY from the trash, confirmed by the UI beforehand.
      Works at any depth — the card is spliced out of whichever
      collection actually holds it. */
  async purgeTask(id: string): Promise<void> {
    const holder = this.tasks.some(t => t.id === id)
      ? this.tasks
      : findDeckOfCard(this.tasks, id)?.cards;
    const index = holder?.findIndex(c => c.id === id) ?? -1;
    if (!holder || index === -1) throw new Error('Task not found');
    if (cardRoom(holder[index]) !== 'trash') {
      throw new Error('Only trashed cards can be purged');
    }
    holder.splice(index, 1);
    this.saveTasks();
  }

  async deferSubstackTask(id: string): Promise<Task> {
    const deck = findDeckOfCard(this.tasks, id);
    if (!deck) throw new Error('Substack task not found');
    const index = deck.cards.findIndex(c => c.id === id);
    const card = applyDeferral(deck.cards[index], deck.cards);
    // display order = array order in sub-decks: move to the bottom
    deck.cards.splice(index, 1);
    deck.cards.push(card);
    this.saveTasks();
    return card;
  }

  /**
   * Undo support: put a task back exactly as it was in the snapshot
   * (completion, timestamps, deferral count, sort order).
   */
  async restoreTask(snapshot: Task): Promise<void> {
    const holder = this.tasks.some(t => t.id === snapshot.id)
      ? this.tasks
      : findDeckOfCard(this.tasks, snapshot.id)?.cards;
    const index = holder?.findIndex(c => c.id === snapshot.id) ?? -1;
    if (!holder || index === -1) throw new Error('Task not found');
    holder[index] = reviveTask(structuredClone(snapshot));
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
