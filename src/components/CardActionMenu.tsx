// src/components/CardActionMenu.tsx
// The per-card action menu (MVP blocker 1). Tap-and-hold any card, at any
// depth, and the card reveals what it can do — Xian's principle: objects
// reveal their affordances on introspection. Renders through the shared
// ActionSheet; the parent computes which actions apply.

import React from 'react';
import { Task } from '@/types/task';
import ActionSheet, { SheetAction } from './ActionSheet';

export type CardAction = SheetAction;

interface CardActionMenuProps {
  card: Task | null;
  actions: CardAction[];
  onClose: () => void;
}

const CardActionMenu: React.FC<CardActionMenuProps> = ({ card, actions, onClose }) => (
  <ActionSheet open={!!card} title={card?.title} actions={actions} onClose={onClose} />
);

export default CardActionMenu;
