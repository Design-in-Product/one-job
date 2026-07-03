// src/components/CardDeck.tsx
// Card Deck Experience - the playing-card interface. Composes:
//   CardBack (face-down design) + TaskCard (face-up content)
//   FlipCard (3D flip)  + SwipeableCard (drag/fling gestures)
// with a static deck underlay so the stack reads as a physical pile.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types/task';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import CardBack from './CardBack';
import FlipCard, { CARD_GEOMETRY, FlipPreset, randomFlipPreset } from './FlipCard';
import SwipeableCard from './SwipeableCard';
import LongPressMenu from './LongPressMenu';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FACE_DOWN_TIMEOUT_MS = 60000; // idle time before the card turns face-down
const AUTO_REVEAL_DELAY_MS = 650;   // pause before the next card flips up after a swipe
const LONG_PRESS_MS = 500;

interface CardDeckProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
  onCardClick: (task: Task) => void;
  onAddTask: (task: Task) => void;
  onViewCompleted: () => void;
  onViewIntegrations: () => void;
  onViewSettings: () => void;
}

const CardDeck: React.FC<CardDeckProps> = ({
  tasks,
  loading,
  error,
  onComplete,
  onDefer,
  onCardClick,
  onAddTask,
  onViewCompleted,
  onViewIntegrations,
  onViewSettings
}) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipPreset, setFlipPreset] = useState<FlipPreset>('classic');
  const [showMenu, setShowMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  // Incremented on every swipe so the active card remounts even when the
  // same task stays on top (e.g. deferring the only remaining task).
  const [deal, setDeal] = useState(0);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentTask = tasks[0];

  // Idle timeout: face-up card turns back over after a minute of inactivity
  useEffect(() => {
    if (!isFlipped) return;
    const idleTimeout = setTimeout(() => setIsFlipped(false), FACE_DOWN_TIMEOUT_MS);
    return () => clearTimeout(idleTimeout);
  }, [isFlipped, currentTask?.id]);

  useEffect(() => () => {
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
  }, []);

  const reveal = useCallback(() => {
    setFlipPreset(randomFlipPreset());
    setIsFlipped(true);
    setIsFirstLaunch(false);
  }, []);

  const handleCardTap = useCallback(() => {
    if (!isFlipped && tasks.length > 0) reveal();
  }, [isFlipped, tasks.length, reveal]);

  // After a swipe: new top card mounts face-down, then auto-reveals.
  // `remaining` is computed at call time from the pre-update task list,
  // so there's no stale-closure race with the parent's state update.
  const swipeAndRedeal = (remaining: number) => {
    setIsFlipped(false);
    setDeal(d => d + 1);
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    if (remaining > 0) {
      revealTimeoutRef.current = setTimeout(reveal, AUTO_REVEAL_DELAY_MS);
    }
  };

  const handleSwipeComplete = () => {
    onComplete(currentTask.id);
    swipeAndRedeal(tasks.length - 1);
  };

  const handleSwipeDefer = () => {
    onDefer(currentTask.id);
    swipeAndRedeal(tasks.length); // deferral keeps the task in the stack
  };

  // Long-press (pointer events cover mouse + touch); cancelled by movement
  // so slow card drags don't pop the menu.
  const handlePointerDown = (e: React.PointerEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const timer = setTimeout(() => {
      cleanup();
      setShowMenu(true);
    }, LONG_PRESS_MS);
    const cancel = () => {
      clearTimeout(timer);
      cleanup();
    };
    const onMove = (ev: PointerEvent) => {
      if (Math.abs(ev.clientX - startX) > 8 || Math.abs(ev.clientY - startY) > 8) cancel();
    };
    const cleanup = () => {
      document.removeEventListener('pointerup', cancel);
      document.removeEventListener('pointercancel', cancel);
      document.removeEventListener('pointermove', onMove);
    };
    document.addEventListener('pointerup', cancel);
    document.addEventListener('pointercancel', cancel);
    document.addEventListener('pointermove', onMove);
  };

  const menu = (
    <>
      {/* Persistent capture affordance: the one piece of standing chrome.
          Restores the always-available "add" the tabbed UI had (lost in the
          2025-08 decluttering pivot); long-press arc menu remains too. */}
      <button
        onClick={() => setShowAddForm(true)}
        aria-label={t('deck.addAria')}
        className={cn(
          'fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full',
          'bg-gradient-to-br from-taskGradient-start to-taskGradient-end',
          'text-white shadow-lg flex items-center justify-center',
          'opacity-90 hover:opacity-100 active:scale-95 transition',
          'border-2 border-white/70'
        )}
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Plus className="w-7 h-7" />
      </button>

      <LongPressMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onAddTask={() => {
          setShowMenu(false);
          setShowAddForm(true);
        }}
        onViewCompleted={() => {
          setShowMenu(false);
          onViewCompleted();
        }}
        onViewIntegrations={() => {
          setShowMenu(false);
          onViewIntegrations();
        }}
        onSettings={() => {
          setShowMenu(false);
          onViewSettings();
        }}
      />

      {/* Add Task modal, reachable from the arc menu */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 pt-[max(3rem,env(safe-area-inset-top))]"
          onClick={() => setShowAddForm(false)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <TaskForm
              onAddTask={(task) => {
                onAddTask(task);
                setShowAddForm(false);
              }}
              defaultOpen
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('deck.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-500 p-4">
          <p className="font-medium mb-2">{t('deck.errorTitle')}</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6" onPointerDown={handlePointerDown}>
        <div
          className={cn(
            CARD_GEOMETRY,
            'border-2 border-dashed border-gray-300 rounded-2xl',
            'flex flex-col items-center justify-center text-center p-6'
          )}
        >
          <h3 className="text-xl font-medium mb-2 text-gray-500">{t('deck.emptyTitle')}</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {t('deck.emptyBody')}
          </p>
          <TaskForm onAddTask={onAddTask} />
          <p className="mt-4 text-xs text-gray-400">
            {t('deck.emptyHint')}
          </p>
        </div>
        {menu}
      </div>
    );
  }

  const underlayCount = Math.min(tasks.length - 1, 2);

  return (
    <div className="flex-1 relative">
      <div
        className="absolute inset-4 flex items-center justify-center"
        onPointerDown={handlePointerDown}
      >
        <div className={cn(CARD_GEOMETRY, 'relative')}>
          {/* Deck underlay: the rest of the pile, always face-down */}
          {underlayCount >= 2 && (
            <div className="absolute inset-0 translate-y-3 scale-[0.94] pointer-events-none">
              <CardBack />
            </div>
          )}
          {underlayCount >= 1 && (
            <div className="absolute inset-0 translate-y-1.5 scale-[0.97] pointer-events-none">
              <CardBack />
            </div>
          )}

          {/* Active card: flips to reveal, drags to complete/defer */}
          <AnimatePresence initial={false}>
            <motion.div
              key={`${currentTask.id}:${deal}`}
              className="absolute inset-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.15 } }}
              transition={{ duration: 0.25 }}
            >
              <SwipeableCard
                disabled={!isFlipped}
                onSwipeRight={handleSwipeComplete}
                onSwipeLeft={handleSwipeDefer}
                className="w-full h-full"
              >
                <FlipCard
                  className="w-full h-full"
                  isFlipped={isFlipped}
                  preset={flipPreset}
                  onTapBack={handleCardTap}
                  back={<CardBack showHint />}
                  front={
                    <TaskCard
                      task={currentTask}
                      onClick={onCardClick}
                      showHints
                    />
                  }
                />
              </SwipeableCard>

              {/* Gentle pulse inviting the first tap */}
              {isFirstLaunch && !isFlipped && (
                <div className="absolute inset-0 rounded-2xl border-2 border-orange-300 animate-pulse pointer-events-none" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {menu}
    </div>
  );
};

export default CardDeck;
