
import React from 'react';
import { Task } from '@/types/task';
import TaskCard from './TaskCard';
import { AnimatePresence, motion } from 'framer-motion';

interface TaskStackProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
}

const TaskStack: React.FC<TaskStackProps> = ({ tasks, onComplete, onDefer }) => {
  // Only show active (incomplete) tasks
  const activeTasks = tasks.filter(task => !task.completed);

  if (activeTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">All done! 🎉</h3>
        <p className="text-muted-foreground">
          Add a new task to get started again.
        </p>
      </div>
    );
  }

  // Show the top 3 tasks (for stacking visual)
  const visibleTasks = activeTasks.slice(0, 3);

  return (
    <div className="relative h-80 w-full max-w-md mx-auto">
      {/* Container has fixed height to maintain layout when cards are swiped */}
      <div className="relative h-full w-full flex items-center justify-center">
        {visibleTasks.map((task, index) => (
          <AnimatePresence key={task.id}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TaskCard
                task={task}
                onSwipeRight={onComplete}
                onSwipeLeft={onDefer}
                isTop={index === 0}
              />
            </motion.div>
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
};

export default TaskStack;
