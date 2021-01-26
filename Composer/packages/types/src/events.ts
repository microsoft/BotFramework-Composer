// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject } from './project';
import { MicrosoftIDialog } from './sdk';

export type EventListener = (...args: unknown[]) => Promise<void> | void;
export type Disposable = {
  dispose: () => void;
};

export type ComposerProjectEvent = 'project:opened' | 'project:created';
export type ComposerDialogEvent = 'dialog:created' | 'dialog:opened';
export type ComposerEvent = ComposerProjectEvent | ComposerDialogEvent;

export type ProjectEventListener = (project: IBotProject) => Promise<void> | void;
export type DialogEventListener = (dialog: MicrosoftIDialog) => Promise<void> | void;

export type ComposerEventHandlers = {
  on(event: ComposerProjectEvent, listener: ProjectEventListener): Disposable;
  on(event: ComposerDialogEvent, listener: DialogEventListener): Disposable;
  on(event: ComposerEvent, listener: (...args: unknown[]) => void | Promise<void>): Disposable;

  emit(event: ComposerEvent, ...args: unknown[]): Promise<void>;
};
