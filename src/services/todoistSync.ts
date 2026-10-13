// src/services/todoistSync.ts
// Keeps connected Todoist lists up to date: when the app opens, when
// it comes back to the front, and from "Sync now". One way (xian,
// 2026-10-12: one-way for the first week): everything here is a read.
// The rules a sync follows live in `syncFromSource`.

import { getTaskStore } from './taskStore';
import type { TaskStore } from './taskStore';
import { syncFromSource, type SyncResult } from './sourceAdapter';
import { TodoistSourceAdapter, getTodoistToken } from './todoistAdapter';
import { getTodoistLinks, type TodoistLink } from './todoistLinks';
import { featureOn } from './featureStages';
import { INBOX_LANDED_EVENT } from './shortcutsInbox';

export interface TodoistSyncReport {
  link: TodoistLink;
  result?: SyncResult;
  error?: string;
}

/** Sync the given lists, one after another. One list failing does not
    stop the others; its error is reported beside its name. */
export async function syncTodoistLinks(
  store: TaskStore,
  token: string,
  links: TodoistLink[],
): Promise<TodoistSyncReport[]> {
  const reports: TodoistSyncReport[] = [];
  for (const link of links) {
    try {
      const adapter = new TodoistSourceAdapter(token, link);
      const result = await syncFromSource(store, adapter, { order: link.order === 'todoist' ? 'source' : 'onejob' });
      reports.push({ link, result });
    } catch (err) {
      reports.push({ link, error: (err as Error).message });
    }
  }
  return reports;
}

export const changed = (r: TodoistSyncReport): boolean =>
  !!r.result && (r.result.added > 0 || r.result.completed > 0 || r.result.reordered);

let running = false;
let lastRun = 0;
const QUIET_MS = 60_000;

/** The automatic sync. Quiet: no toast, at most once a minute, and a
    failure is logged, not shown (the user did not ask for it). */
async function autoSync(): Promise<void> {
  if (running || Date.now() - lastRun < QUIET_MS) return;
  if (!featureOn('todoist')) return;
  const token = getTodoistToken();
  const links = getTodoistLinks();
  if (!token || links.length === 0) return;
  running = true;
  lastRun = Date.now();
  try {
    const reports = await syncTodoistLinks(getTaskStore(), token, links);
    for (const r of reports) if (r.error) console.error(`todoistSync: "${r.link.name}" failed:`, r.error);
    if (reports.some(changed)) {
      try { window.dispatchEvent(new CustomEvent(INBOX_LANDED_EVENT)); } catch { /* best-effort */ }
    }
  } finally {
    running = false;
  }
}

/** Boot + foreground wiring. Call once from main.tsx. Must never
    break boot. */
export function startTodoistSync(): void {
  try {
    void autoSync();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void autoSync();
    });
  } catch (err) {
    console.error('todoistSync: could not start:', err);
  }
}
