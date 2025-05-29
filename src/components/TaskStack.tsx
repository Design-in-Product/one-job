
import React from 'react';
import { Task } from '@/types/task';
import TaskCard from './TaskCard';
import { AnimatePresence, motion } from 'framer-motion';

interface TaskStackProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
  onCardClick: (task: Task) => void;
}

const TaskStack: React.FC<TaskStackProps> = ({ tasks, onComplete, onDefer, onCardClick }) => {
  // Only show active (incomplete) tasks
  const activeTasks = tasks.filter(task => !task.completed);

  if (activeTasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-300 rounded-xl mx-4 mb-4 min-h-96">
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
    <div className="flex-1 relative mx-4 mb-4 min-h-96">
      {/* Container sized to accommodate fixed card dimensions */}
      {visibleTasks.map((task, index) => (
        <AnimatePresence key={task.id}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <TaskCard
              task={task}
              onSwipeRight={onComplete}
              onSwipeLeft={onDefer}
              onCardClick={onCardClick}
              isTop={index === 0}
            />
          </motion.div>
        </AnimatePresence>
      ))}
    </div>
  );
};

export default TaskStack;
