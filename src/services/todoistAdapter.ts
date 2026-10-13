// src/services/todoistAdapter.ts
// Todoist, READ-ONLY: the first real integration (xian, 2026-10-12).
// Design and his answers: docs/TODOIST-INTEGRATION-DESIGN-2026-10.md.
// Rides the R3.1 seam like the GitHub adapter. Nothing here writes to
// Todoist; closing a task from One Job is R3.4 and comes later.
//
// The mapping is "loose but simple" (his words): a deck is tied to ONE
// project or ONE section, whichever the user picks. A sub-project is a
// separate thing to pick. A task's sub-tasks become the deck inside
// its card.
//
// Shapes were read from the real service on 2026-10-12 (unified API
// v1): lists arrive as { results, next_cursor }, limit is at most 200,
// ids are strings, and sub-tasks sit in the same flat list as their
// parents with parent_id set.
//
// The token is a device-local secret, as the GitHub one is; it leaves
// the device only for api.todoist.com. (xian: "yes for now… likely we
// support oauth ultimately".)

import type { SourceAdapter, ExternalCard } from './sourceAdapter';

const API = 'https://api.todoist.com/api/v1';
const TODOIST_TOKEN_KEY = 'oneJobTodoistToken';

export const getTodoistToken = (): string => {
  try {
    return localStorage.getItem(TODOIST_TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
};

export const setTodoistToken = (token: string): void => {
  try {
    if (token.trim()) localStorage.setItem(TODOIST_TOKEN_KEY, token.trim());
    else localStorage.removeItem(TODOIST_TOKEN_KEY);
  } catch {
    /* storage unavailable — the token just won't persist */
  }
};

interface TodoistTask {
  id: string;
  content: string;
  description?: string;
  parent_id: string | null;
  checked?: boolean;
  child_order?: number;
  added_at?: string;
}

interface TodoistProject { id: string; name: string; child_order?: number }
interface TodoistSection { id: string; project_id: string; name: string; section_order?: number }

/** What the user picks from: a project, or one section of it. */
export interface TodoistList {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
}

/** Which list a deck mirrors. `name` is what the deck is called. */
export interface TodoistTarget {
  projectId: string;
  sectionId?: string;
  name: string;
}

/** A list's binding key: its ID, never its name (names change). */
export const serviceKeyFor = (target: Pick<TodoistTarget, 'projectId' | 'sectionId'>): string =>
  target.sectionId ? `todoist:section:${target.sectionId}` : `todoist:project:${target.projectId}`;

/** Every page of a list endpoint. Fails loudly and namedly: a silent
    empty result would look like an empty list. */
async function fetchAll<T>(token: string, path: string): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | null = null;
  do {
    const url = `${API}${path}${path.includes('?') ? '&' : '?'}limit=200` +
      (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      let why = res.statusText;
      try { why = ((await res.json()) as { error?: string }).error ?? why; } catch { /* not JSON */ }
      throw new Error(`Todoist refused the request: ${res.status} ${why}`);
    }
    const body = (await res.json()) as { results: T[]; next_cursor: string | null };
    out.push(...body.results);
    cursor = body.next_cursor;
  } while (cursor);
  return out;
}

const byOrder = <T>(key: (x: T) => number | undefined) => (a: T, b: T) => (key(a) ?? 0) - (key(b) ?? 0);

/** The user's projects, each with its sections, in Todoist's order. */
export async function listTodoistLists(token: string): Promise<TodoistList[]> {
  const [projects, sections] = await Promise.all([
    fetchAll<TodoistProject>(token, '/projects'),
    fetchAll<TodoistSection>(token, '/sections'),
  ]);
  return [...projects].sort(byOrder(p => p.child_order)).map(p => ({
    id: p.id,
    name: p.name,
    sections: sections
      .filter(s => s.project_id === p.id)
      .sort(byOrder(s => s.section_order))
      .map(s => ({ id: s.id, name: s.name })),
  }));
}

export class TodoistSourceAdapter implements SourceAdapter {
  /** The binding key: the list's ID, never its name (names change). */
  readonly service: string;
  readonly deckName: string;

  constructor(private token: string, private target: TodoistTarget) {
    this.service = serviceKeyFor(target);
    this.deckName = target.name;
  }

  async fetchCards(): Promise<ExternalCard[]> {
    const query = this.target.sectionId
      ? `section_id=${encodeURIComponent(this.target.sectionId)}`
      : `project_id=${encodeURIComponent(this.target.projectId)}`;
    const tasks = (await fetchAll<TodoistTask>(this.token, `/tasks?${query}`))
      .filter(t => !t.checked)
      .sort(byOrder(t => t.child_order));

    const ids = new Set(tasks.map(t => t.id));
    const card = (t: TodoistTask): ExternalCard => {
      const children = tasks.filter(c => c.parent_id === t.id).map(card);
      return {
        externalId: t.id,
        title: t.content,
        description: t.description || undefined,
        completed: false, // read-only pull of OPEN tasks
        createdAt: t.added_at ? new Date(t.added_at) : undefined,
        ...(children.length ? { subcards: children } : {}),
      };
    };
    // Top level: no parent, or a parent that isn't in this list (kept
    // rather than dropped; a card must not vanish because its parent did).
    return tasks.filter(t => !t.parent_id || !ids.has(t.parent_id)).map(card);
  }

  /** Which of these tasks are CLOSED in Todoist. A task that is gone
      (deleted, or an id Todoist no longer knows) is not closed. Any
      other failure throws, so a bad connection completes nothing. */
  async fetchClosed(externalIds: string[]): Promise<string[]> {
    const closed: string[] = [];
    for (const id of externalIds) {
      const res = await fetch(`${API}/tasks/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (res.status === 404 || res.status === 400) continue;
      if (!res.ok) throw new Error(`Todoist refused the request: ${res.status} ${res.statusText}`);
      const t = (await res.json()) as { checked?: boolean; is_deleted?: boolean };
      if (t.checked && !t.is_deleted) closed.push(id);
    }
    return closed;
  }
}
