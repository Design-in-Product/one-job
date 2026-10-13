// Syncing several connected lists: each on its own rule, and one
// failing does not stop the others.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalTaskStore } from '../localTaskStore';
import { syncTodoistLinks, changed } from '../todoistSync';
import type { TodoistLink } from '../todoistLinks';

const link = (id: string, order: TodoistLink['order'] = 'onejob'): TodoistLink =>
  ({ service: `todoist:project:${id}`, projectId: id, name: id, order });
const task = (id: string, child_order: number) =>
  ({ id, content: id, description: '', parent_id: null, checked: false, child_order });

beforeEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

describe('syncTodoistLinks', () => {
  it('reports each list; a failing list does not stop the next', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) =>
      url.includes('project_id=bad')
        ? new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
        : new Response(JSON.stringify({ results: [task('t1', 1), task('t2', 2)], next_cursor: null }), { status: 200 })));
    const store = new LocalTaskStore('todoistsync');
    const reports = await syncTodoistLinks(store, 'tok', [link('bad'), link('good')]);
    expect(reports[0].error).toContain('403');
    expect(reports[1].result).toMatchObject({ added: 2 });
    expect(reports.map(changed)).toEqual([false, true]);
    const decks = await store.getDecks();
    expect(decks.find(d => d.source === 'todoist:project:good')!.cards.map(c => c.title)).toEqual(['t1', 't2']);
    expect(decks.some(d => d.source === 'todoist:project:bad')).toBe(false);
  });
});
