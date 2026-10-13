// src/services/todoistLinks.ts
// Which Todoist lists this device has connected, and the order rule
// the user chose for each. Design and xian's rulings:
// docs/TODOIST-INTEGRATION-DESIGN-2026-10.md.
//
// This is integration SETTINGS, kept beside the token and like it
// device-local. It is not card data: the cards and their deck live in
// the store, bound by the same `service` key. Losing this record
// loses no cards; the user connects the list again and the import
// dedupes.

import { serviceKeyFor, type TodoistTarget } from './todoistAdapter';

export { serviceKeyFor };

/** Who decides the deck's order when the two disagree during sync. */
export type TodoistOrder = 'onejob' | 'todoist';

/** xian, 2026-10-12: the default is One Job's order retained. */
export const DEFAULT_ORDER: TodoistOrder = 'onejob';

export interface TodoistLink {
  /** The deck's binding key (the adapter's `service`). */
  service: string;
  projectId: string;
  sectionId?: string;
  /** The list's name when it was connected. */
  name: string;
  order: TodoistOrder;
}

const LINKS_KEY = 'oneJobTodoistLinks';

const isOrder = (v: unknown): v is TodoistOrder => v === 'onejob' || v === 'todoist';

/** Saved links, tolerating damaged data: a bad record is dropped and
    a bad order falls back to the default. Never throws. */
export const getTodoistLinks = (): TodoistLink[] => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(LINKS_KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((l): l is Record<string, unknown> =>
        !!l && typeof l.service === 'string' && typeof l.projectId === 'string' && typeof l.name === 'string')
      .map(l => ({
        service: l.service as string,
        projectId: l.projectId as string,
        ...(typeof l.sectionId === 'string' ? { sectionId: l.sectionId } : {}),
        name: l.name as string,
        order: isOrder(l.order) ? l.order : DEFAULT_ORDER,
      }));
  } catch {
    return [];
  }
};

const write = (links: TodoistLink[]): void => {
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  } catch {
    /* storage unavailable: the link just won't persist */
  }
};

/** Connect a list, or update it if it is already connected. */
export const saveTodoistLink = (target: TodoistTarget, order: TodoistOrder = DEFAULT_ORDER): TodoistLink => {
  const link: TodoistLink = {
    service: serviceKeyFor(target),
    projectId: target.projectId,
    ...(target.sectionId ? { sectionId: target.sectionId } : {}),
    name: target.name,
    order,
  };
  const links = getTodoistLinks();
  const at = links.findIndex(l => l.service === link.service);
  if (at >= 0) links[at] = link;
  else links.push(link);
  write(links);
  return link;
};

export const setTodoistLinkOrder = (service: string, order: TodoistOrder): void => {
  write(getTodoistLinks().map(l => (l.service === service ? { ...l, order } : l)));
};

/** Stop syncing a list. The deck and its cards are not touched, and
    the deck keeps its binding, so connecting the list again resumes
    with the same deck instead of making a second one. */
export const removeTodoistLink = (service: string): void => {
  write(getTodoistLinks().filter(l => l.service !== service));
};
