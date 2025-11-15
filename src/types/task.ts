// src/types/task.ts
// 06-06-2025   Added sortOrder task
// 11-15-2025   Added hierarchy fields for unified recursive model

// Project type (NEW for unified recursive architecture)
export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  integrationType?: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  taskCount: number;
  completedCount: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  deferredAt?: Date;
  sortOrder?: number;
  source?: string;
  externalId?: string;

  // NEW: Recursive hierarchy fields
  parentId?: string;
  projectId: string;
  depth: number;
  path?: string;
  hasChildren: boolean;
  children?: Task[];

  // OLD: Keep substacks for backward compatibility during transition
  substacks?: Substack[];
}

export interface Substack {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: Date;
}
