// Fixture corpus for the v1 → v2 schema migration (build sequence #7).
// These are representative REAL-WORLD-SHAPED v1 documents — the exact
// JSON forms that live in users' localStorage today, string dates and
// all. The migration must prove itself against every one of these, and
// each migrated result must round-trip through backup export/import.
//
// Convention: fixtures are raw JSON-parsed objects (as loaded from
// storage), NOT typed Task[] with Dates — that's the point.

/** A fresh install that added three tasks and finished one. */
export const simpleDeck = [
  {
    id: 'a1', title: 'Call the vet', description: '',
    completed: false, status: 'todo',
    createdAt: '2026-07-01T09:00:00.000Z', sortOrder: 1, substacks: []
  },
  {
    id: 'a2', title: 'Renew passport', description: 'Photos first',
    completed: false, status: 'todo',
    createdAt: '2026-07-01T09:05:00.000Z', sortOrder: 2, substacks: []
  },
  {
    id: 'a3', title: 'Pay water bill',
    completed: true, status: 'done',
    createdAt: '2026-06-30T08:00:00.000Z',
    completedAt: '2026-07-01T10:00:00.000Z', sortOrder: 1, substacks: []
  }
];

/** Heavy deferral history: the card that keeps coming back. */
export const deferralDeck = [
  {
    id: 'b1', title: 'Write the difficult email',
    completed: false, status: 'todo',
    createdAt: '2026-06-25T09:00:00.000Z',
    deferredAt: '2026-07-03T18:00:00.000Z', deferralCount: 7,
    sortOrder: 5, substacks: []
  },
  {
    id: 'b2', title: 'Quick win',
    completed: false, status: 'todo',
    createdAt: '2026-07-03T09:00:00.000Z', sortOrder: 4, substacks: []
  }
];

/**
 * Substacks in every state: mixed progress, all-done, empty. Migration
 * maps each substack's tasks to interior cards of the parent
 * (v2: parent.interior decks); substack names survive only in
 * migration notes/description per the domain model.
 */
export const substackDeck = [
  {
    id: 'c1', title: 'Plan the offsite', description: 'Q3',
    completed: false, status: 'todo',
    createdAt: '2026-06-20T09:00:00.000Z', sortOrder: 1,
    substacks: [
      {
        id: 'c1s1', name: 'Logistics', createdAt: '2026-06-21T09:00:00.000Z',
        tasks: [
          {
            id: 'c1s1t1', title: 'Book venue', completed: true,
            createdAt: '2026-06-21T09:01:00.000Z',
            completedAt: '2026-06-22T09:00:00.000Z', sortOrder: 1
          },
          {
            id: 'c1s1t2', title: 'Arrange catering', completed: false,
            createdAt: '2026-06-21T09:02:00.000Z', sortOrder: 2,
            deferredAt: '2026-06-25T09:00:00.000Z', deferralCount: 2
          }
        ]
      },
      {
        id: 'c1s2', name: 'Agenda', createdAt: '2026-06-21T10:00:00.000Z',
        tasks: [
          {
            id: 'c1s2t1', title: 'Draft schedule', completed: true,
            createdAt: '2026-06-21T10:01:00.000Z',
            completedAt: '2026-06-23T09:00:00.000Z', sortOrder: 1
          }
        ]
      },
      { id: 'c1s3', name: 'Empty ideas', createdAt: '2026-06-21T11:00:00.000Z', tasks: [] }
    ]
  }
];

/** A completed parent whose substack still has open tasks (the Item 15
 *  situation, already existing in the wild — migration must not lose
 *  the stranded sub-tasks). */
export const strandedInteriorDeck = [
  {
    id: 'd1', title: 'Ship the newsletter',
    completed: true, status: 'done',
    createdAt: '2026-06-15T09:00:00.000Z',
    completedAt: '2026-06-18T09:00:00.000Z', sortOrder: 1,
    substacks: [
      {
        id: 'd1s1', name: 'Follow-ups', createdAt: '2026-06-16T09:00:00.000Z',
        tasks: [
          {
            id: 'd1s1t1', title: 'Thank the contributors', completed: false,
            createdAt: '2026-06-16T09:01:00.000Z', sortOrder: 1
          }
        ]
      }
    ]
  }
];

/** Field-drift veterans: tasks created by older builds — missing
 *  status, missing substacks, missing sortOrder, an imported task with
 *  source/externalId. All shapes the reviver tolerates today. */
export const legacyFieldsDeck = [
  {
    id: 'e1', title: 'Pre-status task',
    completed: false,
    createdAt: '2025-08-01T09:00:00.000Z'
  },
  {
    id: 'e2', title: 'Imported from Asana', description: 'via demo import',
    completed: false, status: 'todo',
    createdAt: '2026-07-02T09:00:00.000Z', sortOrder: 3,
    source: 'Asana', externalId: 'asana-12345', substacks: []
  }
];

/** The empty deck (fresh install that never added anything). */
export const emptyDeck: unknown[] = [];

export const allFixtures = {
  simpleDeck,
  deferralDeck,
  substackDeck,
  strandedInteriorDeck,
  legacyFieldsDeck,
  emptyDeck
} as const;
