// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { v4 as uuid } from 'uuid';

export interface ProcessStatus {
  id: string;
  time: Date; // contains start time
  status: number; // contains http status code
  message: string; // contains latest message
  log: string[]; // contains all messages
  comment?: string; // contains user supplied comment about process
  result?: any; // contains provision result
}

interface ProcessList {
  [key: string]: ProcessStatus;
}

export class BackgroundProcessManager {
  static processes: ProcessList = {};

  static startProcess(initialStatus: number, processName: string, initialMessage?: string, comment?: string): string {
    const id = uuid();
    this.processes[id] = {
      id: id,
      time: new Date(),
      status: initialStatus,
      message: initialMessage ? initialMessage : '',
      log: [initialMessage ? initialMessage : ''],
      comment: comment,
    };
    return id;
  }

  static getStatus(id: string): ProcessStatus {
    return this.processes[id];
  }

  static updateProcess(id: string, status: number, message: string, result = undefined): string {
    this.processes[id].status = status;
    this.processes[id].message = message;
    this.processes[id].log.push(message);
    if (result) {
      this.processes[id].result = result;
    }
    return id;
  }

  static removeProcess(id: string) {
    delete this.processes[id];
  }
}
