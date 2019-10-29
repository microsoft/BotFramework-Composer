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
import React, { useReducer, useRef } from 'react';
import once from 'lodash.once';

import { prepareAxios } from '../utils/auth';
import { isAbsHosted } from '../utils/envUtil';

import { reducer } from './reducer';
import bindActions from './action/bindActions';
import * as actions from './action';
import { CreationFlowStatus, BotStatus } from './../constants';
import { State, ActionHandlers, BoundActionHandlers, MiddlewareApi, MiddlewareFunc } from './types';
import { undoActionsMiddleware } from './middlewares/undo';
import { ActionType } from './action/types';

const initialState: State = {
  dialogs: [],
  botName: '',
  location: '', // the path to the bot project
  botEnvironment: 'production',
  botEndpoint: '',
  remoteEndpoints: {},
  focusPath: '', // the data path for FormEditor
  recentProjects: [],
  templateProjects: [],
  storages: [],
  focusedStorageFolder: {},
  botStatus: BotStatus.unConnected,
  botLoadErrorMsg: '',
  creationFlowStatus: CreationFlowStatus.CLOSE,
  templateId: '',
  storageFileLoadingStatus: 'success',
  lgFiles: [],
  schemas: { editor: {} },
  luFiles: [],
  designPageLocation: {
    dialogId: '',
    focused: '',
    selected: '',
  },
  breadcrumb: [],
  error: null, // a object with structure {summary: "", message: ""}
  showCreateDialogModal: false,
  isEnvSettingUpdated: false,
  settings: {},
  toStartBot: false,
  currentUser: {
    token: null,
    sessionExpired: false,
  },
  publishVersions: {},
  publishStatus: 'inactive',
  lastPublishChange: null,
};

interface StoreContextValue {
  state: State;
  dispatch: React.Dispatch<ActionType>;
  actions: BoundActionHandlers;
}

export const StoreContext = React.createContext<StoreContextValue>({
  state: initialState,
  dispatch: () => {},
  actions: {} as ActionHandlers,
});

interface StoreProviderProps {
  children: React.ReactNode;
}

const prepareAxiosWithStore = once(prepareAxios);
export const applyMiddleware = (middlewareApi: MiddlewareApi, ...middlewares: MiddlewareFunc[]) => {
  const chain = middlewares.map(middleware => middleware(middlewareApi));
  const dispatch = chain.reduce((result, fun) => (...args) => result(fun(...args)))(middlewareApi.dispatch);
  return dispatch;
};

export const StoreProvider: React.FC<StoreProviderProps> = props => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef<State>(initialState);

  stateRef.current = state;
  const getState = () => {
    return stateRef.current;
  };

  const interceptDispatch = applyMiddleware({ dispatch, getState }, undoActionsMiddleware);
  // @ts-ignore some actions are not action creations and cannot be cast as such (e.g. textFromTemplates in lg.ts)
  const boundActions = bindActions({ dispatch: interceptDispatch, getState }, actions);
  const value = {
    state: getState(),
    actions: boundActions,
    dispatch: interceptDispatch,
  };

  prepareAxiosWithStore({ dispatch, getState });

  return <StoreContext.Provider value={value}>{props.children}</StoreContext.Provider>;
};
