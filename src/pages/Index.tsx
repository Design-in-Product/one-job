
import React, { useState, useEffect } from 'react';
import TaskStack from '@/components/TaskStack';
import TaskForm from '@/components/TaskForm';
import CompletedTasks from '@/components/CompletedTasks';
import TaskIntegration from '@/components/TaskIntegration';
import TaskDetails from '@/components/TaskDetails';
import SubstackView from '@/components/SubstackView';
import { Task, Substack } from '@/types/task';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('taskStack');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [currentSubstack, setCurrentSubstack] = useState<{
    parentTask: Task;
    substack: Substack;
  } | null>(null);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskStack', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (newTask: Task) => {
    if (currentSubstack) {
      // Add task to current substack
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === currentSubstack.parentTask.id
            ? {
                ...task,
                substacks: task.substacks?.map(sub =>
                  sub.id === currentSubstack.substack.id
                    ? { ...sub, tasks: [newTask, ...sub.tasks] }
                    : sub
                ) || []
              }
            : task
        )
      );
      // Update current substack state
      setCurrentSubstack(prev => prev ? {
        ...prev,
        substack: {
          ...prev.substack,
          tasks: [newTask, ...prev.substack.tasks]
        }
      } : null);
    } else {
      // Add task to main stack
      setTasks(prevTasks => [newTask, ...prevTasks]);
    }
    toast.success('Task added!');
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(prevTasks => [...importedTasks, ...prevTasks]);
  };

  const handleCompleteTask = (taskId: string) => {
    if (currentSubstack) {
      // Complete task in current substack
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === currentSubstack.parentTask.id
            ? {
                ...task,
                substacks: task.substacks?.map(sub =>
                  sub.id === currentSubstack.substack.id
                    ? {
                        ...sub,
                        tasks: sub.tasks.map(t =>
                          t.id === taskId
                            ? { ...t, completed: true, completedAt: new Date() }
                            : t
                        )
                      }
                    : sub
                ) || []
              }
            : task
        )
      );
      // Update current substack state
      setCurrentSubstack(prev => prev ? {
        ...prev,
        substack: {
          ...prev.substack,
          tasks: prev.substack.tasks.map(t =>
            t.id === taskId
              ? { ...t, completed: true, completedAt: new Date() }
              : t
          )
        }
      } : null);
    } else {
      // Complete task in main stack
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId
            ? { ...task, completed: true, completedAt: new Date() }
            : task
        )
      );
    }
    toast.success('Task completed!');
  };

  const handleDeferTask = (taskId: string) => {
    if (currentSubstack) {
      // Defer task in current substack
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === currentSubstack.parentTask.id
            ? {
                ...task,
                substacks: task.substacks?.map(sub =>
                  sub.id === currentSubstack.substack.id
                    ? {
                        ...sub,
                        tasks: (() => {
                          const taskToMove = sub.tasks.find(t => t.id === taskId);
                          if (!taskToMove) return sub.tasks;
                          const otherTasks = sub.tasks.filter(t => t.id !== taskId);
                          return [...otherTasks, taskToMove];
                        })()
                      }
                    : sub
                ) || []
              }
            : task
        )
      );
      // Update current substack state
      setCurrentSubstack(prev => {
        if (!prev) return null;
        const taskToMove = prev.substack.tasks.find(t => t.id === taskId);
        if (!taskToMove) return prev;
        const otherTasks = prev.substack.tasks.filter(t => t.id !== taskId);
        return {
          ...prev,
          substack: {
            ...prev.substack,
            tasks: [...otherTasks, taskToMove]
          }
        };
      });
    } else {
      // Defer task in main stack
      setTasks(prevTasks => {
        const taskToMove = prevTasks.find(task => task.id === taskId);
        if (!taskToMove) return prevTasks;
        
        const otherTasks = prevTasks.filter(task => task.id !== taskId);
        return [...otherTasks, taskToMove];
      });
    }
    toast.info('Task moved to the bottom of stack');
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleCreateSubstack = (taskId: string, name: string) => {
    const newSubstack: Substack = {
      id: uuidv4(),
      name,
      tasks: [],
      createdAt: new Date()
    };

    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId
          ? {
              ...task,
              substacks: [...(task.substacks || []), newSubstack]
            }
          : task
      )
    );
    toast.success(`Substack "${name}" created!`);
  };

  const handleOpenSubstack = (parentTask: Task, substack: Substack) => {
    setCurrentSubstack({ parentTask, substack });
  };

  const handleBackToParent = () => {
    setCurrentSubstack(null);
  };

  const currentTasks = currentSubstack ? currentSubstack.substack.tasks : tasks;
  const activeTasks = currentTasks.filter(task => !task.completed);
  const completedTasks = currentTasks.filter(task => task.completed);

  // If we're in a substack view, show that instead
  if (currentSubstack) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <div className="max-w-md mx-auto flex flex-col h-screen">
          <SubstackView
            parentTask={currentSubstack.parentTask}
            substack={currentSubstack.substack}
            selectedTask={selectedTask}
            isTaskDetailsOpen={isTaskDetailsOpen}
            onBack={handleBackToParent}
            onAddTask={handleAddTask}
            onCompleteTask={handleCompleteTask}
            onDeferTask={handleDeferTask}
            onCardClick={handleCardClick}
            onCloseTaskDetails={() => setIsTaskDetailsOpen(false)}
            onCreateSubstack={handleCreateSubstack}
            onOpenSubstack={handleOpenSubstack}
          />
        </div>
      </div>
    );
  }

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
          onCreateSubstack={handleCreateSubstack}
          onOpenSubstack={handleOpenSubstack}
        />
      </div>
    </div>
  );
};

export default Index;
