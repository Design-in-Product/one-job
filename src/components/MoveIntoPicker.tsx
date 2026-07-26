// src/components/MoveIntoPicker.tsx
// Target picker for "Move into…" (MVP blocker 1). A hierarchical outline of
// every card the moving card could land inside — reachableMoveTargets keeps
// it to exactly the places you can navigate to (active cards only), so a
// moved card can never be buried inside a completed, hidden card (the
// 2026-07-26 "Layers of Meta vanished" bug). Its own subtree is excluded so
// you can't create a cycle.

import React from 'react';
import { Task } from '@/types/task';
import { reachableMoveTargets } from '@/domain/tasks';
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

  const rows = reachableMoveTargets(allCards, movingCard).map(({ card, depth }) => (
    <button
      key={card.id}
      onClick={() => onPick(card.id)}
      style={{ paddingLeft: `${depth * 1.25 + 1}rem` }}
      className="w-full text-left py-3.5 pr-4 text-base leading-snug hover:bg-gray-50 active:bg-gray-100 text-gray-800 truncate transition-colors border-b border-gray-100 last:border-0"
    >
      {depth > 0 && <span className="text-gray-300 mr-1.5">↳</span>}
      {card.title}
    </button>
  ));

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
        <p className="px-4 py-3 text-sm font-semibold text-gray-500">
          {t('cardMenu.moveIntoTitle', { title: movingCard.title })}
        </p>
        <div className="flex flex-col overflow-y-auto min-h-0 flex-1">
          {rows.length > 0 ? (
            rows
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
