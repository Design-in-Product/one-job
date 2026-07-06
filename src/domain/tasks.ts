// src/domain/tasks.ts
// Pure domain operations for One Job — no React, no storage, no I/O.
// Extracted from LocalTaskStore (build sequence #6) with today's EXACT
// behavior; this module is the stepping stone the R1 schema work stands
// on. When the domain model lands (recursive cards, lifecycle decks),
// the rules change HERE and the stores stay dumb.

import { Task } from '@/types/task';

/**
 * Revive Date fields on a task and its nested substacks after JSON
 * parsing (storage loads and backup imports carry dates as strings).
 */
export const reviveTask = (t: Task): Task => ({
  ...t,
  createdAt: new Date(t.createdAt),
  completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
  deferredAt: t.deferredAt ? new Date(t.deferredAt) : undefined,
  substacks: t.substacks?.map(s => ({
    ...s,
    createdAt: new Date(s.createdAt),
    tasks: s.tasks.map(reviveTask)
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
