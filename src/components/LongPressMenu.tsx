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
  onViewCompleted: () => void;
  onViewIntegrations: () => void;
  onSettings?: () => void;
}

const LongPressMenu: React.FC<LongPressMenuProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onViewCompleted,
  onViewIntegrations,
  onSettings,
}) => {
  const { t } = useTranslation();
  const actions: SheetAction[] = [
    { key: 'add', label: t('menu.addTask'), onClick: onAddTask },
    { key: 'completed', label: t('menu.completed'), onClick: onViewCompleted },
    { key: 'integrations', label: t('menu.integrations'), onClick: onViewIntegrations },
    ...(onSettings ? [{ key: 'settings', label: t('menu.settings'), onClick: onSettings }] : []),
  ];

  return <ActionSheet open={isOpen} actions={actions} onClose={onClose} />;
};

export default LongPressMenu;
