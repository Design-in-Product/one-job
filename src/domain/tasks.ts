// src/domain/tasks.ts
// Pure domain operations for One Job — no React, no storage, no I/O.
// Extracted from LocalTaskStore (build sequence #6) with today's EXACT
// behavior; this module is the stepping stone the R1 schema work stands
// on. When the domain model lands (recursive cards, lifecycle decks),
// the rules change HERE and the stores stay dumb.

import { Task, InteriorDeck } from '@/types/task';

/**
 * Revive Date fields on a task and its nested substacks after JSON
 * parsing (storage loads and backup imports carry dates as strings).
 */
export const reviveTask = (t: Task): Task => ({
  ...t,
  createdAt: new Date(t.createdAt),
  completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
  archivedAt: t.archivedAt ? new Date(t.archivedAt) : undefined,
  trashedAt: t.trashedAt ? new Date(t.trashedAt) : undefined,
  deferredAt: t.deferredAt ? new Date(t.deferredAt) : undefined,
  decks: t.decks?.map(d => ({
    ...d,
    createdAt: new Date(d.createdAt),
    cards: d.cards.map(reviveTask)
  }))
});

/**
 * Deck order: active tasks first by ascending sortOrder, then completed
 * tasks by most recently completed. Sorts the given array in place and
 * returns it (callers pass a copy when they need one).
 */
export const sortTasks = (tasks: Task[]): Task[] =>
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (!a.completed && !b.completed) {
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    }
    const aDate = a.completedAt?.getTime() || 0;
    const bDate = b.completedAt?.getTime() || 0;
    return bDate - aDate;
  });

/** The sortOrder a task must take to sit at the bottom of the active deck. */
export const nextSortOrder = (tasks: Task[]): number => {
  const active = tasks.filter(t => !t.completed);
  return active.length > 0 ? Math.max(...active.map(t => t.sortOrder ?? 0)) + 1 : 1;
};

/**
 * The sortOrder a task must take to sit on TOP of the active deck.
 * New cards land here (Xian's call, 2026-07-05): what you just captured
 * IS your one job until you swipe it away.
 */
export const topSortOrder = (tasks: Task[]): number => {
  const active = tasks.filter(t => !t.completed);
  return active.length > 0 ? Math.min(...active.map(t => t.sortOrder ?? 0)) - 1 : 1;
};

/** Complete a task (mutates in place — store semantics today). */
export const applyCompletion = (task: Task): Task => {
  task.completed = true;
  task.status = 'done';
  task.completedAt = new Date();
  return task;
};

/**
 * Defer a task to the bottom of its deck (mutates in place), tracking
 * when and how often it has been put off.
 */
export const applyDeferral = (task: Task, tasks: Task[]): Task => {
  task.sortOrder = nextSortOrder(tasks);
  task.deferredAt = new Date();
  task.deferralCount = (task.deferralCount || 0) + 1;
  return task;
};

/**
 * Un-complete: recover an accidentally-finished task to the TOP of the
 * active deck ("actually, I didn't finish that"). Mutates in place.
 */
export const applyUncompletion = (task: Task, tasks: Task[]): Task => {
  const active = tasks.filter(t => !t.completed && t.id !== task.id);
  task.completed = false;
  task.status = 'todo';
  task.completedAt = undefined;
  task.sortOrder = active.length > 0
    ? Math.min(...active.map(t => t.sortOrder ?? 0)) - 1
    : 1;
  return task;
};

// ---- Lifecycle chain (R1.2): Todo -> Done -> Archive -> Trash ----
// Right advances, left regresses; state is derived from timestamps,
// never stored as an enum (Vision Items 2/10; docs/R1.2-CHAIN-DESIGN.md).

export type Room = 'deck' | 'done' | 'archive' | 'trash';

/** Which room of the lifecycle a card currently sits in. */
export const cardRoom = (t: Task): Room => {
  if (t.trashedAt) return 'trash';
  if (t.archivedAt) return 'archive';
  if (t.completed) return 'done';
  return 'deck';
};

export const applyArchive = (task: Task): Task => {
  task.archivedAt = new Date();
  return task;
};

export const applyUnarchive = (task: Task): Task => {
  task.archivedAt = undefined;
  return task;
};

export const applyTrash = (task: Task): Task => {
  task.trashedAt = new Date();
  return task;
};

export const applyRestoreFromTrash = (task: Task): Task => {
  task.trashedAt = undefined;
  return task;
};

// ---- Recursive lookups (cards all the way down — Item 8) ----

/** Find a card anywhere in the containment tree. */
export const findCardById = (cards: Task[], id: string): Task | undefined => {
  for (const c of cards) {
    if (c.id === id) return c;
    for (const d of c.decks ?? []) {
      const hit = findCardById(d.cards, id);
      if (hit) return hit;
    }
  }
  return undefined;
};

/** Find an interior deck anywhere in the containment tree. */
export const findDeckById = (cards: Task[], deckId: string): InteriorDeck | undefined => {
  for (const c of cards) {
    for (const d of c.decks ?? []) {
      if (d.id === deckId) return d;
      const hit = findDeckById(d.cards, deckId);
      if (hit) return hit;
    }
  }
  return undefined;
};

/** Find the deck that contains a given card, at any depth. */
export const findDeckOfCard = (cards: Task[], cardId: string): InteriorDeck | undefined => {
  for (const c of cards) {
    for (const d of c.decks ?? []) {
      if (d.cards.some(x => x.id === cardId)) return d;
      const hit = findDeckOfCard(d.cards, cardId);
      if (hit) return hit;
    }
  }
  return undefined;
};
