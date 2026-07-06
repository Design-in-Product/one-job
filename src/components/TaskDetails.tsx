import React, { useState, useEffect } from 'react'; // <--- ADD useEffect and useState
import { Task, Substack } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // <--- ADD DialogFooter
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import SubstackCreator from './SubstackCreator';
import { useTranslation } from 'react-i18next';

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateSubstack: (taskId: string, name: string) => void;
  onOpenSubstack: (task: Task, substack: Substack) => void;
  // <--- NEW PROP: Function to send updates to the parent (Index.tsx)
  /** Optional: substack views don't support editing yet */
  onUpdateTask?: (taskId: string, updates: { title?: string; description?: string }) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  isOpen,
  onClose,
  onCreateSubstack,
  onOpenSubstack,
  onUpdateTask // <--- Destructure the new prop
}) => {
  // ALL hooks must run before any early return (Rules of Hooks): this
  // component stays mounted with task=null and receives a task later,
  // so a hook after the null-return crashes React with "rendered more
  // hooks than during the previous render" (the 2026-07-05 white screen).
  const { t } = useTranslation();
  const [editedTitle, setEditedTitle] = useState(task?.title ?? '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');
  // R1.4 (Vision Item 18): the card opens for READING, like a baseball
  // card; a tap on the text (or the Edit button) switches to editing.
  const [isEditing, setIsEditing] = useState(false);

  // Sync local state when a different task is opened
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setIsEditing(false);
    }
  }, [task]);

  if (!task) return null;

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
      onUpdateTask?.(task.id, {
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
          {isEditing ? (
            <input
              type="text"
              className="text-xl font-bold break-words w-full p-2 -ml-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          ) : (
            <DialogTitle
              className="text-xl font-bold break-words cursor-text"
              onClick={() => setIsEditing(true)}
            >
              {task.title}
            </DialogTitle>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
            {isEditing ? (
              <textarea
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
                rows={5}
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder={t('details.descriptionPlaceholder')}
              />
            ) : (
              <p
                className="text-gray-700 whitespace-pre-line cursor-text min-h-[1.5rem]"
                onClick={() => setIsEditing(true)}
              >
                {task.description || <span className="text-gray-400">{t('details.noDescription')}</span>}
              </p>
            )}
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
            <h4 className="font-semibold text-gray-700 mb-2">{t('details.created')}</h4>
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
            <h4 className="font-semibold text-gray-700 mb-3">{t('details.decks')}</h4>

            {task.decks && task.decks.length > 0 && (
              <div className="space-y-2 mb-3">
                {task.decks.map((substack) => (
                  <Button
                    key={substack.id}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleOpenSubstack(substack)}
                  >
                    <span>{substack.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {substack.cards.filter(t => !t.completed).length} tasks
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
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                {t('details.cancel')}
              </Button>
              <Button onClick={handleSave}>
                {t('details.save')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                {t('details.close')}
              </Button>
              {onUpdateTask && (
                <Button onClick={() => setIsEditing(true)}>
                  {t('details.edit')}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;