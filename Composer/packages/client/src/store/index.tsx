// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useReducer, useRef } from 'react';
import once from 'lodash/once';
import { ImportResolverDelegate, LGParser } from 'botbuilder-lg';
import { LgFile, LuFile, importResolverGenerator } from '@bfc/shared';

import { prepareAxios } from '../utils/auth';

import { reducer } from './reducer';
import bindActions from './action/bindActions';
import * as actions from './action';
import { CreationFlowStatus, BotStatus } from './../constants';
import { State, ActionHandlers, BoundActionHandlers, MiddlewareApi, MiddlewareFunc, StorageFolder } from './types';
import { undoActionsMiddleware } from './middlewares/undo';
import { ActionType } from './action/types';

const { defaultFileResolver } = LGParser;

const initialState: State = {
  dialogs: [],
  projectId: '',
  botName: '',
  location: '', // the path to the bot project
  botEnvironment: 'production',
  locale: 'en-us',
  botEndpoints: {},
  remoteEndpoints: {},
  focusPath: '', // the data path for FormEditor
  recentProjects: [],
  templateProjects: [],
  storages: [],
  focusedStorageFolder: {} as StorageFolder,
  botStatus: BotStatus.unConnected,
  botLoadErrorMsg: { title: '', message: '' },
  creationFlowStatus: CreationFlowStatus.CLOSE,
  templateId: 'EmptyBot',
  storageFileLoadingStatus: 'success',
  lgFiles: [],
  schemas: {},
  luFiles: [],
  actionsSeed: [],
  designPageLocation: {
    projectId: '',
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
  publishTypes: [],
  publishTargets: [],
};

interface StoreContextValue {
  state: State;
  dispatch: React.Dispatch<ActionType>;
  actions: BoundActionHandlers;
  resolvers: {
    lgImportresolver: ImportResolverDelegate;
    lgFileResolver: (id: string) => LgFile | undefined;
    luFileResolver: (id: string) => LuFile | undefined;
  };
}

export const StoreContext = React.createContext<StoreContextValue>({
  state: initialState,
  dispatch: () => {},
  actions: {} as ActionHandlers,
  resolvers: {
    lgImportresolver: defaultFileResolver,
    lgFileResolver: () => undefined,
    luFileResolver: () => undefined,
  },
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
    resolvers: {
      lgImportresolver: importResolverGenerator(getState().lgFiles, '.lg'),
      lgFileResolver: function(id: string) {
        const state = getState();
        const { locale, lgFiles } = state;
        const fileId = id.includes('.') ? id : `${id}.${locale}`;
        return lgFiles.find(({ id }) => id === fileId);
      },
      luFileResolver: function(id: string) {
        const state = getState();
        const { locale, luFiles } = state;
        const fileId = id.includes('.') ? id : `${id}.${locale}`;
        return luFiles.find(({ id }) => id === fileId);
      },
    },
  };

  prepareAxiosWithStore({ dispatch, getState });

  return <StoreContext.Provider value={value}>{props.children}</StoreContext.Provider>;
};
