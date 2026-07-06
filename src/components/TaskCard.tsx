// src/components/TaskCard.tsx
// Pure presentational card face for a task. Fills its parent container;
// gesture handling (drag/swipe/flip) lives in SwipeableCard and FlipCard.
// Title + description are sized-to-fit: as big as the card allows, with the
// description keeping a fixed proportion of the title (see useFitText).

import React from 'react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';
import { Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFitText } from '@/hooks/use-fit-text';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  /** Show the swipe/tap instruction footer (only on the interactive top card) */
  showHints?: boolean;
  className?: string;
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, showHints = false, className }) => {
  const { t } = useTranslation();
  const hasSubstacks = task.decks && task.decks.length > 0;
  const description = task.description ? truncateText(task.description, 180) : '';

  const { containerRef, contentRef, fontSize } = useFitText(
    [task.title, description, hasSubstacks, task.source, showHints]
  );

  return (
    <div
      className={cn(
        'w-full h-full bg-white rounded-2xl shadow-lg border border-gray-200',
        'flex flex-col p-6 select-none',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick ? () => onClick(task) : undefined}
    >
      {hasSubstacks && (
        <div className="flex justify-end mb-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">
              {task.decks!.length}
            </span>
          </div>
        </div>
      )}

      <div ref={containerRef} className="relative flex-1 min-h-0 overflow-hidden flex">
        <div ref={contentRef} className="m-auto w-full" style={{ fontSize }}>
          <h3 className="font-bold text-gray-800 leading-[1.12] [overflow-wrap:normal]">
            {task.title}
          </h3>
          {description && (
            <p
              className="text-gray-600 leading-snug mt-[0.5em] [overflow-wrap:normal]"
              style={{ fontSize: '0.6em' }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {(task.source || showHints) && (
        <div className="pt-3">
          {task.source && (
            <div className="mb-3">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {task.source}
              </span>
            </div>
          )}

          {showHints && (
            <div className="text-center text-xs text-gray-500 border-t pt-3">
              {t('card.hints')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
