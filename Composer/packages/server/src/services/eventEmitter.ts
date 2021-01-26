// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Disposable, EventListener } from '@botframework-composer/types';

import logger from '../logger';

const log = logger.extend('events');

/**
 * AsyncEventEmitter will execute async event listeners serially. Useful for injecting mutations in response to events.
 */
export class AsyncEventEmitter {
  private static listeners: Record<string, EventListener[]> = {};

  public static addListener(event: string, listener: EventListener): Disposable {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(listener);

    return {
      dispose: () => this.removeListener(event, listener),
    };
  }

  public static removeListener(event: string, listener: EventListener) {
    const eventListeners = this.listeners[event];

    if (eventListeners && eventListeners.length > 0) {
      this.listeners[event] = eventListeners.filter((l) => l !== listener);
    }
  }

  public static on(event: string, listener: EventListener): Disposable {
    return this.addListener(event, listener);
  }

  public static async emit(event: string, ...args: unknown[]) {
    const listeners = this.listeners[event] ?? [];

    for (const l of listeners) {
      try {
        await l(...args);
      } catch (err) {
        log(err);
      }
    }
  }
}
