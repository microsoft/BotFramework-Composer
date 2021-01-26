// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject } from './project';
import { MicrosoftIDialog } from './sdk';
import { UserIdentity } from './user';

export type EventListenerArgs<Args extends Record<string, unknown> = Record<string, unknown>> = Args & {
  user?: UserIdentity;
};

export type EventListener<T extends Record<string, unknown> = Record<string, unknown>> = (
  args: EventListenerArgs<T>
) => Promise<void> | void;
export type Disposable = {
  dispose: () => void;
};

export type ComposerProjectEvent = 'project:opened' | 'project:created';
export type ComposerDialogEvent = 'dialog:created' | 'dialog:opened';
export type ComposerEvent = ComposerProjectEvent | ComposerDialogEvent;

export type ComposerEventHandlers = {
  on(event: ComposerProjectEvent, listener: EventListener<{ project: IBotProject }>): Disposable;
  on(event: ComposerDialogEvent, listener: EventListener<{ dialog: MicrosoftIDialog }>): Disposable;
  on(event: ComposerEvent, listener: EventListener): Disposable;

  emit(event: ComposerProjectEvent, args: EventListenerArgs<{ project: IBotProject }>): Promise<void>;
  emit(event: ComposerDialogEvent, args: EventListenerArgs<{ dialog: MicrosoftIDialog }>): Promise<void>;
  emit(event: ComposerEvent, args: EventListenerArgs): Promise<void>;
};
