// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import uniqueId from 'lodash/uniqueId';

interface WorkerMsg {
  data: {
    id: string;
    error?: any;
    payload?: any;
  };
}

// Wrapper class
export class BaseWorker<ActionType> {
  private worker: Worker;
  private resolves = {};
  private rejects = {};

  constructor(worker: Worker) {
    this.worker = worker;
    this.worker.onmessage = this.handleMsg.bind(this);
  }

  public sendMsg<Payload>(type: ActionType, payload: Payload) {
    const msgId = uniqueId();
    const msg = { id: msgId, type, payload };
    return new Promise((resolve, reject) => {
      // save callbacks for later
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      this.worker.postMessage(msg);
    });
  }

  // Handle incoming calculation result
  public handleMsg(msg: WorkerMsg) {
    const { id, error, payload } = msg.data;
    if (error) {
      const reject = this.rejects[id];
      reject(error);
    } else {
      const resolve = this.resolves[id];
      if (resolve) resolve(payload);
    }

    // purge used callbacks
    delete this.resolves[id];
    delete this.rejects[id];
  }

  public async flush(): Promise<boolean> {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (this.isEmpty()) {
          clearInterval(timer);
          resolve(true);
        }
      }, 100);
    });
  }

  public isEmpty() {
    return !Object.keys(this.resolves).length;
  }
}
