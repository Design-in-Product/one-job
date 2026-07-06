// src/services/apiTaskStore.ts
// TaskStore backed by the FastAPI backend. Used only when a backend is
// explicitly configured (VITE_API_URL at build time, or ?remote in dev).

import { Task, InteriorDeck } from '@/types/task';
import { API_BASE_URL } from '@/config';
import type { TaskStore } from './taskStore';

// Convert the backend's snake_case task shape to the frontend Task interface
const mapTask = (t: any): Task => ({
  id: t.id,
  title: t.title,
  description: t.description,
  completed: t.completed,
  status: t.status,
  createdAt: new Date(t.created_at),
  completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
  deferredAt: t.deferred_at ? new Date(t.deferred_at) : undefined,
  deferralCount: t.deferral_count,
  sortOrder: t.sort_order,
  source: t.source,
  externalId: t.external_id,
  decks: (t.substacks || []).map(mapSubstack) // backend wire format is still v1 'substacks'
});

const mapSubstackTask = (t: any): Task => ({
  id: t.id,
  title: t.title,
  description: t.description,
  completed: t.completed,
  createdAt: new Date(t.created_at),
  completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
  sortOrder: t.sort_order
});

const mapSubstack = (s: any): InteriorDeck => ({
  id: s.id,
  name: s.name,
  createdAt: new Date(s.created_at),
  cards: (s.tasks || []).map(mapSubstackTask)
});

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    // Only JSON-bodied requests need the header; adding it to GETs
    // forces an unnecessary CORS preflight.
    ...(init?.body ? { headers: { 'Content-Type': 'application/json' } } : {}),
    ...init
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export class ApiTaskStore implements TaskStore {
  async getAllTasks(): Promise<Task[]> {
    const data = await request<any[]>('/tasks');
    return data.map(mapTask);
  }

  async createTask(title: string, description?: string): Promise<Task> {
    const data = await request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title, description })
    });
    return mapTask(data);
  }

  async updateTask(id: string, updates: { title?: string; description?: string }): Promise<Task> {
    const data = await request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return mapTask(data);
  }

  async completeTask(id: string): Promise<Task> {
    const data = await request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'done' })
    });
    return mapTask(data);
  }

  async deferTask(id: string): Promise<Task> {
    const data = await request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_deferral: true })
    });
    return mapTask(data);
  }

  async createSubstack(taskId: string, name: string | null): Promise<InteriorDeck> {
    const data = await request<any>(`/tasks/${taskId}/substacks`, {
      method: 'POST',
      body: JSON.stringify({ name: name ?? 'Sub-tasks' })
    });
    return mapSubstack(data);
  }

  async addSubstackTask(substackId: string, title: string, description?: string): Promise<Task> {
    const data = await request<any>(`/substacks/${substackId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title, description })
    });
    return mapSubstackTask(data);
  }

  async completeSubstackTask(id: string): Promise<Task> {
    const data = await request<any>(`/substack-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: true })
    });
    return mapSubstackTask(data);
  }

  async deferSubstackTask(id: string): Promise<Task> {
    const data = await request<any>(`/substack-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_deferral: true })
    });
    return mapSubstackTask(data);
  }
}
