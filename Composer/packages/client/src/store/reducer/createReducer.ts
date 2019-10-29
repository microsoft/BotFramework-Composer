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
import producer from 'immer';

import { State, ReducerFunc } from '../types';
import { ActionType, GenericActionType } from '../action/types';

import { ActionTypes } from './../../constants';

type CreateReducerFunc = (
  handlers: { [type in ActionTypes]: ReducerFunc }
) => (state: State, action: ActionType) => State;

const createReducer: CreateReducerFunc = handlers => {
  // ensure action created is defined in constants/index.js#ActionTypes
  // when we switch to typescript, this is not need anymore.
  Object.keys(handlers).forEach(type => {
    if (ActionTypes.hasOwnProperty(type) === false) {
      throw new Error(`action created is not defined in constants/index.js#ActionTypes`);
    }
  });

  return (state, action) => {
    const { type, payload } = action as GenericActionType;

    // ensure action dispatched is defined in constants/index.js#ActionTypes
    if (ActionTypes.hasOwnProperty(type) === false) {
      throw new Error(`action dispatched is not defined in constants/index.js#ActionTypes`);
    }

    if (handlers.hasOwnProperty(type)) {
      return producer(state, nextState => {
        handlers[type](nextState, payload);
      });
    } else {
      return state;
    }
  };
};

export default createReducer;
