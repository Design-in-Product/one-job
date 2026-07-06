
import React from 'react';
import { Task, Substack } from '@/types/task';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TaskStack from './TaskStack';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';
import { useTranslation } from 'react-i18next';

interface SubstackViewProps {
  parentTask: Task;
  substack: Substack;
  selectedTask: Task | null;
  isTaskDetailsOpen: boolean;
  onBack: () => void;
  onAddTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onDeferTask: (taskId: string) => void;
  onCardClick: (task: Task) => void;
  onCloseTaskDetails: () => void;
  onAddSubtasks?: (taskId: string) => void;
  onOpenSubstack: (task: Task, substack: Substack) => void;
}

const SubstackView: React.FC<SubstackViewProps> = ({
  parentTask,
  substack,
  selectedTask,
  isTaskDetailsOpen,
  onBack,
  onAddTask,
  onCompleteTask,
  onDeferTask,
  onCardClick,
  onCloseTaskDetails,
  onAddSubtasks,
  onOpenSubstack
}) => {
  const { t } = useTranslation();
  const activeTasks = substack.cards.filter(task => !task.completed);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">
            {substack.name
              ? t('substackView.heading', { parent: parentTask.title, substack: substack.name })
              : t('substackView.headingUnnamed', { parent: parentTask.title })}
          </h2>
          <p className="text-sm text-gray-600">
            {t('substackView.activeCount', { count: activeTasks.length })}
          </p>
        </div>
      </div>

      <TaskStack 
        tasks={substack.cards} 
        onComplete={onCompleteTask} 
        onDefer={onDeferTask}
        onCardClick={onCardClick}
      />
      
      <div className="px-4 pb-4">
        <TaskForm onAddTask={onAddTask} />
      </div>

      <TaskDetails 
        task={selectedTask}
        isOpen={isTaskDetailsOpen}
        onClose={onCloseTaskDetails}
        onAddSubtasks={onAddSubtasks}
        onOpenSubstack={onOpenSubstack}
      />
    </div>
  );
};

export default SubstackView;
