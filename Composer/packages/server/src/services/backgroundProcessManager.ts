// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { v4 as uuid } from 'uuid';

export interface ProcessStatus {
  id: string;
  startTime: Date; // contains start time
  httpStatusCode: number; // contains http status code
  latestMessage: string; // contains latest message
  logs: string[]; // contains all messages
  comment?: string; // contains user supplied comment about process
  result?: any; // contains provision result
}

type ProcessList = Record<string, ProcessStatus>;

export class BackgroundProcessManager {
  static processes: ProcessList = {};

  static startProcess(initialStatus: number, processName: string, initialMessage?: string, comment?: string): string {
    const id = uuid();
    this.processes[id] = {
      id: id,
      startTime: new Date(),
      httpStatusCode: initialStatus,
      latestMessage: initialMessage || '',
      logs: [initialMessage || ''],
      comment: comment,
    };
    return id;
  }

  static getProcessStatus(id: string): ProcessStatus {
    return this.processes[id];
  }

  static updateProcess(id: string, status: number, message: string, result?: any) {
    if (this.processes[id]) {
      this.processes[id].httpStatusCode = status;
      this.processes[id].latestMessage = message;
      this.processes[id].logs.push(message);
      if (result) {
        this.processes[id].result = result;
      }
    }
  }

  static removeProcess(id: string) {
    delete this.processes[id];
  }
}
