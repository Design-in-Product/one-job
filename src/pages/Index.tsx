
import React, { useState, useEffect } from 'react';
import TaskStack from '@/components/TaskStack';
import TaskForm from '@/components/TaskForm';
import CompletedTasks from '@/components/CompletedTasks';
import TaskIntegration from '@/components/TaskIntegration';
import TaskDetails from '@/components/TaskDetails';
import { Task } from '@/types/task';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/sonner';
import { AnimatePresence, motion } from 'framer-motion';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('taskStack');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskStack', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (newTask: Task) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
    toast.success('Task added!');
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(prevTasks => [...importedTasks, ...prevTasks]);
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId
          ? { ...task, completed: true, completedAt: new Date() }
          : task
      )
    );
    toast.success('Task completed!');
  };

  const handleDeferTask = (taskId: string) => {
    setTasks(prevTasks => {
      const taskToMove = prevTasks.find(task => task.id === taskId);
      if (!taskToMove) return prevTasks;
      
      const otherTasks = prevTasks.filter(task => task.id !== taskId);
      return [...otherTasks, taskToMove];
    });
    toast.info('Task moved to the bottom of stack');
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="max-w-md mx-auto flex flex-col h-screen">
        <header className="text-center py-8 px-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-taskGradient-start to-taskGradient-end text-transparent bg-clip-text">
            Task Stack
          </h1>
          <p className="text-muted-foreground mt-2">
            Swipe right to complete, left to defer
          </p>
        </header>

        <Tabs defaultValue="stack" className="flex flex-col flex-1">
          <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
            <TabsTrigger value="stack">Task Stack ({activeTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            <TabsTrigger value="integrate">Integrate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stack" className="flex flex-col flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col flex-1"
              >
                <TaskStack 
                  tasks={tasks} 
                  onComplete={handleCompleteTask} 
                  onDefer={handleDeferTask}
                  onCardClick={handleCardClick}
                />
                
                <div className="px-4 pb-4">
                  <TaskForm onAddTask={handleAddTask} />
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="completed" className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CompletedTasks tasks={tasks} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="integrate" className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TaskIntegration onImportTasks={handleImportTasks} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        <TaskDetails 
          task={selectedTask}
          isOpen={isTaskDetailsOpen}
          onClose={() => setIsTaskDetailsOpen(false)}
        />
      </div>
    </div>
  );
};

export default Index;
