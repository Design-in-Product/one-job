
import React from 'react';
import { Task, Substack } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import SubstackCreator from './SubstackCreator';

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateSubstack: (taskId: string, name: string) => void;
  onOpenSubstack: (task: Task, substack: Substack) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onCreateSubstack,
  onOpenSubstack 
}) => {
  if (!task) return null;

  const handleCreateSubstack = (name: string) => {
    onCreateSubstack(task.id, name);
  };

  const handleOpenSubstack = (substack: Substack) => {
    onOpenSubstack(task, substack);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold break-words">
            {task.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {task.description && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600 break-words">{task.description}</p>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Status</h4>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              task.completed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {task.completed ? 'Completed' : 'Active'}
            </span>
          </div>
          
          {task.source && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Source</h4>
              <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {task.source}
              </span>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Created</h4>
            <p className="text-gray-600 text-sm">
              {formatDistanceToNow(task.createdAt, { addSuffix: true })}
            </p>
          </div>
          
          {task.completedAt && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Completed</h4>
              <p className="text-gray-600 text-sm">
                {formatDistanceToNow(task.completedAt, { addSuffix: true })}
              </p>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Substacks</h4>
            
            {task.substacks && task.substacks.length > 0 && (
              <div className="space-y-2 mb-3">
                {task.substacks.map((substack) => (
                  <Button
                    key={substack.id}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleOpenSubstack(substack)}
                  >
                    <span>{substack.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {substack.tasks.filter(t => !t.completed).length} tasks
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Button>
                ))}
              </div>
            )}
            
            <SubstackCreator onCreateSubstack={handleCreateSubstack} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;
