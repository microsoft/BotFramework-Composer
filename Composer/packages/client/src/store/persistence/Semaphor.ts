// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

class Semaphore {
  // private data shared among all instances
  private static sharedPromise: Promise<any> = Promise.resolve();
  private newPromise: Promise<void>;
  private resolver: any;
  private priorP = Semaphore.sharedPromise;

  constructor() {
    // create our promise (to be resolved later)
    this.newPromise = new Promise(resolve => {
      this.resolver = resolve;
    });

    // chain our position onto the sharedPromise to force serialization
    // of semaphores based on when the constructor is called
    Semaphore.sharedPromise = Semaphore.sharedPromise.then(() => {
      return this.newPromise;
    });
  }

  // allow caller to wait on prior promise for its turn in the chain
  public start() {
    return this.priorP;
  }

  // finish our promise to enable next caller in the chain to get notified
  public end() {
    this.resolver();
  }
}

export default Semaphore;
