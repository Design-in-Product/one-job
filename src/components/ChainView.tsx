// src/components/ChainView.tsx
// The lifecycle chain (R1.2): Done → Archive → Trash as three "rooms"
// of one view. Right-swipe advances a card along its afterlife,
// left-swipe walks it back — Done's left goes HOME (top of the deck).
// Rooms are built to be re-homed as canvas places in R2.
//
// Trash decisions (Xian, 2026-07-29): cards in the trash are NOT
// protected. Swiping right on a trashed card deletes it one-tap — the
// two deliberate moves that put it there are the confirmation. The only
// confirm left in this view is Empty Trash, because it is bulk.
//
// Search (same date): typing narrows which cards the sift walks —
// matching title AND description — with no results list, so
// one-card-at-a-time survives. The pile visibly thins as you type; in
// the trash the pile is FELT (edge bars, capped) rather than counted
// (covenant 7: numbers read as trophies in Done, dread in Trash).

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { cardRoom, flattenWithParent, Room } from '@/domain/tasks';
import TaskCard from './TaskCard';
import SwipeableCard from './SwipeableCard';
import ActionSheet, { SheetAction } from './ActionSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ChainRoom = Exclude<Room, 'deck'>;

interface ChainViewProps {
  tasks: Task[];
  onUncomplete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onTrash: (id: string) => void;
  onRestoreFromTrash: (id: string) => void;
  onPurge: (id: string) => void;
  /** Empty the whole trash at once (bulk — the one confirmed act here). */
  onEmptyTrash?: () => void;
}

const ROOMS: ChainRoom[] = ['done', 'archive', 'trash'];

// Search appears once a pile is big enough to need aiming; smaller piles
// stay pure sift. Retrieval is real but secondary (Xian, 2026-07-29) —
// don't lead people into taxonomy-fiddling temptation.
const SEARCH_FROM = 6;

// The felt pile: at most this many edge bars under the card, however
// deep the pile really is — the asymptote is the point (covenant 7).
const PILE_BARS_MAX = 6;

// Shades (Xian, 2026-07-29): cards in the afterlife look the part —
// progressively washed out the further they are from the living deck.
// Done keeps most of its color (a trophy, recently alive); Archive is
// paler; Trash is nearly grayscale. This is the STATE strand of the one
// material language (volume = felt pile thickness, time = card aging /
// patina — Item 22, still unbuilt — state = saturation). Placeholder
// values until the aging design pass tunes all three together.
// The card face is white-on-near-black, so saturation alone is invisible
// (first attempt proved it: no color to remove). A shade loses VITALITY:
// opacity lets the table's gray breathe through, contrast pulls the ink
// toward gray. Values deepen room by room.
const roomShade: Record<ChainRoom, string> = {
  done: 'saturate(0.6) opacity(0.93) contrast(0.94)',
  archive: 'saturate(0.3) opacity(0.82) contrast(0.88)',
  trash: 'grayscale(1) opacity(0.65) contrast(0.85)',
};

const roomSortKey: Record<ChainRoom, (t: Task) => number> = {
  done: t => t.completedAt?.getTime() ?? 0,
  archive: t => t.archivedAt?.getTime() ?? 0,
  trash: t => t.trashedAt?.getTime() ?? 0,
};

const ChainView: React.FC<ChainViewProps> = ({
  tasks,
  onUncomplete,
  onArchive,
  onUnarchive,
  onTrash,
  onRestoreFromTrash,
  onPurge,
  onEmptyTrash,
}) => {
  const { t } = useTranslation();
  const [room, setRoom] = useState<ChainRoom>('done');
  const [confirmingEmpty, setConfirmingEmpty] = useState(false);
  // Same hold-menu principle as the deck (Xian, 2026-07-25): a card in a
  // lifecycle room reveals its room-appropriate actions on tap-and-hold.
  const [menuCard, setMenuCard] = useState<Task | null>(null);
  // Sifting (Item 28): swipe down digs deeper into the pile, up comes
  // back. Pure view state — browsing never rewrites the pile's order.
  const [sift, setSift] = useState(0);
  const [query, setQuery] = useState('');

  // Rooms gather cards from EVERY depth (2026-07-07): work completed
  // inside an interior deck is still work — it lands in Done like any
  // other card, wearing a breadcrumb back to the card that contains it.
  const byRoom = (r: ChainRoom) =>
    flattenWithParent(tasks)
      .filter(({ card }) => cardRoom(card) === r)
      .sort((a, b) => roomSortKey[r](b.card) - roomSortKey[r](a.card));

  const pile = byRoom(room);
  const q = query.trim().toLowerCase();
  const entries = q
    ? pile.filter(({ card }) =>
        card.title.toLowerCase().includes(q) ||
        (card.description ?? '').toLowerCase().includes(q))
    : pile;
  const siftIndex = entries.length > 0 ? ((sift % entries.length) + entries.length) % entries.length : 0;
  const top = entries[siftIndex]?.card;
  const topParent = entries[siftIndex]?.parent ?? null;

  const switchRoom = (r: ChainRoom) => {
    setRoom(r);
    setSift(0);
    setQuery('');
    setConfirmingEmpty(false);
  };

  // Gesture meanings per room: right advances the chain, left walks back.
  // In the trash, "advance" is out of existence — one tap, no confirm.
  const gestures: Record<ChainRoom, {
    onRight?: (id: string) => void; rightHint?: string;
    onLeft: (id: string) => void; leftHint: string;
  }> = {
    done: {
      onRight: onArchive, rightHint: t('chain.toArchive'),
      onLeft: onUncomplete, leftHint: t('chain.unDone'),
    },
    archive: {
      onRight: onTrash, rightHint: t('chain.toTrash'),
      onLeft: onUnarchive, leftHint: t('chain.toDone'),
    },
    trash: {
      onRight: onPurge, rightHint: t('chain.purge'),
      onLeft: onRestoreFromTrash, leftHint: t('chain.restore'),
    },
  };
  const g = gestures[room];

  // Room hold-menu actions — the same moves as the swipes, made explicit.
  const buildRoomActions = (card: Task): SheetAction[] => {
    const close = (fn: () => void) => () => { setMenuCard(null); fn(); };
    if (room === 'done') return [
      { key: 'undone', label: t('chain.unDone'), onClick: close(() => onUncomplete(card.id)) },
      { key: 'archive', label: t('chain.toArchive'), onClick: close(() => onArchive(card.id)) },
    ];
    if (room === 'archive') return [
      { key: 'todone', label: t('chain.toDone'), onClick: close(() => onUnarchive(card.id)) },
      { key: 'trash', label: t('chain.toTrash'), onClick: close(() => onTrash(card.id)) },
    ];
    return [
      { key: 'restore', label: t('chain.restore'), onClick: close(() => onRestoreFromTrash(card.id)) },
      { key: 'purge', label: t('chain.purge'), destructive: true,
        onClick: close(() => onPurge(card.id)) },
    ];
  };

  return (
    <div className="px-4 pb-6 space-y-4">
      {/* Room switcher — dissolves into canvas places in R2 */}
      <div className="flex rounded-xl bg-gray-100 p-1" role="tablist">
        {ROOMS.map(r => (
          <button
            key={r}
            role="tab"
            aria-selected={room === r}
            onClick={() => switchRoom(r)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors',
              room === r ? 'bg-white shadow text-gray-900' : 'text-gray-500'
            )}
          >
            {/* Done wears its count as a quiet trophy; Trash never counts
                itself at all (covenant 7). */}
            {t(`chain.${r}`)} {r !== 'trash' && byRoom(r).length > 0 && `(${byRoom(r).length})`}
          </button>
        ))}
      </div>

      {/* Search = a filter on the pile, not a results view. Only offered
          once the pile is big enough that sifting alone can't aim. */}
      {pile.length >= SEARCH_FROM && (
        <Input
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setSift(0); }}
          placeholder={t('chain.searchPlaceholder')}
          aria-label={t('chain.searchPlaceholder')}
          className="h-9"
        />
      )}

      {!top ? (
        <p className="text-center text-muted-foreground py-10">
          {q ? t('chain.noMatches', { query: query.trim() }) : t(`chain.empty.${room}`)}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          {topParent && (
            <p className="text-xs text-gray-500">
              {t('chain.fromParent', { parent: topParent.title })}
            </p>
          )}
          {/* key remounts the swipe wrapper per card so exit animations reset */}
          <SwipeableCard
            key={`${room}-${top.id}`}
            onSwipeRight={g.onRight ? () => g.onRight!(top.id) : undefined}
            onSwipeLeft={() => g.onLeft(top.id)}
            onSwipeDown={entries.length > 1 ? () => setSift(s => s + 1) : undefined}
            onSwipeUp={entries.length > 1 ? () => setSift(s => s - 1) : undefined}
            onLongPress={() => setMenuCard(top)}
            rightHint={g.rightHint}
            leftHint={g.leftHint}
            className="w-[min(85vw,20rem)] aspect-[5/7]"
          >
            <div style={{ filter: roomShade[room] }}>
              <TaskCard task={top} />
            </div>
          </SwipeableCard>

          {/* The felt pile: edge bars under the card, thinning as a search
              narrows — depth sensed, never tallied. */}
          {entries.length > 1 && (
            <div className="flex flex-col items-center gap-[3px]" aria-hidden>
              {Array.from({ length: Math.min(entries.length - 1, PILE_BARS_MAX) }).map((_, i) => (
                <div
                  key={i}
                  className="h-[3px] rounded-full bg-gray-300"
                  style={{ width: `${72 - i * 9}px`, opacity: Math.max(0.15, 1 - i * 0.15) }}
                />
              ))}
            </div>
          )}

          <p className="text-center text-xs text-gray-500">
            {g.rightHint
              ? t('chain.hintsBoth', { left: g.leftHint, right: g.rightHint })
              : t('chain.hintsLeft', { left: g.leftHint })}
          </p>

          {entries.length > 1 && (
            <p className="text-xs text-gray-400">
              {room === 'trash'
                ? t('chain.siftHintFelt')
                : t('chain.siftHint', { n: siftIndex + 1, count: entries.length })}
            </p>
          )}

          {room === 'trash' && onEmptyTrash && pile.length > 0 && (
            confirmingEmpty ? (
              <div className="w-full max-w-sm border border-red-300 bg-red-50 rounded-lg p-3 text-sm space-y-2">
                <p className="text-red-800">
                  {t('chain.emptyTrashConfirm', { count: pile.length })}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { onEmptyTrash(); setConfirmingEmpty(false); }}
                  >
                    {t('chain.emptyTrash')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmingEmpty(false)}>
                    {t('chain.purgeCancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 gap-1.5"
                onClick={() => setConfirmingEmpty(true)}
              >
                <Trash2 className="w-4 h-4" />
                {t('chain.emptyTrash')}
              </Button>
            )
          )}
        </div>
      )}

      {/* Room hold-menu: the room's actions, revealed on introspection */}
      <ActionSheet
        open={!!menuCard}
        title={menuCard?.title}
        actions={menuCard ? buildRoomActions(menuCard) : []}
        onClose={() => setMenuCard(null)}
      />
    </div>
  );
};

export default ChainView;
