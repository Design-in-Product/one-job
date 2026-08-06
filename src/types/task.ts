// src/types/task.ts
// Core card types. Schema v2 (2026-07-06): nesting is InteriorDeck —
// named decks of FULL cards, recursion-capable (Vision Item 17). The
// UI ships one deck per card; the model allows many.

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  /** Backend-assigned ('todo' | 'done'); absent on client-created tasks until persisted */
  status?: string;
  createdAt: Date;
  completedAt?: Date;
  /** Lifecycle chain (R1.2): set when the card advances past Done */
  archivedAt?: Date;
  /** Lifecycle chain (R1.2): set when the card advances past Archive */
  trashedAt?: Date;
  deferredAt?: Date;
  deferralCount?: number;
  sortOrder?: number;
  source?: string;
  externalId?: string;
  /** Interior decks — named sub-decks of full cards. Replaces v1 `substacks`. */
  decks?: InteriorDeck[];
}

export interface InteriorDeck {
  id: string;
  /** null = the unnamed default sub-deck; multiple named decks are a later/premium layer */
  name: string | null;
  cards: Task[];
  createdAt: Date;
  /** Deck identity hue (2026-08-06): DECK DATA, not a device preference —
      the same look on every device and in every backup. Absent = the
      brand back (deck-1 keeps full brand forever). */
  color?: { g1: string; g2: string };
}

/** @deprecated v1 name — use InteriorDeck. Removed once R1.1 UI lands. */
export type Substack = InteriorDeck;
