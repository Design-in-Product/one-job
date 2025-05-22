
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';

interface TaskFormProps {
  onAddTask: (task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const newTask: Task = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      createdAt: new Date(),
    };
    
    onAddTask(newTask);
    setTitle('');
    setDescription('');
    setIsFormOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      {!isFormOpen ? (
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="w-full bg-gradient-to-r from-taskGradient-start to-taskGradient-end hover:opacity-90 text-white"
        >
          Add New Task
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 animate-slide-up">
          <h3 className="text-lg font-medium mb-3">Add New Task</h3>
          <div className="space-y-3">
            <div>
              <Input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            <div>
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-taskGradient-start to-taskGradient-end hover:opacity-90 text-white"
              >
                Add Task
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsFormOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskForm;
