
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
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
