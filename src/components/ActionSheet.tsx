// src/components/ActionSheet.tsx
// One menu language for the whole app (2026-07-25): a bottom sheet of
// actions. Both the per-card menu and the deck/app menu render through
// this, replacing the old arc "spring-out" menu.

import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface SheetAction {
  key: string;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  open: boolean;
  /** Optional context header (e.g. the card's title) */
  title?: React.ReactNode;
  actions: SheetAction[];
  onClose: () => void;
}

const ActionSheet: React.FC<ActionSheetProps> = ({ open, title, actions, onClose }) => {
  const { t } = useTranslation();
  if (!open) return null;

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
        {title && (
          <p className="px-4 py-3 text-sm font-semibold text-gray-500 truncate">{title}</p>
        )}
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

export default ActionSheet;
