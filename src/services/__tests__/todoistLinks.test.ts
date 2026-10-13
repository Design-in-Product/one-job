// Which Todoist lists this device has connected, and the order rule
// the user chose for each (design: docs/TODOIST-INTEGRATION-DESIGN-2026-10.md).
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTodoistLinks, saveTodoistLink, setTodoistLinkOrder, removeTodoistLink, serviceKeyFor, DEFAULT_ORDER,
} from '../todoistLinks';

beforeEach(() => localStorage.clear());

describe('todoistLinks', () => {
  it('starts empty', () => {
    expect(getTodoistLinks()).toEqual([]);
  });

  it("defaults to One Job's order (xian, 2026-10-12)", () => {
    expect(DEFAULT_ORDER).toBe('onejob');
    saveTodoistLink({ projectId: 'p1', name: 'Work' });
    expect(getTodoistLinks()[0].order).toBe('onejob');
  });

  it('keys a link by the list id, the same key the adapter binds a deck with', () => {
    expect(serviceKeyFor({ projectId: 'p1' })).toBe('todoist:project:p1');
    expect(serviceKeyFor({ projectId: 'p1', sectionId: 's1' })).toBe('todoist:section:s1');
  });

  it('saves a section and a project as separate links', () => {
    saveTodoistLink({ projectId: 'p1', name: 'Work' });
    saveTodoistLink({ projectId: 'p1', sectionId: 's1', name: 'Inbox' }, 'todoist');
    expect(getTodoistLinks().map(l => [l.service, l.name, l.order])).toEqual([
      ['todoist:project:p1', 'Work', 'onejob'],
      ['todoist:section:s1', 'Inbox', 'todoist'],
    ]);
  });

  it('connecting the same list again updates it instead of adding a second', () => {
    saveTodoistLink({ projectId: 'p1', name: 'Work' });
    saveTodoistLink({ projectId: 'p1', name: 'Work, renamed' }, 'todoist');
    const links = getTodoistLinks();
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({ name: 'Work, renamed', order: 'todoist' });
  });

  it('changes the order rule of one link and leaves the others', () => {
    saveTodoistLink({ projectId: 'p1', name: 'Work' });
    saveTodoistLink({ projectId: 'p2', name: 'Home' });
    setTodoistLinkOrder('todoist:project:p2', 'todoist');
    expect(getTodoistLinks().map(l => l.order)).toEqual(['onejob', 'todoist']);
  });

  it('reads damaged or foreign saved data as no links, without throwing', () => {
    localStorage.setItem('oneJobTodoistLinks', '{not json');
    expect(getTodoistLinks()).toEqual([]);
    localStorage.setItem('oneJobTodoistLinks', JSON.stringify([{ nope: 1 }, { service: 'todoist:project:p1', projectId: 'p1', name: 'Work', order: 'sideways' }]));
    expect(getTodoistLinks()).toEqual([
      { service: 'todoist:project:p1', projectId: 'p1', name: 'Work', order: 'onejob' },
    ]);
  });

  it('disconnects one list and leaves the others', () => {
    saveTodoistLink({ projectId: 'p1', name: 'Work' });
    saveTodoistLink({ projectId: 'p2', name: 'Home' });
    removeTodoistLink('todoist:project:p1');
    expect(getTodoistLinks().map(l => l.name)).toEqual(['Home']);
  });
});
