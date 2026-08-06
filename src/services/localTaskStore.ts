// src/services/localTaskStore.ts
// Device-local persistence (localStorage). This is the default store:
// One Job runs entirely on-device unless a backend is configured.

import { Task, InteriorDeck } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import type { TaskStore } from './taskStore';
import { mirrorToNativeStorage } from './nativeStorageBridge';
import { reviveTask, sortTasks, topSortOrder, applyCompletion, applyDeferral, applyUncompletion, applyArchive, applyUnarchive, applyTrash, applyRestoreFromTrash, cardRoom, findCardById, findDeckById, findDeckOfCard, findParentOfCard, findCardOwningDeck, collectDescendantIds, unfinishedDescendants, nextDeckColor } from '@/domain/tasks';
import { migrateDocument, CURRENT_SCHEMA_VERSION, FutureDataError } from '@/domain/migrate';

/** Dated snapshots kept as a wipe/corruption safety net */
const SNAPSHOT_RETENTION = 7;

export class LocalTaskStore implements TaskStore {
  // v3 (R2.1 stage 1): ROOT DECKS are the source of truth — the root is
  // "the interior of no card," same InteriorDeck shape as every card's
  // interior. The model carries N decks from day one; today's UI (and
  // the pro wall, when the business work lands) uses deck[0].
  protected decks: InteriorDeck[] = [];

  /** When false, saveTasks() does not push onto the undo stack — used by
      undo itself (so repeated undo walks history) and by non-user
      mutations like the launch housekeeping sweep. Declared here because
      housekeep() runs from the constructor, before the undo section. */
  private capturingUndo = true;

  /** The ACTIVE deck's cards — the deck the UI is showing. All the
      single-deck-era code reads and writes through this accessor
      unchanged; cross-deck operations (find, housekeeping, trash, undo)
      walk this.decks. */
  protected get tasks(): Task[] {
    return this.activeDeck().cards;
  }
  protected set tasks(cards: Task[]) {
    this.activeDeck().cards = cards;
  }

  // ---- Active deck (R2.1 stage 2) --------------------------------------
  // A DEVICE preference, not deck data: which root deck this device is
  // looking at. Lives beside the document, never inside it, so backups
  // and sync never carry one device's viewpoint to another.
  private activeId: string | null = null;

  private activeDeckPrefKey() {
    return `${this.storageKey}.activeDeck`;
  }

  /** Self-healing resolve: a stale/undone/deleted pointer falls back to
      deck[0] rather than stranding the UI on a ghost. */
  private activeDeck(): InteriorDeck {
    const found = this.activeId && this.decks.find(d => d.id === this.activeId);
    if (found) return found;
    this.activeId = this.decks[0].id;
    return this.decks[0];
  }

  activeDeckId(): string {
    return this.activeDeck().id;
  }

  async getDecks(): Promise<InteriorDeck[]> {
    return this.decks;
  }

  /** New empty root deck. Unnamed decks get the next free "deck-N" slug
      (import-N's sibling). The PRO WALL gates calls to this in the UI —
      the store is mechanism, entitlement is policy (data from a pro
      backup must load anywhere). */
  async createDeck(name?: string): Promise<InteriorDeck> {
    let finalName = name?.trim();
    if (!finalName) {
      let n = 1;
      while (this.decks.some(d => d.name === `deck-${n}`)) n++;
      finalName = `deck-${n}`;
    }
    const deck: InteriorDeck = {
      id: `root-${uuidv4()}`,
      name: finalName,
      createdAt: new Date(),
      cards: [],
      // Identity hue assigned at creation, stored ON the deck (deck data,
      // not device preference). First deck = brand = no color.
      color: nextDeckColor(this.decks),
    };
    this.decks.push(deck);
    this.saveTasks();
    return deck;
  }

  async switchDeck(id: string): Promise<void> {
    if (!this.decks.some(d => d.id === id)) throw new Error('Unknown deck');
    this.activeId = id;
    try {
      localStorage.setItem(this.activeDeckPrefKey(), id);
    } catch { /* preference only — losing it costs a tap, never data */ }
  }

  async renameDeck(id: string, name: string): Promise<InteriorDeck> {
    const deck = this.decks.find(d => d.id === id);
    if (!deck) throw new Error('Unknown deck');
    const trimmed = name.trim();
    if (!trimmed) throw new Error('A deck needs a name');
    deck.name = trimmed;
    this.saveTasks();
    return deck;
  }

  /** Append fully-formed cards to a root deck's bottom and persist —
      the SourceAdapter seam's write path (R3.1). Cards arrive with
      LOCAL ids and provenance already stamped; this method is dumb on
      purpose (mechanism, not policy). */
  async addCardsToDeck(deckId: string, cards: Task[]): Promise<void> {
    const deck = this.decks.find(d => d.id === deckId);
    if (!deck) throw new Error('Unknown deck');
    deck.cards.push(...cards);
    this.saveTasks();
  }

  /** Move a TOP-LEVEL card to another root deck, landing on TOP of the
      target (newest-on-top rule) — R2.1 stage 3, where promote-at-top
      stops refusing and gains its meaning. Nested cards must promote
      first: the move grammar stays one altitude at a time. */
  async moveCardToDeck(cardId: string, deckId: string): Promise<Task> {
    const target = this.decks.find(d => d.id === deckId);
    if (!target) throw new Error('Unknown deck');
    const source = this.decks.find(d => d.cards.some(c => c.id === cardId));
    if (!source) {
      // Distinguish "doesn't exist" from "exists but nested"
      if (findCardById(this.decks.flatMap(d => d.cards), cardId)) {
        throw new Error('Only top-level cards move between decks — promote it first');
      }
      throw new Error('Task not found');
    }
    if (source.id === target.id) throw new Error('The card is already in that deck');
    const index = source.cards.findIndex(c => c.id === cardId);
    const [card] = source.cards.splice(index, 1);
    card.sortOrder = topSortOrder(target.cards);
    target.cards.push(card);
    this.saveTasks();
    return card;
  }

  /** Empty decks only — a deck holding cards can't be deleted (the
      sealed-card lesson generalized: no operation may bury or discard
      cards as a side effect). Never the last deck. */
  async deleteDeck(id: string): Promise<void> {
    const index = this.decks.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Unknown deck');
    if (this.decks[index].cards.length > 0) {
      throw new Error('This deck still holds cards — move them out first');
    }
    if (this.decks.length === 1) {
      throw new Error('The last deck cannot be deleted');
    }
    const wasActive = this.activeDeckId() === id;
    this.decks.splice(index, 1);
    if (wasActive) {
      this.activeId = this.decks[0].id;
      try { localStorage.setItem(this.activeDeckPrefKey(), this.activeId); } catch { /* pref only */ }
    }
    this.saveTasks();
  }

  /** The invariant every load path maintains: at least one root deck
      exists. "deck-1" per Xian's naming call (2026-07-29). */
  private ensureRootDeck() {
    if (this.decks.length === 0) {
      this.decks.push({
        id: `root-${uuidv4()}`,
        name: 'deck-1',
        createdAt: new Date(),
        cards: [],
      });
    }
  }

  /** Adopt a migrated document: revive dates, guarantee a root deck. */
  private loadDocument(doc: { decks: InteriorDeck[] }) {
    this.decks = doc.decks.map(d => ({
      ...d,
      createdAt: new Date(d.createdAt),
      cards: d.cards.map(reviveTask),
    }));
    this.ensureRootDeck();
  }

  constructor(
    private storageKey: string,
    seedTasks: Task[] = [],
    private sourceLabel?: string
  ) {
    this.initializeTasks(seedTasks);
    try {
      this.activeId = localStorage.getItem(this.activeDeckPrefKey());
    } catch { /* preference only */ }
    this.activeDeck(); // resolve now so a stale pointer heals immediately
    this.housekeep();
  }

  // ---- Done→Archive housekeeping (Xian, 2026-07-29) ---------------------
  // "The Done stack isn't infinitely huge": done cards over 30 days old
  // are filed to the Archive at launch, at every depth, so skimming
  // recent Done stays humanly possible. The threshold is a candidate for
  // a paid-tier setting later (his note) — until then it is one constant.
  // The UI reads lastHousekeeping to witness the move with a quiet toast:
  // cards changing rooms unwatched would breach "state is place."
  private static readonly ARCHIVE_AFTER_DAYS = 30;

  /** How many cards the launch sweep just filed (0 when none). */
  lastHousekeeping = 0;

  private housekeep() {
    const cutoff = Date.now() - LocalTaskStore.ARCHIVE_AFTER_DAYS * 86_400_000;
    let moved = 0;
    const walk = (cards: Task[]) => {
      for (const c of cards) {
        // Only cards sitting in Done age out; archived/trashed are already
        // past it, and a done card with no completedAt is never guessed at.
        if (cardRoom(c) === 'done' && c.completedAt && c.completedAt.getTime() < cutoff) {
          c.archivedAt = new Date();
          moved++;
        }
        for (const d of c.decks ?? []) walk(d.cards);
      }
    };
    for (const deck of this.decks) walk(deck.cards);
    if (moved > 0) {
      // NOT undoable: housekeeping is a background chore, not a user
      // action. Capturing it meant a shake right after launch offered
      // "Undo last action?" and then reversed the SWEEP — which reads as
      // "undo did nothing" because the card the user actually completed
      // (in a previous, since-discarded session) never came back.
      // Xian hit exactly this on 2026-08-06. Undo reverses what the
      // PERSON did; nothing else may occupy that stack.
      this.capturingUndo = false;
      try { this.saveTasks(); } finally { this.capturingUndo = true; }
    }
    this.lastHousekeeping = moved;
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
        const wasV2 = !wasV1 && raw !== null && typeof raw === 'object'
          && (raw as { schemaVersion?: number }).schemaVersion === 2;
        // Migration paranoia: preserve the untouched prior-version
        // document once, BEFORE anything writes the new shape
        // (irreversibility umbrella)
        if (wasV1 && !localStorage.getItem(`${this.storageKey}.v1backup`)) {
          localStorage.setItem(`${this.storageKey}.v1backup`, saved);
        }
        if (wasV2 && !localStorage.getItem(`${this.storageKey}.v2backup`)) {
          localStorage.setItem(`${this.storageKey}.v2backup`, saved);
        }
        this.loadDocument(migrateDocument(raw));
        if (wasV1 || wasV2) {
          console.warn(`Migrated "${this.storageKey}" v${wasV1 ? 1 : 2} → v${CURRENT_SCHEMA_VERSION}; prior copy kept at ${this.storageKey}.v${wasV1 ? 1 : 2}backup`);
          this.saveTasks(); // persist the v3 envelope immediately
        } else {
          this.writeSnapshot(this.serialize());
        }
        return;
      } catch (err) {
        // Future data is NOT corruption: quarantining + snapshot-restore
        // would roll an OLDER snapshot over NEWER data and then save it —
        // converting a loud refusal into silent loss. Refuse to construct;
        // the stored document stays byte-identical and a newer build reads
        // it fine. (2026-08-04: rc.8 x v3 data, the near-wipe.)
        if (err instanceof FutureDataError) throw err;
        // Preserve the unreadable payload for manual recovery — never clobber it
        localStorage.setItem(`${this.storageKey}.corrupt.${Date.now()}`, saved);
        console.warn(`Corrupt data in "${this.storageKey}" quarantined; attempting snapshot restore`);
        if (this.restoreFromSnapshot()) return;
      }
    } else if (this.restoreFromSnapshot()) {
      return;
    }
    this.ensureRootDeck();
    this.tasks = [...seedTasks];
    this.saveTasks();
  }

  /** Current storage document as a string (v3 envelope). */
  private serialize(): string {
    return JSON.stringify({ schemaVersion: CURRENT_SCHEMA_VERSION, decks: this.decks });
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
        // Snapshots may predate v3 (v2 envelopes, even bare v1 arrays)
        // — migrate on the way in
        const doc = migrateDocument(JSON.parse(raw));
        const count = doc.decks.reduce((n, d) => n + d.cards.length, 0);
        if (count === 0) continue;
        this.loadDocument(doc);
        console.warn(`"${this.storageKey}" was missing; restored ${count} tasks from ${key}`);
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
          const prior = migrateDocument(JSON.parse(existing));
          if (prior.decks.some(d => d.cards.length > 0)) return;
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
    this.loadDocument(migrateDocument(JSON.parse(prev)));
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
    // Recursive: a card is a card at any depth (sub-sub-tasks, Item 8),
    // in any root deck (R2.1).
    for (const deck of this.decks) {
      const task = findCardById(deck.cards, id);
      if (task) return task;
    }
    throw new Error('Task not found');
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
    for (const deck of this.decks) deck.cards = sweep(deck.cards);
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
    // Backups may carry v1 (substacks) or v2 (decks) card shapes —
    // migrate either way in; the cards land in the current root deck.
    this.tasks = migrateDocument(tasks).decks.flatMap(d => d.cards).map(reviveTask);
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
    const migrated = migrateDocument(tasks).decks.flatMap(d => d.cards).map(reviveTask);
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
