// src/components/MoveIntoPicker.tsx
// Target picker for "Move into…" (MVP blocker 1). A hierarchical outline of
// every card the moving card could land inside — its own subtree is
// excluded so you can't create a cycle (Xian: drag to any level, not just
// peers; "whatever functions for now is okay").

import React from 'react';
import { Task } from '@/types/task';
import { collectDescendantIds } from '@/domain/tasks';
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

  const excluded = new Set<string>([movingCard.id, ...collectDescendantIds(movingCard)]);

  const rows: React.ReactNode[] = [];
  const walk = (cards: Task[], depth: number) => {
    for (const c of cards) {
      if (!excluded.has(c.id)) {
        rows.push(
          <button
            key={c.id}
            onClick={() => onPick(c.id)}
            style={{ paddingLeft: `${depth * 1.25 + 1}rem` }}
            className="w-full text-left py-2.5 pr-4 hover:bg-gray-50 active:bg-gray-100 text-gray-800 truncate transition-colors"
          >
            {depth > 0 && <span className="text-gray-300 mr-1">↳</span>}
            {c.title}
          </button>
        );
      }
      for (const d of c.decks ?? []) walk(d.cards, depth + 1);
    }
  };
  walk(allCards, 0);

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
        <div className="flex flex-col overflow-y-auto">
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
