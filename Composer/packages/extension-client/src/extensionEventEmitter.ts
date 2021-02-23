// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

type EventListenerArgs<Args extends Record<string, unknown> = Record<string, unknown>> = Args;

type EventListener<T extends Record<string, unknown> = Record<string, unknown>> = (
  args: EventListenerArgs<T>
) => Promise<void> | void;

type Disposable = {
  dispose: () => void;
};

class ComposerEventEmitter {
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

  public static async emit(event: string, args: EventListenerArgs) {
    const listeners = this.listeners[event] ?? [];

    for (const l of listeners) {
      try {
        await l(args);
      } catch (err) {
        console.error(err);
      }
    }
  }

  on(event: string, listener: EventListener<any>): Disposable {
    return ComposerEventEmitter.addListener(event, listener);
  }

  async emit(event: string, args: EventListenerArgs) {
    await ComposerEventEmitter.emit(event, args);
  }
}

export const extensionEventEmitter = new ComposerEventEmitter();
