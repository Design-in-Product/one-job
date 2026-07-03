// src/components/TaskStack.tsx
// Face-up card stack used inside substack views. Shares SwipeableCard and
// TaskCard with the main CardDeck so gestures behave identically everywhere.

import React, { useState } from 'react';
import { Task } from '@/types/task';
import TaskCard from './TaskCard';
import SwipeableCard from './SwipeableCard';
import { CARD_GEOMETRY } from './FlipCard';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TaskStackProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
  onCardClick: (task: Task) => void;
}

const TaskStack: React.FC<TaskStackProps> = ({ tasks, onComplete, onDefer, onCardClick }) => {
  const { t } = useTranslation();
  // Remount the top card on every swipe, even when the same task returns to
  // the top (deferring the only remaining task).
  const [deal, setDeal] = useState(0);

  // Only show active (incomplete) tasks. Sorting for deferred tasks is handled by backend.
  const activeTasks = tasks.filter(task => !task.completed);

  if (activeTasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div
          className={cn(
            CARD_GEOMETRY,
            'border-2 border-dashed border-gray-300 rounded-2xl',
            'flex flex-col items-center justify-center text-center p-6'
          )}
        >
          <h3 className="text-xl font-semibold mb-2 text-gray-500">{t('substackView.allDone')}</h3>
          <p className="text-muted-foreground text-sm">
            {t('substackView.addPrompt')}
          </p>
        </div>
      </div>
    );
  }

  const topTask = activeTasks[0];
  const underlay = activeTasks.slice(1, 3);

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-4">
      <div className={cn(CARD_GEOMETRY, 'relative')}>
        {/* The next cards peek out beneath the top one */}
        {underlay
          .map((task, index) => (
            <div
              key={task.id}
              className={cn(
                'absolute inset-0 pointer-events-none',
                index === 0 ? 'translate-y-1.5 scale-[0.97]' : 'translate-y-3 scale-[0.94]'
              )}
            >
              <TaskCard task={task} className="opacity-90" />
            </div>
          ))
          .reverse()}

        <AnimatePresence initial={false}>
          <motion.div
            key={`${topTask.id}:${deal}`}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.15 } }}
            transition={{ duration: 0.25 }}
          >
            <SwipeableCard
              onSwipeRight={() => {
                onComplete(topTask.id);
                setDeal(d => d + 1);
              }}
              onSwipeLeft={() => {
                onDefer(topTask.id);
                setDeal(d => d + 1);
              }}
              className="w-full h-full"
            >
              <TaskCard task={topTask} onClick={onCardClick} showHints />
            </SwipeableCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskStack;
