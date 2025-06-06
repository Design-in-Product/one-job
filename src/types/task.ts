// src/types/task.ts
// 06-06-2025   Added sortOrder task

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  deferredAt?: Date;
  sortOrder?: number; // <--- ADDED THIS LINE
  source?: string;
  externalId?: string;
  substacks?: Substack[];
}

export interface Substack {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: Date;
}
