// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export default class Timer {
  timerId: NodeJS.Timeout;
  start: number;
  remaining: number;
  pausing = false;
  callback: () => void;

  constructor(callback: () => void, delay: number) {
    this.remaining = delay;
    this.callback = callback;
    this.start = Date.now();
    this.timerId = setTimeout(callback, this.remaining);
  }

  pause() {
    if (!this.pausing) {
      clearTimeout(this.timerId);
      this.remaining -= Date.now() - this.start;
      this.pausing = true;
    }
  }

  resume() {
    this.pausing = false;
    this.start = Date.now();
    clearTimeout(this.timerId);
    this.timerId = setTimeout(this.callback, this.remaining);
  }

  clear() {
    clearTimeout(this.timerId);
  }
}
