// src/pages/Index.tsx
//
// Change Log:
// 2025-06-04: Initial integration of FastAPI backend task fetching.
//             - Removed localStorage initialization for tasks.
//             - Added useEffect hook to fetch tasks from http://127.0.0.1:8000/tasks.
//             - Implemented mapBackendTaskToFrontendTask to convert backend's 'status' to frontend's 'completed' boolean.
//             - Added console.log statements for debugging fetched data.

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

// Helper function to convert backend's task format to frontend's Task interface
// This handles the `status` to `completed` conversion and adds placeholders for dates.
const mapBackendTaskToFrontendTask = (backendTask: any): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description,
    // Convert backend 'status' to frontend 'completed' boolean
    completed: backendTask.status === 'done',
    // Placeholder for createdAt - ideally, this comes from the backend
    createdAt: new Date(),
    // Placeholder for completedAt - set if status is 'done'
    completedAt: backendTask.status === 'done' ? new Date() : undefined,
    // source, externalId, and substacks will be undefined/null for now
    // as the current backend dummy data doesn't provide them in this structure.
    // If you need to keep metadata from backend, you'd add it to Task interface.
  };
};


const Index = () => {
  // Initialize tasks state as an empty array.
  // It will be populated from the backend.
  // We're removing the localStorage initialization here.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [currentSubstack, setCurrentSubstack] = useState<{
    parentTask: Task;
    substack: Substack;
  } | null>(null);

  // --- NEW: useEffect for fetching tasks from backend ---
  useEffect(() => {
    const fetchTasksFromBackend = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/tasks');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const backendData: any[] = await await response.json();
        // Transform backend data to frontend Task interface
        const frontendTasks: Task[] = backendData.map(mapBackendTaskToFrontendTask);

        // --- Console logs for debugging ---
        console.log("Fetched Backend Data (raw):", backendData);
        console.log("Transformed Frontend Tasks:", frontendTasks);
        // --- End console logs ---

        setTasks(frontendTasks); // Update the tasks state with data from the backend
      } catch (err) {
        console.error("Could not fetch tasks from backend:", err);
        setError((err as Error).message);
        setTasks([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchTasksFromBackend();
  }, []); // Empty dependency array means this runs once on component mount

  // --- EXISTING: useEffect for saving tasks to localStorage ---
  // We keep this for now so local state changes still persist locally,
  // but the initial load now comes from the backend.
  useEffect(() => {
    localStorage.setItem('taskStack', JSON.stringify(tasks));
  }, [tasks]);


  const handleAddTask = (newTask: Task) => {
    // This function currently adds tasks to local state.
    // NEXT STEP: This will send a POST request to your FastAPI backend.
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
    // This function currently updates local state.
    // NEXT STEP: This will send a PUT request to your FastAPI backend to update task status.
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
    // This function currently updates local state.
    // NEXT STEP: This will send a PUT request to your FastAPI backend to update task status.
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
          ? { ...task, substacks: [...(task.substacks || []), newSubstack] }
          : task
      )
    );

    // Update selectedTask if it's the one we're modifying
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => prev ? {
        ...prev,
        substacks: [...(prev.substacks || []), newSubstack]
      } : null);
    }

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

  // Get the current version of the selected task (with any updates like new substacks)
  const getCurrentSelectedTask = () => {
    if (!selectedTask) return null;
    if (currentSubstack) {
      return currentSubstack.substack.tasks.find(task => task.id === selectedTask.id) || selectedTask;
    }
    return tasks.find(task => task.id === selectedTask.id) || selectedTask;
  };

  // If we're in a substack view, show that instead
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
                  {/* Pass the tasks state directly to TaskStack */}
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
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;