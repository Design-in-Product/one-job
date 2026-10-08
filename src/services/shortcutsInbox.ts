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
import { App } from '@capacitor/app';
import { getTaskStore } from './taskStore';

export const PENDING_KEY = 'oneJobPendingCards';
export const SHORTCUTS_SOURCE = 'shortcuts';
/** Fired on window after a drain lands ≥1 card (detail = count). The
    foreground drain writes to the store while the deck UI is already
    mounted; without this the cards sat invisible until a cold start
    (xian, 2026-10-06, build 40: "requires a quit and restart"). */
export const INBOX_LANDED_EVENT = 'onejob:inbox-landed';

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
    if (landed > 0) {
      try {
        window.dispatchEvent(new CustomEvent(INBOX_LANDED_EVENT, { detail: landed }));
      } catch { /* announcing is best-effort; the cards are already safe */ }
    }
    return landed;
  } catch (err) {
    console.error('shortcutsInbox: drain failed, queue left intact:', err);
    return 0;
  } finally {
    draining = false;
  }
}

/** Boot + foreground + became-active wiring. Call once from main.tsx
    after hydration. visibilitychange covers returning from another app;
    appStateChange covers Siri (and Control Center, notifications), which
    present OVER the app so the page never goes hidden; it only goes
    inactive → active (xian, 2026-10-06, build 40: Siri cards added with
    the app open never appeared until a restart). Concurrent drains
    collapse to one, so overlapping triggers are harmless. */
export function startShortcutsInbox(): void {
  if (!Capacitor.isNativePlatform()) return;
  void drainShortcutsInbox();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void drainShortcutsInbox();
  });
  try {
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void drainShortcutsInbox();
    }).catch(err => console.error('shortcutsInbox: appStateChange listener failed:', err));
  } catch (err) {
    // Must never break boot (the inbox's hard rule); visibility still drains.
    console.error('shortcutsInbox: appStateChange unavailable:', err);
  }
}
