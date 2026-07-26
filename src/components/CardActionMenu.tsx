// src/components/CardActionMenu.tsx
// The per-card action menu (MVP blocker 1). Tap-and-hold any card, at any
// depth, and the card reveals what it can do — Xian's principle: objects
// reveal their affordances on introspection. Dumb sheet: the parent
// computes which actions apply and passes them in.

import React from 'react';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface CardAction {
  key: string;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface CardActionMenuProps {
  card: Task | null;
  actions: CardAction[];
  onClose: () => void;
}

const CardActionMenu: React.FC<CardActionMenuProps> = ({ card, actions, onClose }) => {
  const { t } = useTranslation();
  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-2 animate-slide-up"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="px-4 py-3 text-sm font-semibold text-gray-500 truncate">
          {card.title}
        </p>
        <div className="flex flex-col">
          {actions.map((a) => (
            <button
              key={a.key}
              onClick={a.onClick}
              className={cn(
                'text-left px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 text-base transition-colors',
                a.destructive ? 'text-red-600' : 'text-gray-800'
              )}
            >
              {a.label}
            </button>
          ))}
          <button
            onClick={onClose}
            className="text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-base text-gray-400"
          >
            {t('cardMenu.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardActionMenu;
