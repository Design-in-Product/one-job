import React, { useState, useEffect } from 'react'; // <--- ADD useEffect and useState
import { Task, Substack } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // <--- ADD DialogFooter
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Layers, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  /** Item 23: creates the default (unnamed) sub-deck AND opens it */
  onAddSubtasks?: (taskId: string) => void;
  onOpenSubstack: (task: Task, substack: Substack) => void;
  // <--- NEW PROP: Function to send updates to the parent (Index.tsx)
  /** Optional: substack views don't support editing yet */
  onUpdateTask?: (taskId: string, updates: { title?: string; description?: string }) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  isOpen,
  onClose,
  onAddSubtasks,
  onOpenSubstack,
  onUpdateTask
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

          {/* Sub-tasks (Item 23): one default deck, no naming ritual.
              Legacy cards with multiple named decks keep a plain list;
              names return as a surface only with multi-deck support. */}
          <div>
            {(task.decks?.length ?? 0) > 1 ? (
              <div className="space-y-2">
                {task.decks!.map((deck) => (
                  <Button
                    key={deck.id}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleOpenSubstack(deck)}
                  >
                    <span>{deck.name ?? t('details.subtasks')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {t('details.openCount', { count: deck.cards.filter(c => !c.completed).length })}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Button>
                ))}
              </div>
            ) : task.decks?.[0] ? (
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleOpenSubstack(task.decks![0])}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  {t('details.subtasks')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {t('details.openCount', { count: task.decks[0].cards.filter(c => !c.completed).length })}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Button>
            ) : onAddSubtasks ? (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => onAddSubtasks(task.id)}
              >
                <Plus className="w-4 h-4" />
                {t('details.addSubtasks')}
              </Button>
            ) : null}
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