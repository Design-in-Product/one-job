import { Task, Substack } from '@/types/task';
import { mockTasks, getRandomDemoMessage } from '@/data/mockTasks';
import { v4 as uuidv4 } from 'uuid';

const DEMO_STORAGE_KEY = 'oneJobDemoTasks';

// Demo service that mimics API calls with localStorage
export class DemoService {
  private static instance: DemoService;
  private tasks: Task[] = [];

  private constructor() {
    this.initializeTasks();
  }

  static getInstance(): DemoService {
    if (!DemoService.instance) {
      DemoService.instance = new DemoService();
    }
    return DemoService.instance;
  }

  private initializeTasks() {
    const savedTasks = localStorage.getItem(DEMO_STORAGE_KEY);
    if (savedTasks) {
      try {
        this.tasks = JSON.parse(savedTasks);
        // Convert date strings back to Date objects
        this.tasks.forEach(task => {
          task.createdAt = new Date(task.createdAt);
          if (task.completedAt) task.completedAt = new Date(task.completedAt);
          if (task.deferredAt) task.deferredAt = new Date(task.deferredAt);
        });
      } catch (e) {
        console.warn('Failed to load demo tasks from localStorage, using defaults');
        this.tasks = [...mockTasks];
        this.saveTasks();
      }
    } else {
      this.tasks = [...mockTasks];
      this.saveTasks();
    }
  }

  private saveTasks() {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(this.tasks));
  }

  private sortTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      // First sort by completion status (todo first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // If both are todo, sort by sortOrder
      if (!a.completed && !b.completed) {
        return a.sortOrder - b.sortOrder;
      }
      
      // If both are completed, sort by completion date (most recent first)
      if (a.completed && b.completed) {
        const aDate = a.completedAt?.getTime() || 0;
        const bDate = b.completedAt?.getTime() || 0;
        return bDate - aDate;
      }
      
      return 0;
    });
  }

  // Simulate API delay
  private async delay(ms: number = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAllTasks(): Promise<Task[]> {
    await this.delay();
    return this.sortTasks([...this.tasks]);
  }

  async createTask(title: string, description: string): Promise<Task> {
    await this.delay();
    
    const activeTasks = this.tasks.filter(t => !t.completed);
    const maxSortOrder = activeTasks.length > 0 ? Math.max(...activeTasks.map(t => t.sortOrder)) : 0;
    
    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      status: 'todo',
      createdAt: new Date(),
      sortOrder: maxSortOrder + 1,
      source: 'Demo',
      substacks: []
    };

    this.tasks.push(newTask);
    this.saveTasks();
    
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await this.delay();
    
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const task = this.tasks[taskIndex];
    
    // Handle completion
    if (updates.completed !== undefined && updates.completed !== task.completed) {
      if (updates.completed) {
        updates.completedAt = new Date();
        updates.status = 'done';
      } else {
        updates.completedAt = undefined;
        updates.status = 'todo';
      }
    }

    // Handle deferral
    if (updates.status === 'todo' && !updates.completed && updates.sortOrder === undefined) {
      // This is a deferral - move to end
      const activeTasks = this.tasks.filter(t => !t.completed && t.id !== id);
      const maxSortOrder = activeTasks.length > 0 ? Math.max(...activeTasks.map(t => t.sortOrder)) : 0;
      updates.sortOrder = maxSortOrder + 1;
      updates.deferredAt = new Date();
      updates.deferralCount = (task.deferralCount || 0) + 1;
    }

    this.tasks[taskIndex] = { ...task, ...updates };
    this.saveTasks();
    
    return this.tasks[taskIndex];
  }

  async deleteTask(id: string): Promise<void> {
    await this.delay();
    
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
  }

  async createSubstack(taskId: string, name: string): Promise<Substack> {
    await this.delay();
    
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const newSubstack: Substack = {
      id: uuidv4(),
      name,
      tasks: []
    };

    if (!task.substacks) {
      task.substacks = [];
    }
    task.substacks.push(newSubstack);
    
    this.saveTasks();
    return newSubstack;
  }

  async addSubstackTask(substackId: string, title: string, description: string): Promise<any> {
    await this.delay();
    
    for (const task of this.tasks) {
      if (task.substacks) {
        const substack = task.substacks.find(s => s.id === substackId);
        if (substack) {
          const newSubstackTask = {
            id: uuidv4(),
            title,
            description,
            completed: false,
            createdAt: new Date(),
            sortOrder: substack.tasks.length + 1
          };
          
          substack.tasks.push(newSubstackTask);
          this.saveTasks();
          return newSubstackTask;
        }
      }
    }
    
    throw new Error('Substack not found');
  }

  async updateSubstackTask(taskId: string, updates: any): Promise<any> {
    await this.delay();
    
    for (const task of this.tasks) {
      if (task.substacks) {
        for (const substack of task.substacks) {
          const substackTaskIndex = substack.tasks.findIndex(st => st.id === taskId);
          if (substackTaskIndex !== -1) {
            substack.tasks[substackTaskIndex] = { ...substack.tasks[substackTaskIndex], ...updates };
            this.saveTasks();
            return substack.tasks[substackTaskIndex];
          }
        }
      }
    }
    
    throw new Error('Substack task not found');
  }

  // Reset demo to initial state
  resetDemo(): void {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    this.tasks = [...mockTasks];
    this.saveTasks();
  }

  // Get demo message for user feedback
  getDemoMessage(type: 'taskCompleted' | 'taskDeferred' | 'taskAdded' | 'substackCreated'): string {
    return getRandomDemoMessage(type);
  }
}