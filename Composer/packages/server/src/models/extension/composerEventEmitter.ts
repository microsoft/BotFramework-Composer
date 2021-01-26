// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComposerEventHandlers,
  ComposerProjectEvent,
  Disposable,
  ComposerDialogEvent,
  ComposerEvent,
  EventListenerArgs,
  IBotProject,
  MicrosoftIDialog,
  EventListener,
} from '@bfc/shared';

import logger from '../../logger';

const log = logger.extend('events');

/**
 * Copied from ComposerEventHandlers
 */
export class ComposerEventEmitter implements ComposerEventHandlers {
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
        log(err);
      }
    }
  }

  on(event: ComposerProjectEvent, listener: EventListener<{ project: IBotProject }>): Disposable;
  on(event: ComposerDialogEvent, listener: EventListener<{ dialog: MicrosoftIDialog }>): Disposable;
  on(event: ComposerEvent, listener: EventListener<any>): Disposable {
    return ComposerEventEmitter.addListener(event, listener);
  }

  emit(event: ComposerProjectEvent, args: EventListenerArgs<{ project: IBotProject }>): Promise<void>;
  emit(event: ComposerDialogEvent, args: EventListenerArgs<{ dialog: MicrosoftIDialog }>): Promise<void>;
  async emit(event: ComposerEvent, args: EventListenerArgs) {
    await ComposerEventEmitter.emit(event, args);
  }
}
