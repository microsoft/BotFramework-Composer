// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useReducer, useRef } from 'react';
import once from 'lodash/once';
import { ImportResolverDelegate, ImportResolver } from 'botbuilder-lg';

import { prepareAxios } from '../utils/auth';
import { getFileName, getBaseName } from '../utils/fileUtil';

import { reducer } from './reducer';
import bindActions from './action/bindActions';
import * as actions from './action';
import { CreationFlowStatus, BotStatus } from './../constants';
import { State, ActionHandlers, BoundActionHandlers, MiddlewareApi, MiddlewareFunc, StorageFolder } from './types';
import { undoActionsMiddleware } from './middlewares/undo';
import { ActionType } from './action/types';

const initialState: State = {
  dialogs: [],
  projectId: '',
  botName: '',
  location: '', // the path to the bot project
  botEnvironment: 'production',
  botEndpoints: {},
  remoteEndpoints: {},
  focusPath: '', // the data path for FormEditor
  recentProjects: [],
  templateProjects: [],
  storages: [],
  focusedStorageFolder: {} as StorageFolder,
  botStatus: BotStatus.unConnected,
  botLoadErrorMsg: '',
  creationFlowStatus: CreationFlowStatus.CLOSE,
  templateId: 'EmptyBot',
  storageFileLoadingStatus: 'success',
  lgFiles: [],
  schemas: { editor: {} },
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
  resolvers: { lgImportresolver: ImportResolverDelegate };
}

export const StoreContext = React.createContext<StoreContextValue>({
  state: initialState,
  dispatch: () => {},
  actions: {} as ActionHandlers,
  resolvers: { lgImportresolver: ImportResolver.fileResolver },
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
      lgImportresolver: function(_source: string, id: string) {
        const targetFileName = getFileName(id);
        const targetFileId = getBaseName(targetFileName);
        const targetFile = getState().lgFiles.find(({ id }) => id === targetFileId);
        if (!targetFile) throw new Error(`${id} lg file not found`);
        return { id, content: targetFile.content };
      } as ImportResolverDelegate,
    },
  };

  prepareAxiosWithStore({ dispatch, getState });

  return <StoreContext.Provider value={value}>{props.children}</StoreContext.Provider>;
};
