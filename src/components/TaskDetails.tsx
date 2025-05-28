
import React from 'react';
import { Task } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, isOpen, onClose }) => {
  if (!task) return null;

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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;
