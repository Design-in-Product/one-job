// src/domain/sourceSync.ts
// What a sync may do to a deck's cards. xian's rulings (2026-10-12):
// a new task lands on top; a task closed upstream goes to Done; the
// order follows the service only if the user chose that. A sync never
// removes a card.

import type { Task } from '@/types/task';
import { applyCompletion, unfinishedDescendants } from './tasks';

export interface SourceSyncPlan {
  /** New cards, top first. */
  add: Task[];
  /** Local ids of cards to mark Done. */
  completeIds: string[];
  /** Local ids in the service's order, top first. Absent = the deck
      keeps its own order ("One Job's order", the default). */
  order?: string[];
}

export interface SourceSyncOutcome {
  added: number;
  completed: number;
  /** Closed upstream but left open here: unfinished cards inside. */
  held: number;
  reordered: boolean;
}

/** Apply a plan to a deck's cards, in place. */
export function applySourceSync(cards: Task[], plan: SourceSyncPlan): SourceSyncOutcome {
  let completed = 0;
  let held = 0;
  for (const id of plan.completeIds) {
    const card = cards.find(c => c.id === id);
    if (!card || card.completed) continue;
    // The store's own rule: a card with unfinished cards inside it
    // can't be completed. A sync doesn't get to break it.
    if (unfinishedDescendants(card).length > 0) { held++; continue; }
    applyCompletion(card);
    completed++;
  }

  // The open deck as it stands, top first. Array order breaks ties,
  // which is how an import (no sortOrder at all) keeps its order.
  const open = cards
    .map((c, i) => ({ c, i }))
    .filter(x => !x.c.completed)
    .sort((a, b) => (a.c.sortOrder ?? 0) - (b.c.sortOrder ?? 0) || a.i - b.i)
    .map(x => x.c);
  let sequence = [...plan.add, ...open];

  let reordered = false;
  if (plan.order) {
    // The service's cards trade places among themselves; every other
    // card (the user's own, added to the same deck) stays where it is.
    const rank = new Map(plan.order.map((id, i) => [id, i]));
    const theirs = sequence.filter(c => rank.has(c.id)).sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
    let next = 0;
    const before = open.map(c => c.id).join('\n');
    sequence = sequence.map(c => (rank.has(c.id) ? theirs[next++] : c));
    reordered = sequence.filter(c => !plan.add.includes(c)).map(c => c.id).join('\n') !== before;
  }

  cards.push(...plan.add);
  sequence.forEach((c, i) => { c.sortOrder = i; });
  return { added: plan.add.length, completed, held, reordered };
}
