/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { ActionTypes } from './../../../constants/index';
import { Store, ActionCreator, State } from './../../types';
import { ActionType } from './../../action/types';
import undoHistory from './history';

export type Pick = (state: State, args: any[], isStackEmpty: boolean) => any;

export const undoActionsMiddleware = (store: Store) => next => {
  return async (action: ActionType) => {
    if (action.type === ActionTypes.UNDO && undoHistory.canUndo()) {
      const undoStacks = undoHistory.undo();
      for (const stack of undoStacks) {
        await stack.undo(store);
      }
      return;
    } else if (action.type === ActionTypes.REDO && undoHistory.canRedo()) {
      const redoStacks = undoHistory.redo();
      for (const stack of redoStacks) {
        await stack.redo(store);
      }
      return;
    } else if (action.type === ActionTypes.HISTORY_CLEAR) {
      undoHistory.clear();
      return;
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
