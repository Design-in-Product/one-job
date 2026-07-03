
import React from 'react';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface CompletedTasksProps {
  tasks: Task[];
}

const CompletedTasks: React.FC<CompletedTasksProps> = ({ tasks }) => {
  const { t } = useTranslation();
  const completedTasks = tasks.filter(task => task.completed);

  if (completedTasks.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        {t('completed.empty')}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {completedTasks.map(task => (
        <div
          key={task.id}
          className={cn(
            "bg-gradient-to-br from-completedGradient-start to-completedGradient-end",
            "rounded-lg p-3 shadow-md text-white"
          )}
        >
          <h3 className="font-medium">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-white/90 mt-1">{task.description}</p>
          )}
          <div className="flex justify-between items-center mt-2 text-xs text-white/70">
            <span>
              {task.completedAt && (() => {
                try {
                  const date = task.completedAt instanceof Date ? task.completedAt : new Date(task.completedAt);
                  return t('completed.completedAgo', { ago: formatDistanceToNow(date, { addSuffix: true }) });
                } catch (e) {
                  console.error('Date formatting error:', e, task.completedAt);
                  return t('completed.completedRecently');
                }
              })()}
            </span>
            {task.source && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full">
                {task.source}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompletedTasks;
