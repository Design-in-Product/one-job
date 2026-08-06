// src/components/LongPressMenu.tsx
// The deck / app menu (hold the deck/background). Renders through the same
// ActionSheet as the per-card menu — one menu language across the app
// (2026-07-25; replaced the old arc "spring-out" layout).

import React from 'react';
import ActionSheet, { SheetAction } from './ActionSheet';
import { useTranslation } from 'react-i18next';

interface LongPressMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: () => void;
  /** Session undo (2026-07-29) — absent when the store can't undo. */
  onUndo?: () => void;
  onRedo?: () => void;
  /** Root decks (R2.1 stage 2) — absent until the device has (or can
      create) more than one deck: no cruft till it's needed. */
  onDecks?: () => void;
  onRenameDeck?: () => void;
  /** Inchworm walk (R2.7) — label carries the on/off state. */
  onInchworm?: () => void;
  inchwormOn?: boolean;
  onViewCompleted: () => void;
  onViewIntegrations: () => void;
  onSettings?: () => void;
}

const LongPressMenu: React.FC<LongPressMenuProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onUndo,
  onRedo,
  onDecks,
  onRenameDeck,
  onInchworm,
  inchwormOn,
  onViewCompleted,
  onViewIntegrations,
  onSettings,
}) => {
  const { t } = useTranslation();
  const actions: SheetAction[] = [
    // Undo leads: reaching for it means something just went wrong
    ...(onUndo ? [{ key: 'undo', label: t('menu.undo'), onClick: onUndo }] : []),
    ...(onRedo ? [{ key: 'redo', label: t('menu.redo'), onClick: onRedo }] : []),
    { key: 'add', label: t('menu.addTask'), onClick: onAddTask },
    ...(onDecks ? [{ key: 'decks', label: t('menu.decks'), onClick: onDecks }] : []),
    ...(onRenameDeck ? [{ key: 'renamedeck', label: t('menu.renameDeck'), onClick: onRenameDeck }] : []),
    ...(onInchworm ? [{ key: 'inchworm',
      label: (inchwormOn ? '✓ ' : '') + t('menu.inchworm'), onClick: onInchworm }] : []),
    { key: 'completed', label: t('menu.completed'), onClick: onViewCompleted },
    { key: 'integrations', label: t('menu.integrations'), onClick: onViewIntegrations },
    ...(onSettings ? [{ key: 'settings', label: t('menu.settings'), onClick: onSettings }] : []),
  ];

  return <ActionSheet open={isOpen} actions={actions} onClose={onClose} />;
};

export default LongPressMenu;
