
import React from 'react';
import { Task, Substack } from '@/types/task';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TaskStack from './TaskStack';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';

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
  onCreateSubstack: (taskId: string, name: string) => void;
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
  onCreateSubstack,
  onOpenSubstack
}) => {
  const activeTasks = substack.tasks.filter(task => !task.completed);

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
            {parentTask.title} — {substack.name}
          </h2>
          <p className="text-sm text-gray-600">
            {activeTasks.length} active tasks
          </p>
        </div>
      </div>

      <TaskStack 
        tasks={substack.tasks} 
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
        onCreateSubstack={onCreateSubstack}
        onOpenSubstack={onOpenSubstack}
      />
    </div>
  );
};

export default SubstackView;
