// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionTypes } from '../../../constants';

import { Store, ActionCreator, State } from './../../types';
import { ActionType } from './../../action/types';
import undoHistory from './history';

export type Pick = (state: State, args: any[], isStackEmpty: boolean) => any;

export const undoActionsMiddleware = (store: Store) => (next) => {
  return async (action: ActionType) => {
    if (action.type === ActionTypes.UNDO && undoHistory.canUndo()) {
      const undoStacks = undoHistory.undo();
      for (const stack of undoStacks) {
        await stack.undo(store);
      }
    } else if (action.type === ActionTypes.REDO && undoHistory.canRedo()) {
      const redoStacks = undoHistory.redo();
      for (const stack of redoStacks) {
        await stack.redo(store);
      }
    } else if (action.type === ActionTypes.HISTORY_CLEAR) {
      undoHistory.clear();
    }
    return next(action);
  };
};

export const undoable = (
  actionCreate: ActionCreator,
  pick: Pick,
  undo: ActionCreator,
  redo: ActionCreator
): ActionCreator => {
  const stack = undoHistory.createStack(undo, redo);

  return (store: Store, ...args: any[]) => {
    //operatioId is used to sign the same state actions as user action.
    const operationId = undefined;
    if (stack.isEmpty()) {
      const partialState = pick(store.getState(), args, true);
      stack.add(partialState);
    }
    const partialState = pick(store.getState(), args, false);
    stack.add(partialState);
    undoHistory.add(stack.id, operationId);
    return actionCreate(store, ...args);
  };
};

export { undoHistory };
