// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import uniqueId from 'lodash/uniqueId';

// Wrapper class
export class BaseWorker {
  private worker: Worker;
  private resolves = {};
  private rejects = {};

  constructor(worker: Worker) {
    this.worker = worker;
    this.worker.onmessage = this.handleMsg;
  }

  sendMsg = <Payload>(payload: Payload) => {
    const msgId = uniqueId();
    const msg = { id: msgId, payload };
    return new Promise((resolve, reject) => {
      // save callbacks for later
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      this.worker.postMessage(msg);
    });
  };

  // Handle incoming calculation result
  handleMsg = msg => {
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
  };

  isEmpty = () => {
    return !Object.keys(this.resolves).length;
  };
}
