// src/components/MoveIntoPicker.tsx
// Target picker for "Move into…" (MVP blocker 1). Targets are the moving
// card's ACTIVE SIBLINGS only (Xian, 2026-07-28): move-into pushes one
// level down, promote pops one level up — push vs. pop. This keeps the
// list short and legible (the whole-tree outline both overwhelmed the
// sheet and once offered a completed card, burying active work); deeper
// nesting still works by repeating the move from inside the new home.

import React from 'react';
import { Task } from '@/types/task';
import { activeSiblingTargets } from '@/domain/tasks';
import { useTranslation } from 'react-i18next';

interface MoveIntoPickerProps {
  movingCard: Task | null;
  allCards: Task[];
  onPick: (targetId: string) => void;
  onClose: () => void;
}

const MoveIntoPicker: React.FC<MoveIntoPickerProps> = ({
  movingCard,
  allCards,
  onPick,
  onClose,
}) => {
  const { t } = useTranslation();
  if (!movingCard) return null;

  const targets = activeSiblingTargets(allCards, movingCard);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl animate-slide-up flex flex-col max-h-[70vh]"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="px-4 py-3 text-sm font-semibold text-gray-500 border-b border-gray-100">
          {t('cardMenu.moveIntoTitle', { title: movingCard.title })}
        </p>
        <div className="overflow-y-auto min-h-0 flex-1">
          {targets.length > 0 ? (
            targets.map(card => (
              <button
                key={card.id}
                onClick={() => onPick(card.id)}
                className="block w-full text-left px-4 py-3.5 text-base leading-snug hover:bg-gray-50 active:bg-gray-100 text-gray-800 truncate transition-colors border-b border-gray-100 last:border-0"
              >
                {card.title}
              </button>
            ))
          ) : (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              {t('cardMenu.moveIntoEmpty')}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-left px-4 py-3 text-base text-gray-400 hover:bg-gray-50 border-t"
        >
          {t('cardMenu.cancel')}
        </button>
      </div>
    </div>
  );
};

export default MoveIntoPicker;
