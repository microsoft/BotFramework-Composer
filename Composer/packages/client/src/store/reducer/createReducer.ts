// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import producer from 'immer';

import { State, ReducerFunc } from '../types';
import { ActionType, GenericActionType } from '../action/types';
import { ActionTypes } from '../../constants';

type CreateReducerFunc = (
  handlers: {
    [type in Exclude<ActionTypes, ActionTypes.UNDO | ActionTypes.REDO | ActionTypes.HISTORY_CLEAR>]: ReducerFunc;
  }
) => (state: State, action: ActionType) => State;

const createReducer: CreateReducerFunc = (handlers) => {
  // ensure action created is defined in constants/index.js#ActionTypes
  // when we switch to typescript, this is not need anymore.
  Object.keys(handlers).forEach((type) => {
    if (Object.prototype.hasOwnProperty.call(ActionTypes, type) === false) {
      throw new Error(`action created is not defined in constants/index.js#ActionTypes`);
    }
  });

  return (state, action) => {
    const { type, payload } = action as GenericActionType;

    // ensure action dispatched is defined in constants/index.js#ActionTypes
    if (Object.prototype.hasOwnProperty.call(ActionTypes, type) === false) {
      throw new Error(`action dispatched is not defined in constants/index.js#ActionTypes`);
    }

    if (Object.prototype.hasOwnProperty.call(handlers, type)) {
      return producer(state, (nextState) => {
        handlers[type](nextState, payload);
      });
    } else {
      return state;
    }
  };
};

export default createReducer;
