// Todoist, read-only (design: docs/TODOIST-INTEGRATION-DESIGN-2026-10.md).
// Mocked fetch. The shapes below are the ones observed from the real
// service on 2026-10-12 with a test account: lists arrive as
// { results, next_cursor }, ids are strings, sub-tasks sit in the same
// flat list as their parents with parent_id set.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoistSourceAdapter, listTodoistLists } from '../todoistAdapter';

const task = (over: Record<string, unknown>) => ({
  id: 't1', project_id: 'p1', section_id: 's1', parent_id: null,
  content: 'A task', description: '', checked: false, child_order: 1,
  added_at: '2026-10-13T02:48:57.387279Z', ...over,
});
const page = (results: unknown[], next_cursor: string | null = null) =>
  new Response(JSON.stringify({ results, next_cursor }), { status: 200 });
const calls = () => (fetch as ReturnType<typeof vi.fn>).mock.calls;

beforeEach(() => vi.unstubAllGlobals());

describe('TodoistSourceAdapter', () => {
  it('maps a section\'s open tasks to cards, in the list\'s order', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => page([
      task({ id: 'b', content: 'Second', child_order: 2 }),
      task({ id: 'a', content: 'First', description: 'with detail', child_order: 1 }),
    ])));
    const adapter = new TodoistSourceAdapter('tok', { projectId: 'p1', sectionId: 's1', name: 'My list' });
    const cards = await adapter.fetchCards();
    expect(cards.map(c => c.title)).toEqual(['First', 'Second']);
    expect(cards[0]).toMatchObject({ externalId: 'a', description: 'with detail', completed: false });
    expect(cards[0].createdAt).toBeInstanceOf(Date);
    expect(calls()[0][0]).toBe('https://api.todoist.com/api/v1/tasks?section_id=s1&limit=200');
    expect(calls()[0][1].headers.Authorization).toBe('Bearer tok');
  });

  it('is bound by the section\'s id and named for the section', () => {
    const adapter = new TodoistSourceAdapter('tok', { projectId: 'p1', sectionId: 's1', name: 'My list' });
    expect(adapter.service).toBe('todoist:section:s1');
    expect(adapter.deckName).toBe('My list');
  });

  it('a whole project: asks by project, and is bound by the project\'s id', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => page([task({ section_id: null })])));
    const adapter = new TodoistSourceAdapter('tok', { projectId: 'p1', name: 'Project' });
    await adapter.fetchCards();
    expect(adapter.service).toBe('todoist:project:p1');
    expect(calls()[0][0]).toContain('/tasks?project_id=p1&limit=200');
  });

  it('nests sub-tasks under their parent, in order, and never as top-level cards', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => page([
      task({ id: 'parent', content: 'Parent' }),
      task({ id: 'c2', content: 'Child two', parent_id: 'parent', child_order: 2 }),
      task({ id: 'c1', content: 'Child one', parent_id: 'parent', child_order: 1 }),
    ])));
    const cards = await new TodoistSourceAdapter('tok', { projectId: 'p1', sectionId: 's1', name: 'x' }).fetchCards();
    expect(cards.map(c => c.title)).toEqual(['Parent']);
    expect(cards[0].subcards?.map(c => c.title)).toEqual(['Child one', 'Child two']);
  });

  it('keeps a sub-task whose parent is missing from the list, as a top-level card', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => page([task({ id: 'orphan', content: 'Orphan', parent_id: 'gone' })])));
    const cards = await new TodoistSourceAdapter('tok', { projectId: 'p1', name: 'x' }).fetchCards();
    expect(cards.map(c => c.title)).toEqual(['Orphan']);
  });

  it('leaves out tasks already checked', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => page([task({ id: 'a' }), task({ id: 'b', checked: true })])));
    const cards = await new TodoistSourceAdapter('tok', { projectId: 'p1', name: 'x' }).fetchCards();
    expect(cards.map(c => c.externalId)).toEqual(['a']);
  });

  it('follows next_cursor until the list ends', async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(page([task({ id: 'a', child_order: 1 })], 'CUR'))
      .mockResolvedValueOnce(page([task({ id: 'b', child_order: 2 })], null));
    vi.stubGlobal('fetch', f);
    const cards = await new TodoistSourceAdapter('tok', { projectId: 'p1', name: 'x' }).fetchCards();
    expect(cards.map(c => c.externalId)).toEqual(['a', 'b']);
    expect(f.mock.calls[1][0]).toContain('&cursor=CUR');
  });

  it('fails loudly, naming the service, when Todoist refuses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ error: 'Unauthorized', error_tag: 'UNAUTHORIZED', http_code: 401 }), { status: 401 })));
    await expect(new TodoistSourceAdapter('bad', { projectId: 'p1', name: 'x' }).fetchCards())
      .rejects.toThrow(/Todoist refused the request: 401.*Unauthorized/);
  });
});

describe('listTodoistLists', () => {
  it('returns each project with its sections, in Todoist\'s order', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => url.includes('/projects')
      ? page([{ id: 'p2', name: 'Two', child_order: 1 }, { id: 'p1', name: 'Inbox', child_order: 0 }])
      : page([
          { id: 's2', project_id: 'p2', name: 'Later', section_order: 2 },
          { id: 's1', project_id: 'p2', name: 'Now', section_order: 1 },
        ])));
    const lists = await listTodoistLists('tok');
    expect(lists.map(p => p.name)).toEqual(['Inbox', 'Two']);
    expect(lists[1].sections.map(s => s.name)).toEqual(['Now', 'Later']);
    expect(lists[0].sections).toEqual([]);
  });
});
