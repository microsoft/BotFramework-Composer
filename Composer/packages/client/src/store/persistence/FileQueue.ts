// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ResourceInfo, FileChangeType, IFileTask } from './types';

export default class FileQueue {
  private _tasks: IFileTask[] = [];

  public get tasks(): IFileTask[] {
    return this._tasks;
  }

  public push(files: ResourceInfo[], changeType: FileChangeType) {
    files.forEach(file => {
      const index = this._tasks.findIndex(e => e.file.name === file.name);
      const task = { file, changeType };
      if (~index) {
        this._tasks[index] = this._merge(this._tasks[index], task);
      } else {
        this._tasks.push(task);
      }
    });
  }

  public popList() {
    const list = [...this._tasks];
    this._tasks = [];
    return list;
  }

  private _merge(previous: IFileTask, current: IFileTask) {
    if (previous.changeType === FileChangeType.CREATE && current.changeType === FileChangeType.UPDATE) {
      current.changeType = FileChangeType.CREATE;
    }

    return current;
  }
}
