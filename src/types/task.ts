// src/types/task.ts
// 06-06-2025   Added sortOrder task

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  /** Backend-assigned ('todo' | 'done'); absent on client-created tasks until persisted */
  status?: string;
  createdAt: Date;
  completedAt?: Date;
  deferredAt?: Date;
  deferralCount?: number;
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
