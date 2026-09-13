// src/services/shortcutsInbox.ts
// Ingests cards queued by the AddCard App Intent (Shortcuts / Siri).
//
// The intent's perform() runs while the app may be closed, so it can't
// touch the deck. It appends to a pending queue in Capacitor
// Preferences (native/ios/AddCardIntent.swift writes the same
// namespaced key the Preferences plugin reads). This module drains
// that queue through the NORMAL store paths — createTask +
// addSubstackTask — so intent-born cards get the store's invariants
// (title required), metrics seams, and provenance, exactly like any
// other card. VISION: "an agent's card and an imported Asana task are
// the same event: a card arriving with provenance."
//
// Failure posture mirrors metricsStore's hard rule: the inbox must
// never break app boot. Everything is wrapped; on any error the queue
// stays put and we try again next foreground.

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { getTaskStore } from './taskStore';

export const PENDING_KEY = 'oneJobPendingCards';
export const SHORTCUTS_SOURCE = 'shortcuts';

export interface PendingCard {
  title: string;
  description?: string;
  subtasks?: string[];
  receivedAt?: string;
}

/** Parse a raw queue payload; anything unusable becomes []. Exported
    for tests — pure over its input. */
export const parseQueue = (raw: string | null): PendingCard[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is PendingCard =>
          !!e && typeof e === 'object' && typeof (e as PendingCard).title === 'string' &&
          (e as PendingCard).title.trim() !== '',
      )
      .map(e => ({
        title: e.title.trim(),
        description: typeof e.description === 'string' ? e.description : undefined,
        subtasks: Array.isArray(e.subtasks)
          ? e.subtasks.filter((s): s is string => typeof s === 'string' && s.trim() !== '')
          : undefined,
        receivedAt: typeof e.receivedAt === 'string' ? e.receivedAt : undefined,
      }));
  } catch {
    return [];
  }
};

let draining = false;

/** Drain the pending queue into the deck. Returns how many cards
    landed. Safe to call often (boot + every foreground); concurrent
    calls collapse to one. */
export async function drainShortcutsInbox(): Promise<number> {
  if (!Capacitor.isNativePlatform()) return 0;
  if (draining) return 0;
  draining = true;
  try {
    const { value } = await Preferences.get({ key: PENDING_KEY });
    const queue = parseQueue(value);
    if (!queue.length) {
      // A non-empty raw value that parsed to nothing is garbage — clear
      // it so it doesn't sit there being re-parsed forever.
      if (value) await Preferences.remove({ key: PENDING_KEY });
      return 0;
    }

    const store = getTaskStore();
    let landed = 0;
    const survivors: PendingCard[] = [];
    // Reversed: each 'behind-top' insert lands directly behind the top,
    // so inserting last-first leaves the batch in ARRIVAL order
    // (first-queued closest to the top). The ruling: external cards
    // join behind the current job, never on top of it.
    for (const card of [...queue].reverse()) {
      try {
        const created = await store.createTask(card.title, card.description, { placement: 'behind-top' });
        if (card.subtasks?.length) {
          const interior = await store.createSubstack(created.id, null);
          for (const sub of card.subtasks) {
            await store.addSubstackTask(interior.id, sub);
          }
        }
        landed += 1;
      } catch (err) {
        // One bad card must not sink the batch OR get silently dropped:
        // it stays queued for the next drain (visible, retryable).
        console.error('shortcutsInbox: card failed to land, keeping queued:', err);
        survivors.push(card);
      }
    }

    if (survivors.length) {
      await Preferences.set({ key: PENDING_KEY, value: JSON.stringify(survivors) });
    } else {
      await Preferences.remove({ key: PENDING_KEY });
    }
    return landed;
  } catch (err) {
    console.error('shortcutsInbox: drain failed, queue left intact:', err);
    return 0;
  } finally {
    draining = false;
  }
}

/** Boot + foreground wiring. Call once from main.tsx after hydration. */
export function startShortcutsInbox(): void {
  if (!Capacitor.isNativePlatform()) return;
  void drainShortcutsInbox();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void drainShortcutsInbox();
  });
}
