/**
 * Task Queue System
 * 
 * This utility provides a background task queue for handling long-running operations
 * such as report generation and settlement calculations without blocking the UI.
 */

import { createLogger } from '@/core/utils/logger';

// Create a logger for this module
const logger = createLogger('TaskQueue');

// Task status enum
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Task priority levels
export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2
}

// Task interface
export interface Task<T = unknown, P = unknown> {
  id: string;
  type: string;
  payload: P;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  result?: T;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  userId: string;
}

// Task handler function type
export type TaskHandler<T = unknown> = (task: Task<T>) => Promise<T>;

// Task queue configuration
interface TaskQueueConfig {
  maxConcurrent: number;
  retryLimit: number;
  retryDelay: number;
}

// Default configuration
const DEFAULT_CONFIG: TaskQueueConfig = {
  maxConcurrent: 2,
  retryLimit: 3,
  retryDelay: 5000
};

// Task queue class
export class TaskQueue {
  private tasks: Map<string, Task> = new Map();
  private handlers: Map<string, TaskHandler> = new Map();
  private runningTasks: Set<string> = new Set();
  private config: TaskQueueConfig;
  private isProcessing: boolean = false;
  private listeners: Map<string, Set<(task: Task) => void>> = new Map();

  constructor(config: Partial<TaskQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a handler for a specific task type
   */
  registerHandler<T>(taskType: string, handler: TaskHandler<T>): void {
    this.handlers.set(taskType, handler as TaskHandler);
    logger.info(`Registered handler for task type: ${taskType}`);
  }

  /**
   * Enqueue a new task
   */
  async enqueue<T>(
    taskType: string,
    payload: any,
    userId: string,
    priority: TaskPriority = TaskPriority.NORMAL
  ): Promise<string> {
    if (!this.handlers.has(taskType)) {
      throw new Error(`No handler registered for task type: ${taskType}`);
    }

    const taskId = `${taskType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const task: Task<T> = {
      id: taskId,
      type: taskType,
      payload,
      status: TaskStatus.PENDING,
      priority,
      progress: 0,
      createdAt: new Date(),
      userId
    };

    this.tasks.set(taskId, task);
    logger.info(`Task enqueued: ${taskId} (type: ${taskType})`);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return taskId;
  }

  /**
   * Get a task by ID
   */
  getTask<T>(taskId: string): Task<T> | undefined {
    return this.tasks.get(taskId) as Task<T> | undefined;
  }

  /**
   * Get all tasks for a user
   */
  getUserTasks(userId: string): Task[] {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId);
  }

  /**
   * Cancel a pending task
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    
    if (!task || task.status !== TaskStatus.PENDING) {
      return false;
    }
    
    task.status = TaskStatus.CANCELLED;
    this.notifyTaskUpdate(task);
    logger.info(`Task cancelled: ${taskId}`);
    return true;
  }

  /**
   * Subscribe to task updates
   */
  subscribe(taskId: string, callback: (task: Task) => void): () => void {
    if (!this.listeners.has(taskId)) {
      this.listeners.set(taskId, new Set());
    }
    
    this.listeners.get(taskId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(taskId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(taskId);
        }
      }
    };
  }

  /**
   * Process the task queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    logger.info('Starting task queue processing');
    
    try {
      while (this.hasTasksToProcess()) {
        // Check if we can run more tasks
        if (this.runningTasks.size >= this.config.maxConcurrent) {
          // Wait for a running task to complete
          await new Promise<void>(resolve => {
            const checkInterval = setInterval(() => {
              if (this.runningTasks.size < this.config.maxConcurrent) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
          });
        }
        
        // Get the next task to process
        const nextTask = this.getNextTask();
        if (!nextTask) break;
        
        // Process the task
        this.runningTasks.add(nextTask.id);
        nextTask.status = TaskStatus.RUNNING;
        nextTask.startedAt = new Date();
        this.notifyTaskUpdate(nextTask);
        
        // Execute the task in the background
        this.executeTask(nextTask).catch(error => {
          logger.error(`Error executing task ${nextTask.id}:`, error);
        });
      }
    } finally {
      this.isProcessing = false;
      
      // If there are still tasks to process, restart the queue
      if (this.hasTasksToProcess()) {
        this.processQueue();
      }
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: Task): Promise<void> {
    const handler = this.handlers.get(task.type);
    
    if (!handler) {
      task.status = TaskStatus.FAILED;
      task.error = `No handler found for task type: ${task.type}`;
      this.runningTasks.delete(task.id);
      this.notifyTaskUpdate(task);
      return;
    }
    
    try {
      // Execute the handler
      const result = await handler(task);
      
      // Update task with result
      task.status = TaskStatus.COMPLETED;
      task.result = result;
      task.progress = 100;
      task.completedAt = new Date();
      logger.info(`Task completed: ${task.id}`);
    } catch (error) {
      // Handle task failure
      task.status = TaskStatus.FAILED;
      task.error = error instanceof Error ? error.message : String(error);
      logger.error(`Task failed: ${task.id}`, error);
    } finally {
      this.runningTasks.delete(task.id);
      this.notifyTaskUpdate(task);
    }
  }

  /**
   * Check if there are tasks to process
   */
  private hasTasksToProcess(): boolean {
    return Array.from(this.tasks.values()).some(
      task => task.status === TaskStatus.PENDING
    );
  }

  /**
   * Get the next task to process based on priority
   */
  private getNextTask(): Task | undefined {
    return Array.from(this.tasks.values())
      .filter(task => task.status === TaskStatus.PENDING)
      .sort((a, b) => {
        // Sort by priority (higher first)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // Then by creation time (older first)
        return a.createdAt.getTime() - b.createdAt.getTime();
      })[0];
  }

  /**
   * Notify listeners about task updates
   */
  private notifyTaskUpdate(task: Task): void {
    const listeners = this.listeners.get(task.id);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(task);
        } catch (error) {
          logger.error(`Error in task listener for ${task.id}:`, error);
        }
      });
    }
  }

  /**
   * Update task progress
   */
  updateTaskProgress(taskId: string, progress: number): void {
    const task = this.tasks.get(taskId);
    if (task && task.status === TaskStatus.RUNNING) {
      task.progress = Math.min(Math.max(0, progress), 99); // Cap at 99% until complete
      this.notifyTaskUpdate(task);
    }
  }

  /**
   * Clean up completed tasks older than the specified age
   */
  cleanupOldTasks(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [taskId, task] of this.tasks.entries()) {
      if (
        (task.status === TaskStatus.COMPLETED || 
         task.status === TaskStatus.FAILED ||
         task.status === TaskStatus.CANCELLED) &&
        task.completedAt &&
        now - task.completedAt.getTime() > maxAgeMs
      ) {
        this.tasks.delete(taskId);
        this.listeners.delete(taskId);
        logger.info(`Cleaned up old task: ${taskId}`);
      }
    }
  }
}

// Create a singleton instance
export const taskQueue = new TaskQueue();

// Export the singleton
export default taskQueue;