// src/components/TaskCard.tsx
// Pure presentational card face for a task. Fills its parent container;
// gesture handling (drag/swipe/flip) lives in SwipeableCard and FlipCard.

import React from 'react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';
import { Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const hasSubstacks = task.substacks && task.substacks.length > 0;

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
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 break-words flex-1 leading-tight">
            {task.title}
          </h3>
          {hasSubstacks && (
            <div className="flex items-center gap-1 ml-3 px-2 py-1 bg-blue-50 rounded-full flex-shrink-0">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">
                {task.substacks!.length}
              </span>
            </div>
          )}
        </div>

        {task.description && (
          <p className="text-gray-600 text-sm mb-4 break-words flex-1 overflow-hidden">
            {truncateText(task.description, 180)}
          </p>
        )}

        <div className="mt-auto">
          {task.source && (
            <div className="mb-4">
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
      </div>
    </div>
  );
};

export default TaskCard;
