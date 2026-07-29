// src/services/localTaskStore.ts
// Device-local persistence (localStorage). This is the default store:
// One Job runs entirely on-device unless a backend is configured.

import { Task, InteriorDeck } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import type { TaskStore } from './taskStore';
import { mirrorToNativeStorage } from './nativeStorageBridge';
import { reviveTask, sortTasks, topSortOrder, applyCompletion, applyDeferral, applyUncompletion, applyArchive, applyUnarchive, applyTrash, applyRestoreFromTrash, cardRoom, findCardById, findDeckById, findDeckOfCard, findParentOfCard, findCardOwningDeck, collectDescendantIds, unfinishedDescendants } from '@/domain/tasks';
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

  // ---- Undo history (Xian, 2026-07-29) ----------------------------------
  // Every mutation funnels through saveTasks(), so capturing the PREVIOUS
  // stored document there gives whole-session undo with zero per-method
  // wiring — including reversal of a whole-deck import. Session-scoped by
  // design ("infinite undo or a reasonable approximation"): the in-memory
  // stack dies with the tab, and the dated on-disk snapshots remain the
  // coarse cross-session fallback. Capped so a marathon session can't grow
  // without bound.
  private undoStack: string[] = [];
  private capturingUndo = true;
  private static readonly UNDO_DEPTH = 500;

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /** Restore the deck to the state before the last mutation. False when
      there is nothing left to undo. The restore itself is NOT captured —
      otherwise repeated undo would bounce between two states instead of
      walking history (regression-tested). */
  async undoLast(): Promise<boolean> {
    const prev = this.undoStack.pop();
    if (prev === undefined) return false;
    this.tasks = migrateDocument(JSON.parse(prev)).cards.map(reviveTask);
    this.capturingUndo = false;
    try {
      this.saveTasks();
    } finally {
      this.capturingUndo = true;
    }
    return true;
  }

  protected saveTasks() {
    if (this.capturingUndo) {
      const prev = localStorage.getItem(this.storageKey);
      if (prev !== null) {
        this.undoStack.push(prev);
        if (this.undoStack.length > LocalTaskStore.UNDO_DEPTH) this.undoStack.shift();
      }
    }
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

  /**
   * Item 15, enforced where the data actually changes: "done" means the
   * whole job is done, so a card with unfinished work ANYWHERE in its
   * subtree cannot complete.
   *
   * This lived only in Index.tsx until 2026-07-28 — the UI. Every other
   * half of the sealed-card invariant (no move-into, no add-card, no
   * add-deck on a completed card) was already enforced here, and a
   * UI-only guard means any other path to completion can silently bury
   * active work inside a done card. That is the exact stranding the
   * invariant exists to prevent.
   *
   * The UI keeps its own check: it explains WHY and descends into the
   * blocking deck, which a thrown error cannot do. This is the backstop,
   * not the user experience.
   */
  private refuseIfUnfinishedInside(card: Task): void {
    const open = unfinishedDescendants(card);
    if (open.length > 0) {
      throw new Error(
        `Cannot complete "${card.title}": ${open.length} unfinished card${open.length === 1 ? '' : 's'} inside`
      );
    }
  }

  async completeTask(id: string): Promise<Task> {
    const found = this.findTask(id);
    this.refuseIfUnfinishedInside(found);
    const task = applyCompletion(found);
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
    // A completed card is hidden from the deck — dropping active work into
    // it would bury the work where navigation can't reach it (2026-07-26).
    if (target.completed) {
      throw new Error('Cannot move a card into a completed card');
    }
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
    // A completed card is sealed — no new decks, no new cards (Xian,
    // 2026-07-26: "we can't allow cards to be added to finished cards").
    if (task.completed) throw new Error('Cannot add a deck to a completed card');
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
    // Don't add work into a deck owned by a completed card — it would be
    // sealed away out of sight (Xian, 2026-07-26).
    const owner = findCardOwningDeck(this.tasks, substackId);
    if (owner?.completed) throw new Error('Cannot add a card to a completed card');
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
    this.refuseIfUnfinishedInside(card);
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

  /** Empty the whole trash in one move, at every depth. Returns how many
      cards were removed. Cards in the trash are NOT protected (Xian,
      2026-07-29) — the user already threw them away; the trash room is
      the confirmation. Still session-undoable like any other mutation. */
  async emptyTrash(): Promise<number> {
    let removed = 0;
    const sweep = (cards: Task[]): Task[] =>
      cards
        .filter(c => {
          if (cardRoom(c) === 'trash') {
            removed++;
            return false;
          }
          return true;
        })
        .map(c => {
          for (const d of c.decks ?? []) d.cards = sweep(d.cards);
          return c;
        });
    this.tasks = sweep(this.tasks);
    if (removed > 0) this.saveTasks();
    return removed;
  }

  /** Permanent removal, allowed ONLY from the trash. Works at any depth —
      the card is spliced out of whichever collection actually holds it.
      Since 2026-07-29 the trash room itself is the confirmation: swiping
      right on a trashed card purges it one-tap (Xian's call — "cards in
      the trash are not protected"). */
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

  /** Import an exported deck as a NEW top-level card (MVP blocker 4) — the
      non-destructive alternative to a full replace. The import lands in its
      own card ("import-1", "import-2", ... unless a name is given), so it's
      immediately visible and never collides with existing data.

      HARD LESSON (2026-07-26): the previous version attached the import as
      a SECOND deck on the existing top card — unreachable (the badge only
      opens a card's first deck) — AND kept the original card IDs, so every
      imported card was a shadow of an existing one. A copy must be its own
      cards: regenerate every id (Xian's call — "import-N", editable). */
  async importAsSubdeck(tasks: Task[], name?: string): Promise<void> {
    const migrated = migrateDocument(tasks).cards.map(reviveTask);
    if (migrated.length === 0) return;
    const incoming = this.regenerateIds(migrated);
    const container: Task = {
      id: uuidv4(),
      title: name?.trim() || this.nextImportName(),
      completed: false,
      status: 'todo',
      createdAt: new Date(),
      sortOrder: topSortOrder(this.tasks),
      decks: [{ id: uuidv4(), name: null, cards: incoming, createdAt: new Date() }],
    };
    this.tasks.push(container);
    this.saveTasks();
  }

  /** Deep-copy a card forest with brand-new ids at every level, so an
      imported copy can never shadow or collide with existing cards. */
  private regenerateIds(cards: Task[]): Task[] {
    return cards.map(c => ({
      ...c,
      id: uuidv4(),
      decks: c.decks?.map(d => ({ ...d, id: uuidv4(), cards: this.regenerateIds(d.cards) })),
    }));
  }

  /** The next unused "import-N" label among top-level cards. */
  private nextImportName(): string {
    let max = 0;
    for (const t of this.tasks) {
      const m = /^import-(\d+)$/.exec(t.title);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return `import-${max + 1}`;
  }

  /** Wipe this store's data (used by the demo reset) */
  protected reset(seedTasks: Task[]) {
    localStorage.removeItem(this.storageKey);
    this.tasks = [...seedTasks];
    this.saveTasks();
  }
}
