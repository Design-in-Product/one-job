import React, { useState, useEffect } from 'react';
import { sourceLabel } from '@/domain/tasks';
import { Task, Substack } from '@/types/task';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pendingEdit } from '@/domain/cardEdit';

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  /** Item 23: creates the default (unnamed) sub-deck AND opens it */
  onAddSubtasks?: (taskId: string) => void;
  onOpenSubstack: (task: Task, substack: Substack) => void;
  /** Optional: substack views don't support editing yet */
  onUpdateTask?: (taskId: string, updates: { title?: string; description?: string }) => void;
  /** The colour of the deck this card lives in. The sub-deck inside
      the card wears it. Absent = the brand colours. */
  deckColor?: { g1: string; g2: string };
}

type Field = 'title' | 'description';

// The open card (xian, UX walk step 2, 2026-10-12): "The layout is too
// fussy." It is a CARD, in the deck card's 5:7 shape, a little larger
// because it has come forward. No headings, no Status, no Created, no
// Edit button: "like a wiki where tapping on any element makes it
// editable." The sub-deck is big and wears its parent deck's colour.
const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  isOpen,
  onClose,
  onAddSubtasks,
  onOpenSubstack,
  onUpdateTask,
  deckColor,
}) => {
  // ALL hooks must run before any early return (Rules of Hooks): this
  // component stays mounted with task=null and receives a task later,
  // so a hook after the null-return crashes React with "rendered more
  // hooks than during the previous render" (the 2026-07-05 white screen).
  const { t } = useTranslation();
  const [editedTitle, setEditedTitle] = useState(task?.title ?? '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');
  const [editing, setEditing] = useState<Field | null>(null);

  // A different card opened: start from its text, reading.
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setEditing(null);
    }
    // Keyed on the card, not the object: a save refreshes `task`, and
    // that must not throw the user out of the field they are still in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  if (!task) return null;

  // Autosave (Xian, 07-06): never lose field edits to navigation. Fires
  // on blur and before any action that leaves the card.
  const flushPendingEdits = () => {
    if (!editing) return;
    const edit = pendingEdit(task, editedTitle, editedDescription);
    if (edit) onUpdateTask?.(task.id, edit);
    else setEditedTitle(task.title); // a blanked title shows the original again
  };
  const stopEditing = () => { flushPendingEdits(); setEditing(null); };

  // Honest surface: a field is tappable only when a save path exists.
  // An editable field that discards on blur is a lie (the 2026-07-07
  // sub-card edit bug).
  const canEdit = !!onUpdateTask;
  const edit = (field: Field) => () => { if (canEdit) setEditing(field); };
  // xian, testing build 43 (2026-10-16): "We need at least a hint that
  // the title and description are now editable." An editable field sits
  // in a faint inset well, so it reads as a field before it is tapped.
  // Editing deepens the same well rather than swapping in a new box.
  const well = 'rounded-lg -mx-2 px-2 py-1 bg-gray-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-inset ring-gray-200/70';
  const wellEditing = 'rounded-lg -mx-2 px-2 py-1 bg-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-gray-400 focus:outline-none';
  const fieldBox = canEdit ? `${well} cursor-text` : '';
  // While the description is being edited it takes everything below the
  // title, sub-deck included (xian's point 3).
  const writing = editing === 'description';
  // With nothing below (a sub-card, which can't hold a deck), the
  // description keeps the whole card, as before.
  const hasBelow = (task.decks?.length ?? 0) > 0 || !!onAddSubtasks;

  const handleOpenSubstack = (substack: Substack) => {
    flushPendingEdits();
    onOpenSubstack(task, substack);
    onClose();
  };

  const handleAddSubtasksClick = () => {
    flushPendingEdits();
    onAddSubtasks?.(task.id);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    flushPendingEdits();
    setEditing(null);
    onClose();
  };

  const deckFill = deckColor
    ? { background: `linear-gradient(135deg, ${deckColor.g1}, ${deckColor.g2})` }
    : undefined;
  const deckLayer = 'absolute inset-0 rounded-xl' + (deckColor ? '' : ' bg-gradient-to-br from-taskGradient-start to-taskGradient-end');
  // The same hued margin the card wears in its deck (TaskCard).
  const marginStyle = deckColor
    ? {
        border: '4px solid transparent',
        background: `linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg, color-mix(in srgb, ${deckColor.g1} 50%, #f3f1ee), color-mix(in srgb, ${deckColor.g2} 50%, #f3f1ee)) border-box`,
      }
    : undefined;
  const openInside = (deck: Substack) => deck.cards.filter(c => !c.completed).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        data-testid="open-card"
        // Don't hand focus to the first button on open: on a phone that
        // draws a focus ring round the sub-deck for no reason.
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[min(90vw,22rem)] max-w-none aspect-[5/7] max-h-[88dvh] rounded-2xl sm:rounded-2xl border-gray-200 bg-white p-6 pt-9 shadow-2xl flex flex-col gap-3 select-text"
        style={marginStyle}
      >
        {/* Title, description and the source line share one scrolling
            area, so a wall of text (a GitHub issue, say) scrolls inside
            the card and never squeezes the sub-deck. The negative margin
            gives the wells' edges room inside the scroller; the bottom
            edge fades, so text that runs on shows that it scrolls. */}
        <div className={`flex-1 min-h-0 -mx-2 px-2 pt-0.5 flex flex-col gap-3 ${writing ? '' : 'overflow-y-auto pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent)]'}`}>
        {editing === 'title' ? (
          <>
            <DialogTitle className="sr-only">{task.title}</DialogTitle>
            <input
              type="text"
              autoFocus
              aria-label={task.title}
              className={`text-xl font-bold leading-snug w-[calc(100%+1rem)] ${wellEditing}`}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={stopEditing}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            />
          </>
        ) : (
          <DialogTitle
            className={`text-xl font-bold leading-snug break-words text-left ${fieldBox}`}
            onClick={edit('title')}
          >
            {task.title}
          </DialogTitle>
        )}

        {/* The description's well is only as tall as its text. xian
            asked for one line; a fixed line would make reading a long
            description a tap, and a tap now edits. */}
          {writing ? (
            <textarea
              autoFocus
              className={`flex-1 min-h-0 w-[calc(100%+1rem)] text-gray-700 leading-relaxed resize-none ${wellEditing}`}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={stopEditing}
              placeholder={t('details.descriptionPlaceholder')}
            />
          ) : (
            <p
              className={`${hasBelow ? '' : 'flex-1 '}text-gray-700 leading-relaxed whitespace-pre-line break-words ${fieldBox}`}
              onClick={edit('description')}
            >
              {task.description || (canEdit && <span className="text-gray-400">{t('details.noDescription')}</span>)}
            </p>
          )}

        {!writing && (task.source || task.completedAt) && (
          <p className="text-xs text-gray-400">
            {[
              task.source && t('details.from', { source: sourceLabel(task.source) }),
              task.completedAt && t('details.completedAgo', { when: formatDistanceToNow(task.completedAt, { addSuffix: true }) }),
            ].filter(Boolean).join(' · ')}
          </p>
        )}
        </div>

        {/* Sub-tasks (Item 23): one default deck, no naming ritual.
            Legacy cards with multiple named decks keep a plain list;
            names return as a surface only with multi-deck support. */}
        {writing ? null : (task.decks?.length ?? 0) > 1 ? (
          <div className="space-y-2 overflow-y-auto shrink-0 max-h-40">
            {task.decks!.map((deck) => (
              <Button
                key={deck.id}
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleOpenSubstack(deck)}
              >
                <span>{deck.name ?? t('details.subtasks')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {t('details.openCount', { count: openInside(deck) })}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Button>
            ))}
          </div>
        ) : task.decks?.[0] ? (
          /* The interior deck IS a deck: tap to go into it (top card
             arrives face-up). Xian, 2026-07-06; made much bigger and
             given its parent deck's colour, 2026-10-12. */
          <button
            onClick={() => handleOpenSubstack(task.decks![0])}
            className="shrink-0 flex flex-col items-center gap-2 mx-auto"
            aria-label={t('details.subtasksAria', { count: openInside(task.decks[0]) })}
          >
            {/* One fixed size on every card (xian, 10-16: a deck that
                changes size from card to card reads as a different
                object), about a third bigger than in build 43. */}
            <div className="relative h-48 aspect-[5/7] mb-1">
              <div className={`${deckLayer} translate-y-3 scale-[0.9] opacity-40`} style={deckFill} />
              <div className={`${deckLayer} translate-y-1.5 scale-[0.95] opacity-70`} style={deckFill} />
              <div className={`${deckLayer} shadow-md flex items-center justify-center`} style={deckFill}>
                <span
                  className={`w-12 h-12 rounded-full bg-white/95 text-xl font-bold flex items-center justify-center ${deckColor ? '' : 'text-taskGradient-start'}`}
                  style={deckColor ? { color: deckColor.g2 } : undefined}
                >
                  {openInside(task.decks[0])}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500">{task.decks[0].name ?? t('details.subtasks')}</span>
          </button>
        ) : onAddSubtasks ? (
          /* Ghost deck: same shape, dashed. The way to start one. */
          <button
            onClick={handleAddSubtasksClick}
            className="shrink-0 flex flex-col items-center gap-2 mx-auto"
            aria-label={t('details.addSubtasks')}
          >
            <div className="h-48 aspect-[5/7] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Plus className="w-7 h-7 text-gray-400" />
            </div>
            <span className="text-xs text-gray-500">{t('details.addSubtasks')}</span>
          </button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;
