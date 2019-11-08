// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useReducer, useRef } from 'react';
import once from 'lodash.once';

import { prepareAxios } from '../utils/auth';

import { reducer } from './reducer';
import bindActions from './action/bindActions';
import * as actions from './action';
import { CreationFlowStatus, BotStatus } from './../constants';
import { State, ActionHandlers, BoundActionHandlers, MiddlewareApi, MiddlewareFunc, StorageFolder } from './types';
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
  focusedStorageFolder: {} as StorageFolder,
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
  visualEditorSelection: [],
  onboarding: {
    complete: true,
    coachMarkRefs: {},
  },
  clipboardActions: [],
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
  // @ts-ignore some actions are not action creators and cannot be cast as such (e.g. textFromTemplates in lg.ts)
  const boundActions = bindActions({ dispatch: interceptDispatch, getState }, actions);
  const value = {
    state: getState(),
    actions: boundActions,
    dispatch: interceptDispatch,
  };

  prepareAxiosWithStore({ dispatch, getState });

  return <StoreContext.Provider value={value}>{props.children}</StoreContext.Provider>;
};
