// src/components/TaskCard.tsx
// Pure presentational card face for a task. Fills its parent container;
// gesture handling (drag/swipe/flip) lives in SwipeableCard and FlipCard.
// Title + description are sized-to-fit: as big as the card allows, with the
// description keeping a fixed proportion of the title (see useFitText).

import React from 'react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';
import { Layers, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFitText } from '@/hooks/use-fit-text';

interface TaskCardProps {
  task: Task;
  /** Deck identity on the READING side (Xian-blessed 2026-08-06): the
      card's margin takes the deck hue at ~50% saturation — the back's
      cream-margin idea, so the object stays "of its deck" both sides.
      Only when the device has >1 deck; deck-1 (brand) passes none. */
  deckIdentity?: { name: string | null; color?: { g1: string; g2: string } };
  onClick?: (task: Task) => void;
  /** Tapping the sub-deck badge opens the interior directly — no edit
      step (MVP blocker 3). Absent → badge is a plain indicator. */
  onOpenSubdeck?: (task: Task) => void;
  /** Turn the card face-down again (Item 19). Only the interactive top
      card gets this; sub-deck/room cards have no back. */
  onFlipBack?: () => void;
  /** Show the swipe/tap instruction footer (only on the interactive top card) */
  showHints?: boolean;
  className?: string;
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onOpenSubdeck, onFlipBack, showHints = false, className, deckIdentity }) => {
  const { t } = useTranslation();
  // Honest badge (Item 15 corollary): show the count of UNFINISHED interior
  // cards; a card whose inside is done reads as childless.
  const unfinishedInside = (task.decks ?? [])
    .flatMap(d => d.cards)
    .filter(c => !c.completed).length;
  const description = task.description ? truncateText(task.description, 180) : '';

  const { containerRef, contentRef, fontSize } = useFitText(
    [task.title, description, unfinishedInside, task.source, showHints]
  );

  // Hued margin: deck color mixed ~50% toward the warm ground, 4px —
  // "50%-ish saturated, possibly a bit thinner" (Xian, 2026-08-06).
  const marginStyle = deckIdentity?.color
    ? {
        border: '4px solid transparent',
        background: `linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg, color-mix(in srgb, ${deckIdentity.color.g1} 50%, #f3f1ee), color-mix(in srgb, ${deckIdentity.color.g2} 50%, #f3f1ee)) border-box`,
      }
    : undefined;
  return (
    <div
      className={cn(
        'w-full h-full bg-white rounded-2xl shadow-lg border border-gray-200',
        'flex flex-col p-6 select-none relative',
        onClick && 'cursor-pointer',
        className
      )}
      style={marginStyle}
      onClick={onClick ? () => onClick(task) : undefined}
    >
      {deckIdentity?.color && (
        <div
          className="absolute top-2.5 right-4 text-[11px] font-bold tracking-[.08em] uppercase"
          style={{ color: `color-mix(in srgb, ${deckIdentity.color.g2} 72%, #6d7280)` }}
        >
          {deckIdentity.name ?? ''}
        </div>
      )}
      {(onFlipBack || unfinishedInside > 0) && (
        <div className="flex items-center justify-between mb-2">
          {/* Left: turn the card face-down again (Item 19) */}
          {onFlipBack ? (
            <button
              onClick={(e) => { e.stopPropagation(); onFlipBack(); }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={t('card.flipBack')}
              className="p-1.5 -ml-1 rounded-full text-gray-300 hover:text-gray-500 active:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : <span />}
          {/* Right: sub-deck badge */}
          {unfinishedInside > 0 ? (
          onOpenSubdeck ? (
            // Tappable badge → open the sub-deck directly (blocker 3).
            // Stops propagation so it doesn't also trigger the card's tap.
            <button
              onClick={(e) => { e.stopPropagation(); onOpenSubdeck(task); }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={t('card.openSubdeckBadge', { count: unfinishedInside })}
              className="flex items-center gap-1 pl-2.5 pr-2 py-1.5 bg-blue-50 rounded-full active:bg-blue-100 transition-colors"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-semibold">{unfinishedInside}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">{unfinishedInside}</span>
            </div>
          )
          ) : <span />}
        </div>
      )}

      <div ref={containerRef} className="relative flex-1 min-h-0 overflow-hidden flex">
        <div ref={contentRef} className="m-auto w-full" style={{ fontSize }}>
          <h3 className="font-bold text-gray-800 leading-[1.12] [overflow-wrap:normal]">
            {task.title}
          </h3>
          {description && (
            <p
              className="text-gray-600 leading-snug mt-[0.5em] whitespace-pre-line [overflow-wrap:normal]"
              style={{ fontSize: '0.6em' }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {(task.source || showHints) && (
        <div className="pt-3">
          {task.source && (
            <div className="mb-3">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {task.source}
              </span>
            </div>
          )}

          {showHints && (
            <div className="text-center text-xs text-gray-500 border-t pt-3">
              {t('card.hints')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
