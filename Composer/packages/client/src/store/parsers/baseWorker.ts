// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Wrapper class
export class BaseWorker {
  private worker: Worker;
  private resolves = {};
  private rejects = {};
  private globalMsgId = 0;

  constructor(worker: Worker) {
    this.worker = worker;
    this.worker.onmessage = this.handleMsg;
  }

  sendMsg = <T>(type: string, payload: T) => {
    const msgId = this.globalMsgId++;
    const msg = { id: msgId, type, payload };
    return new Promise((resolve, reject) => {
      // save callbacks for later
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      this.worker.postMessage(msg);
    });
  };

  // Handle incoming calculation result
  handleMsg = msg => {
    const { id, err, payload } = msg.data;
    if (payload) {
      const resolve = this.resolves[id];
      if (resolve) resolve(payload);
    } else {
      // error condition
      const reject = this.rejects[id];
      if (reject) {
        if (err) {
          reject(err);
        } else {
          reject('Got nothing');
        }
      }
    }

    // purge used callbacks
    delete this.resolves[id];
    delete this.rejects[id];
  };
}
