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
import CardDeck from '@/components/CardDeck';
import TaskForm from '@/components/TaskForm';
import CompletedTasks from '@/components/CompletedTasks';
import TaskIntegration from '@/components/TaskIntegration';
import TaskDetails from '@/components/TaskDetails';
import SettingsView from '@/components/SettingsView';
import SubstackView from '@/components/SubstackView';
import { Task, Substack } from '@/types/task';
import { toast } from '@/components/ui/sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { isDemoMode } from '@/config';
import { DemoService } from '@/services/demoService';
import { getTaskStore } from '@/services/taskStore';
import { useTranslation } from 'react-i18next';


const Index = () => {
  const { t } = useTranslation();
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
  const [currentView, setCurrentView] = useState<'main' | 'completed' | 'integrate' | 'settings'>('main');

  // --- NEW: refreshTasks function ---
  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      setTasks(await getTaskStore().getAllTasks());
    } catch (err) {
      console.error("Could not fetch tasks:", err);
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
      await getTaskStore().updateTask(taskId, updates);
      toast.success(t('toasts.taskUpdated'));
      refreshTasks();
      setIsTaskDetailsOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to update task in backend:", err);
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };


  // --- MODIFIED: handleAddTask to send POST request ---
  const handleAddTask = async (newTask: Task) => {
    if (!currentSubstack) {
      try {
        await getTaskStore().createTask(newTask.title, newTask.description);
        toast.success(isDemoMode
          ? DemoService.getInstance().getDemoMessage('taskAdded')
          : t('toasts.taskAdded'));
        refreshTasks();
      } catch (err) {
        console.error("Failed to add task:", err);
        toast.error(t('toasts.addFailed', { message: (err as Error).message }));
      }
    } else {
      try {
        const addedTask = await getTaskStore().addSubstackTask(
          currentSubstack.substack.id,
          newTask.title,
          newTask.description
        );
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === currentSubstack.parentTask.id
              ? {
                  ...task,
                  decks: task.decks?.map(sub =>
                    sub.id === currentSubstack.substack.id
                      ? { ...sub, cards: [...sub.cards, addedTask] }
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
            cards: [...prev.substack.cards, addedTask]
          }
        } : null);
        toast.success(t('toasts.addedToSubstack'));
      } catch (err) {
        console.error("Failed to add substack task:", err);
        toast.error(t('toasts.addFailed', { message: (err as Error).message }));
      }
    }
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(prevTasks => [...importedTasks, ...prevTasks]);
    toast.info(t('toasts.imported'));
  };


  // Recovery: return an accidentally-completed task to the top of the deck.
  const handleUncompleteTask = async (taskId: string) => {
    const store = getTaskStore();
    if (!store.uncompleteTask) return;
    try {
      await store.uncompleteTask(taskId);
      toast.success(t('toasts.uncompleted'));
      refreshTasks();
      setCurrentView('main');
    } catch (err) {
      console.error("Failed to un-complete:", err);
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };

  // Undo support: restore a pre-action snapshot of a task (5s toast window).
  // Only offered when the active store implements restoreTask (local/demo).
  const undoTaskAction = async (snapshot: Task) => {
    const store = getTaskStore();
    if (!store.restoreTask) return;
    try {
      await store.restoreTask(snapshot);
      toast.success(t('toasts.undone'));
      refreshTasks();
    } catch (err) {
      console.error("Failed to undo:", err);
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };

  // Snapshot a task's current state before mutating it, for undo. Must be a
  // deep clone: the local store mutates the same objects React state holds.
  // Never throws — a failed snapshot only costs the Undo offer, not the swipe.
  const snapshotTask = (taskId: string): Task | undefined => {
    try {
      const task = tasks.find(tk => tk.id === taskId);
      if (!task) return undefined;
      return typeof structuredClone === 'function'
        ? structuredClone(task)
        : (JSON.parse(JSON.stringify(task)) as Task);
    } catch (err) {
      console.warn('Snapshot for undo failed:', err);
      return undefined;
    }
  };

  const undoToastOptions = (snapshot: Task | undefined) =>
    snapshot && getTaskStore().restoreTask
      ? {
          duration: 5000,
          action: { label: t('toasts.undo'), onClick: () => undoTaskAction(snapshot) },
        }
      : undefined;

  // --- MODIFIED: handleCompleteTask to send PUT request ---
  const handleCompleteTask = async (taskId: string) => {
    if (currentSubstack) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === currentSubstack.parentTask.id
            ? {
                ...task,
                decks: task.decks?.map(sub =>
                  sub.id === currentSubstack.substack.id
                    ? {
                        ...sub,
                        tasks: sub.cards.map(t =>
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
          tasks: prev.substack.cards.map(t =>
            t.id === taskId
              ? { ...t, completed: true, completedAt: new Date() }
              : t
          )
        }
      } : null);
      try {
        await getTaskStore().completeSubstackTask(taskId);
        toast.success(t('toasts.substackTaskCompleted'));
      } catch (err) {
        console.error("Failed to persist substack task completion:", err);
        toast.error(t('toasts.completeFailed', { message: (err as Error).message }));
      }
    } else {
      const snapshot = snapshotTask(taskId);
      try {
        await getTaskStore().completeTask(taskId);
        toast.success(isDemoMode
          ? DemoService.getInstance().getDemoMessage('taskCompleted')
          : t('toasts.taskCompleted'), undoToastOptions(snapshot));
        refreshTasks();
      } catch (err) {
        console.error("Failed to complete task:", err);
        toast.error(t('toasts.completeFailed', { message: (err as Error).message }));
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
                decks: task.decks?.map(sub =>
                  sub.id === currentSubstack.substack.id
                    ? {
                        ...sub,
                        tasks: (() => {
                          const taskToMove = sub.cards.find(t => t.id === taskId);
                          if (!taskToMove) return sub.cards;
                          const otherTasks = sub.cards.filter(t => t.id !== taskId);
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
        const taskToMove = prev.substack.cards.find(t => t.id === taskId);
        if (!taskToMove) return prev;
        const otherTasks = prev.substack.cards.filter(t => t.id !== taskId);
        return {
          ...prev,
          substack: {
            ...prev.substack,
            tasks: [...otherTasks, taskToMove]
          }
        };
      });
      toast.info(t('toasts.substackTaskDeferred'));
    } else {
      const snapshot = snapshotTask(taskId);
      try {
        await getTaskStore().deferTask(taskId);
        toast.info(isDemoMode
          ? DemoService.getInstance().getDemoMessage('taskDeferred')
          : t('toasts.taskDeferred'), undoToastOptions(snapshot));
        refreshTasks();
      } catch (err) {
        console.error("Failed to defer task:", err);
        toast.error(t('toasts.deferFailed', { message: (err as Error).message }));
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
      await getTaskStore().createSubstack(taskId, name);
      toast.success(isDemoMode
        ? DemoService.getInstance().getDemoMessage('substackCreated')
        : t('toasts.substackCreated', { name }));
      
      // Refresh tasks to get the updated task with substacks
      await refreshTasks();
      
      // Close task details modal since we're refreshing
      setIsTaskDetailsOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to create substack in backend:", err);
      toast.error(t('toasts.substackCreateFailed', { message: (err as Error).message }));
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

  const currentTasks = currentSubstack ? currentSubstack.substack.cards : tasks;
  const activeTasks = currentTasks.filter(task => !task.completed);
  const completedTasks = currentTasks.filter(task => task.completed);

  const getCurrentSelectedTask = () => {
    if (!selectedTask) return null;
    if (currentSubstack) {
      return currentSubstack.substack.cards.find(task => task.id === selectedTask.id) || selectedTask;
    }
    return tasks.find(task => task.id === selectedTask.id) || selectedTask;
  };

  if (currentSubstack) {
    return (
      <div className="min-h-app-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <div className="w-full max-w-md mx-auto flex flex-col h-app-screen pt-[env(safe-area-inset-top)]">
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-app-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col"
      >
        <div className="w-full max-w-md mx-auto flex flex-col h-app-screen pt-[env(safe-area-inset-top)]">

          {/* Card Deck Experience - Single View */}
          <div className="flex flex-col flex-1">
            {currentView === 'main' && (
              <CardDeck
                tasks={activeTasks}
                loading={loading}
                error={error}
                onComplete={handleCompleteTask}
                onDefer={handleDeferTask}
                onCardClick={handleCardClick}
                onAddTask={handleAddTask}
                onViewCompleted={() => setCurrentView('completed')}
                onViewIntegrations={() => setCurrentView('integrate')}
                onViewSettings={() => setCurrentView('settings')}
              />
            )}
            
            {currentView === 'completed' && (
              <div className="flex flex-col flex-1">
                <div className="p-4">
                  <button 
                    onClick={() => setCurrentView('main')}
                    className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('nav.backToTasks')}
                  </button>
                </div>
                <CompletedTasks
                  tasks={completedTasks}
                  onUncomplete={getTaskStore().uncompleteTask ? handleUncompleteTask : undefined}
                />
              </div>
            )}
            
            {currentView === 'settings' && (
              <div className="flex flex-col flex-1">
                <div className="p-4">
                  <button
                    onClick={() => setCurrentView('main')}
                    className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('nav.backToTasks')}
                  </button>
                </div>
                <SettingsView onDataImported={refreshTasks} />
              </div>
            )}

            {currentView === 'integrate' && (
              <div className="flex flex-col flex-1">
                <div className="p-4">
                  <button 
                    onClick={() => setCurrentView('main')}
                    className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('nav.backToTasks')}
                  </button>
                </div>
                <TaskIntegration onImportTasks={handleImportTasks} />
              </div>
            )}
          </div>

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