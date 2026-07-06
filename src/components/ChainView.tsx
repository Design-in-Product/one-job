// src/components/ChainView.tsx
// The lifecycle chain (R1.2): Done → Archive → Trash as three "rooms"
// of one view. Right-swipe advances a card along its afterlife,
// left-swipe walks it back — Done's left goes HOME (top of the deck).
// Purge is the only destructive act in the app: button + confirm, never
// a swipe. Rooms are built to be re-homed as canvas places in R2.

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { cardRoom, Room } from '@/domain/tasks';
import TaskCard from './TaskCard';
import SwipeableCard from './SwipeableCard';
import { Button } from '@/components/ui/button';
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
}

const ROOMS: ChainRoom[] = ['done', 'archive', 'trash'];

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
}) => {
  const { t } = useTranslation();
  const [room, setRoom] = useState<ChainRoom>('done');
  const [confirmingPurge, setConfirmingPurge] = useState<Task | null>(null);

  const byRoom = (r: ChainRoom) =>
    tasks.filter(task => cardRoom(task) === r).sort((a, b) => roomSortKey[r](b) - roomSortKey[r](a));

  const cards = byRoom(room);
  const top = cards[0];

  // Gesture meanings per room: right advances the chain, left walks back
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
      // no right — the only way further is the confirmed purge button
      onLeft: onRestoreFromTrash, leftHint: t('chain.restore'),
    },
  };
  const g = gestures[room];

  return (
    <div className="px-4 pb-6 space-y-4">
      {/* Room switcher — dissolves into canvas places in R2 */}
      <div className="flex rounded-xl bg-gray-100 p-1" role="tablist">
        {ROOMS.map(r => (
          <button
            key={r}
            role="tab"
            aria-selected={room === r}
            onClick={() => { setRoom(r); setConfirmingPurge(null); }}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors',
              room === r ? 'bg-white shadow text-gray-900' : 'text-gray-500'
            )}
          >
            {t(`chain.${r}`)} {byRoom(r).length > 0 && `(${byRoom(r).length})`}
          </button>
        ))}
      </div>

      {!top ? (
        <p className="text-center text-muted-foreground py-10">
          {t(`chain.empty.${room}`)}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          {/* key remounts the swipe wrapper per card so exit animations reset */}
          <SwipeableCard
            key={`${room}-${top.id}`}
            onSwipeRight={g.onRight ? () => g.onRight!(top.id) : undefined}
            onSwipeLeft={() => g.onLeft(top.id)}
            rightHint={g.rightHint}
            leftHint={g.leftHint}
            className="w-[min(85vw,20rem)] aspect-[5/7]"
          >
            <TaskCard task={top} />
          </SwipeableCard>

          <p className="text-center text-xs text-gray-500">
            {g.rightHint
              ? t('chain.hintsBoth', { left: g.leftHint, right: g.rightHint })
              : t('chain.hintsLeft', { left: g.leftHint })}
          </p>

          {cards.length > 1 && (
            <p className="text-xs text-gray-400">
              {t('chain.moreBelow', { count: cards.length - 1 })}
            </p>
          )}

          {room === 'trash' && (
            confirmingPurge?.id === top.id ? (
              <div className="w-full max-w-sm border border-red-300 bg-red-50 rounded-lg p-3 text-sm space-y-2">
                <p className="text-red-800">
                  {t('chain.purgeConfirm', { title: top.title })}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { onPurge(top.id); setConfirmingPurge(null); }}
                  >
                    {t('chain.purge')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmingPurge(null)}>
                    {t('chain.purgeCancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 gap-1.5"
                onClick={() => setConfirmingPurge(top)}
              >
                <Trash2 className="w-4 h-4" />
                {t('chain.purge')}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ChainView;
