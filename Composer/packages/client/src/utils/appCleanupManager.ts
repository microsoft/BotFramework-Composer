// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

type TaskCleanupHandler = () => Promise<void> | void;
type Task = {
  cleanupHandler: TaskCleanupHandler;
  taskId: string;
};

class AppCleanupManager {
  taskStack: Task[] = [];
  _taskId = 0;

  // registers a task and its cleanup handler for when the app quits
  public registerTask(cleanupHandler: TaskCleanupHandler): string {
    const taskId = `appCleanupManagerTask_${this._taskId++}`;
    this.taskStack.push({ cleanupHandler, taskId });
    return taskId;
  }

  // unregisters a task -- letting the app know it doesn't need to do anything when it quits
  public unregisterTask(taskId: string): void {
    this.taskStack = this.taskStack.filter((task) => task.taskId !== taskId);
  }

  // cleans up all remaining registered tasks before returning
  public async cleanUpTasks(): Promise<void> {
    while (this.taskStack.length > 0) {
      const task = this.taskStack.pop();
      if (task) {
        await task.cleanupHandler();
      }
    }
  }
}

export const appCleanupManager = new AppCleanupManager();
