// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HandlerDependencies } from 'src/app/dispatcher/types';

export type UndoAction = ReturnType<typeof createUndoHandler>;

export const createUndoHandler = ({ dataStore }: HandlerDependencies) => {
  const undo = () => {
    if (dataStore.history.canUndo) {
      dataStore.history.undo();
    }
  };

  const redo = () => {
    if (dataStore.history.canRedo) {
      dataStore.history.redo();
    }
  };

  return { undo, redo };
};
