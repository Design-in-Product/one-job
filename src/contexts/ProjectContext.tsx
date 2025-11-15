/**
 * ProjectContext - State management for projects and task navigation
 *
 * Implements the zoom navigation model (push/pop stack metaphor) for
 * hierarchical task exploration.
 *
 * Created: 2025-11-15 for unified recursive model
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Project, Task } from '@/types/task';

interface TaskStackLevel {
  tasks: Task[];
  parentTask?: Task;  // The task that was "zoomed into" to show these tasks
}

interface ProjectContextType {
  // Current project
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;

  // Task navigation stack (zoom model)
  taskStack: TaskStackLevel[];
  currentDepth: number;
  currentTasks: Task[];
  breadcrumb: Task[];  // Path to current location

  // Stack operations
  pushTaskLevel: (parentTask: Task, childTasks: Task[]) => void;
  popTaskLevel: () => void;
  resetToRoot: (rootTasks: Task[]) => void;
  updateCurrentTasks: (tasks: Task[]) => void;

  // Helper
  isAtRoot: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskStack, setTaskStack] = useState<TaskStackLevel[]>([]);

  // Computed values
  const currentDepth = taskStack.length - 1;
  const currentTasks = taskStack[taskStack.length - 1]?.tasks || [];
  const isAtRoot = taskStack.length <= 1;

  // Build breadcrumb from task stack
  const breadcrumb: Task[] = taskStack
    .slice(0, -1)  // Exclude current level
    .map(level => level.parentTask)
    .filter((task): task is Task => task !== undefined);

  /**
   * Push a new level onto the stack (zoom into a task's children)
   */
  const pushTaskLevel = useCallback((parentTask: Task, childTasks: Task[]) => {
    setTaskStack(prev => [...prev, { tasks: childTasks, parentTask }]);
  }, []);

  /**
   * Pop the top level from the stack (zoom out to parent)
   */
  const popTaskLevel = useCallback(() => {
    setTaskStack(prev => {
      if (prev.length <= 1) return prev;  // Can't pop root level
      return prev.slice(0, -1);
    });
  }, []);

  /**
   * Reset to root level with new tasks
   */
  const resetToRoot = useCallback((rootTasks: Task[]) => {
    setTaskStack([{ tasks: rootTasks }]);
  }, []);

  /**
   * Update tasks at current level (e.g., after completing a task)
   */
  const updateCurrentTasks = useCallback((tasks: Task[]) => {
    setTaskStack(prev => {
      if (prev.length === 0) return [{ tasks }];

      const newStack = [...prev];
      newStack[newStack.length - 1] = {
        ...newStack[newStack.length - 1],
        tasks
      };
      return newStack;
    });
  }, []);

  const value: ProjectContextType = {
    currentProject,
    projects,
    setCurrentProject,
    setProjects,
    taskStack,
    currentDepth,
    currentTasks,
    breadcrumb,
    pushTaskLevel,
    popTaskLevel,
    resetToRoot,
    updateCurrentTasks,
    isAtRoot
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
