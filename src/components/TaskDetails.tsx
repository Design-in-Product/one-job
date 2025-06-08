import React, { useState, useEffect } from 'react'; // <--- ADD useEffect and useState
import { Task, Substack } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // <--- ADD DialogFooter
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
  // <--- NEW PROP: Function to send updates to the parent (Index.tsx)
  onUpdateTask: (taskId: string, updates: { title?: string; description?: string }) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  isOpen,
  onClose,
  onCreateSubstack,
  onOpenSubstack,
  onUpdateTask // <--- Destructure the new prop
}) => {
  if (!task) return null;

  // <--- ADD LOCAL STATE FOR EDITABLE FIELDS
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || ''); // Initialize with empty string for convenience

  // <--- EFFECT TO SYNC LOCAL STATE WITH PROP CHANGES (when different task is opened)
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
    }
  }, [task]);

  const handleCreateSubstack = (name: string) => {
    onCreateSubstack(task.id, name);
  };

  const handleOpenSubstack = (substack: Substack) => {
    onOpenSubstack(task, substack);
    onClose();
  };

  // <--- NEW: Handler for saving changes
  const handleSave = () => {
    // Only send update if title or description have actually changed
    if (editedTitle !== task.title || editedDescription !== (task.description || '')) {
      onUpdateTask(task.id, {
        title: editedTitle,
        description: editedDescription
      });
    }
    onClose(); // Close the dialog after attempting to save
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          {/* <--- MAKE TITLE EDITABLE */}
          <input
            type="text"
            className="text-xl font-bold break-words w-full p-2 -ml-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
        </DialogHeader>

        <div className="space-y-4">
          <div> {/* <--- WRAP DESCRIPTION IN A DIV TO ENSURE IT ALWAYS APPEARS */}
            <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
            {/* <--- MAKE DESCRIPTION EDITABLE */}
            <textarea
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]" // Added min-h for better UX
              rows={5} // Set initial rows for textarea height
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Add a detailed description..."
            />
          </div>

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

        {/* <--- ADD DIALOG FOOTER WITH SAVE/CANCEL BUTTONS */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;