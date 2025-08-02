// src/pages/Index.tsx
//
// Change Log:
// 2025-06-04: Initial integration of FastAPI backend task fetching.
//             - Removed localStorage initialization for tasks.
//             - Added useEffect hook to fetch tasks from http://127.0.0.1:8000/tasks.
//             - Implemented mapBackendTaskToFrontendTask to convert backend's 'status' to frontend's 'completed' boolean.
//             - Added console.log statements for debugging fetched data.
// 2025-06-05: Integrated frontend actions with backend API.
//             - Removed localStorage saving useEffect.
//             - Added `refreshTasks` function to re-fetch tasks after CUD operations.
//             - Modified `handleAddTask` to send POST request to FastAPI.
//             - Modified `handleCompleteTask` to send PUT request to FastAPI (status: 'done').
//             - Modified `handleDeferTask` to send PUT request to FastAPI (status: 'todo').
//             - modified mapBackendTaskToFrontendTask to support deferred tasks.
// 2025-06-06  - Added backedTask.sortOrder to mapBackendTasktoFrontendTask

import React, { useState, useEffect, useCallback } from 'react';
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
import { API_BASE_URL, isDemoMode } from '@/config';


// Helper function to convert backend's task format to frontend's Task interface
const mapBackendTaskToFrontendTask = (backendTask: any): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description,
    completed: backendTask.completed,
    status: backendTask.status,
    createdAt: new Date(backendTask.created_at),
    completedAt: backendTask.completed_at ? new Date(backendTask.completed_at) : undefined,
    deferredAt: backendTask.deferred_at ? new Date(backendTask.deferred_at) : undefined,
    sortOrder: backendTask.sort_order,
    source: backendTask.source,
    externalId: backendTask.external_id,
    substacks: backendTask.substacks || []
  };
};

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [currentSubstack, setCurrentSubstack] = useState<{
    parentTask: Task;
    substack: Substack;
  } | null>(null);
  const [isCreatingSubstack, setIsCreatingSubstack] = useState(false);

  // --- NEW: refreshTasks function ---
  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await fetch('http://127.0.0.1:8000/tasks');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const backendData: any[] = await response.json();
      const frontendTasks: Task[] = backendData.map(mapBackendTaskToFrontendTask);

      console.log("Fetched Backend Data (raw):", backendData);
      console.log("Transformed Frontend Tasks:", frontendTasks);

      setTasks(frontendTasks);
    } catch (err) {
      console.error("Could not fetch tasks from backend:", err);
      setError((err as Error).message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- MODIFIED: useEffect for initial fetching tasks from backend ---
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  // --- NEW: handleUpdateTask function to send PUT request for title/description ---
  const handleUpdateTask = async (taskId: string, updates: { title?: string; description?: string }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      console.log("Task updated in backend:", updatedTask);
      toast.success('Task updated!');
      refreshTasks();
      setIsTaskDetailsOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to update task in backend:", err);
      toast.error(`Failed to update task: ${(err as Error).message}`);
    }
  };


  // --- MODIFIED: handleAddTask to send POST request ---
  const handleAddTask = async (newTask: Task) => {
    if (!currentSubstack) {
      try {
        const response = await fetch('http://127.0.0.1:8000/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newTask.title,
            description: newTask.description,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const addedTask = await response.json();
        console.log("Task added to backend:", addedTask);
        toast.success('Task added!');
        refreshTasks();
      } catch (err) {
        console.error("Failed to add task to backend:", err);
        toast.error(`Failed to add task: ${(err as Error).message}`);
      }
    } else {
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
      setCurrentSubstack(prev => prev ? {
        ...prev,
        substack: {
          ...prev.substack,
          tasks: [newTask, ...prev.substack.tasks]
        }
      } : null);
      toast.success('Task added to substack (local only)');
    }
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(prevTasks => [...importedTasks, ...prevTasks]);
    toast.info('Tasks imported (local only for now)');
  };


  // --- MODIFIED: handleCompleteTask to send PUT request ---
  const handleCompleteTask = async (taskId: string) => {
    if (currentSubstack) {
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
      toast.success('Substack task completed (local only)!');
    } else {
      try {
        const response = await fetch(`http://127.0.0.1:8000/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'done' }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedTask = await response.json();
        console.log("Task completed in backend:", updatedTask);
        toast.success('Task completed!');
        refreshTasks();
      } catch (err) {
        console.error("Failed to complete task in backend:", err);
        toast.error(`Failed to complete task: ${(err as Error).message}`);
      }
    }
  };

  // --- MODIFIED: handleDeferTask to send PUT request ---
  const handleDeferTask = async (taskId: string) => {
    if (currentSubstack) {
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
      toast.info('Substack task moved to the bottom (local only)!');
    } else {
      try {
        const response = await fetch(`http://127.0.0.1:8000/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_deferral: true }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedTask = await response.json();
        console.log("Task deferred in backend:", updatedTask);
        toast.info('Task moved to the bottom of stack!');
        refreshTasks();
      } catch (err) {
        console.error("Failed to defer task in backend:", err);
        toast.error(`Failed to defer task: ${(err as Error).message}`);
      }
    }
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleCreateSubstack = async (taskId: string, name: string) => {
    setIsCreatingSubstack(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/tasks/${taskId}/substacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newSubstack = await response.json();
      console.log("Substack created in backend:", newSubstack);
      toast.success(`Substack "${name}" created!`);
      
      // Refresh tasks to get the updated task with substacks
      await refreshTasks();
      
      // Close task details modal since we're refreshing
      setIsTaskDetailsOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to create substack in backend:", err);
      toast.error(`Failed to create substack: ${(err as Error).message}`);
    } finally {
      setIsCreatingSubstack(false);
    }
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

  const getCurrentSelectedTask = () => {
    if (!selectedTask) return null;
    if (currentSubstack) {
      return currentSubstack.substack.tasks.find(task => task.id === selectedTask.id) || selectedTask;
    }
    return tasks.find(task => task.id === selectedTask.id) || selectedTask;
  };

  if (currentSubstack) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <div className="max-w-md mx-auto flex flex-col h-screen">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SubstackView
              parentTask={currentSubstack.parentTask}
              substack={currentSubstack.substack}
              selectedTask={getCurrentSelectedTask()}
              isTaskDetailsOpen={isTaskDetailsOpen}
              onBack={handleBackToParent}
              onAddTask={handleAddTask}
              onCompleteTask={handleCompleteTask}
              onDeferTask={handleDeferTask}
              onCardClick={handleCardClick}
              onCloseTaskDetails={() => setIsTaskDetailsOpen(false)}
              onCreateSubstack={handleCreateSubstack}
              onOpenSubstack={handleOpenSubstack}
              // NOTE: onUpdateTask prop should also be handled for substack tasks
              // if you implement update functionality for them in the future.
              // For now, it's only passed to the main TaskDetails.
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="main-view"
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col"
      >
        <div className="max-w-md mx-auto flex flex-col h-screen">
          <header className="text-center py-8 px-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-taskGradient-start to-taskGradient-end text-transparent bg-clip-text">
              One Job
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
                  {loading && <p className="text-center mt-8">Loading tasks from backend...</p>}
                  {error && <p className="text-center mt-8 text-red-500">Error loading tasks: {error}</p>}
                  {!loading && !error && activeTasks.length === 0 && <p className="text-center mt-8">All done! Add a new task or check completed/integrations.</p>}

                  {!loading && !error && activeTasks.length > 0 && (
                    <TaskStack
                      tasks={activeTasks}
                      onComplete={handleCompleteTask}
                      onDefer={handleDeferTask}
                      onCardClick={handleCardClick}
                    />
                  )}

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
                  <CompletedTasks tasks={completedTasks} />
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
            task={getCurrentSelectedTask()}
            isOpen={isTaskDetailsOpen}
            onClose={() => setIsTaskDetailsOpen(false)}
            onCreateSubstack={handleCreateSubstack}
            onOpenSubstack={handleOpenSubstack}
            onUpdateTask={handleUpdateTask} 
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;