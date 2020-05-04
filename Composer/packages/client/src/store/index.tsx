// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useReducer, useRef } from 'react';
import once from 'lodash/once';
import { ImportResolverDelegate, TemplatesParser } from 'botbuilder-lg';
import { LgFile, LuFile, importResolverGenerator } from '@bfc/shared';

import { prepareAxios } from '../utils/auth';
import storage from '../utils/storage';

import { reducer } from './reducer';
import bindActions from './action/bindActions';
import * as actions from './action';
import { CreationFlowStatus, BotStatus, AppUpdaterStatus } from './../constants';
import {
  State,
  ActionHandlers,
  BoundActionHandlers,
  MiddlewareApi,
  MiddlewareFunc,
  StorageFolder,
  Store,
} from './types';
import { undoActionsMiddleware } from './middlewares/undo';
import { ActionType } from './action/types';
import filePersistence from './persistence/FilePersistence';

const { defaultFileResolver } = TemplatesParser;

const initialState: State = {
  dialogs: [],
  projectId: '',
  botName: '',
  location: '', // the path to the bot project
  botEnvironment: 'production',
  locale: 'en-us',
  botEndpoints: {},
  remoteEndpoints: {},
  focusPath: '', // the data path for PropertyEditor
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
  skills: [],
  skillManifests: [],
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
  showAddSkillDialogModal: false,
  isEnvSettingUpdated: false,
  settings: {},
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
  runtimeTemplates: [],
  publishHistory: {},
  userSettings: storage.get('userSettings', {
    codeEditor: {
      lineNumbers: false,
      wordWrap: false,
      minimap: false,
    },
    propertyEditorWidth: 400,
    dialogNavWidth: 180,
  }),
  runtimeSettings: {
    path: '',
    startCommand: '',
  },
  announcement: undefined,
  appUpdate: {
    progressPercent: 0,
    showing: false,
    status: AppUpdaterStatus.IDLE,
  },
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

export const applyMiddleware = (store: Store, ...middlewares: MiddlewareFunc[]) => {
  let dispatch: React.Dispatch<ActionType> = () => {};
  const middlewareApi: MiddlewareApi = {
    getState: store.getState,
    dispatch: (...args) => dispatch(...args),
  };
  const chain = middlewares.map(middleware => middleware(middlewareApi));
  dispatch = chain.reduce((result, fun) => (...args) => result(fun(...args)))(store.dispatch);
  return dispatch;
};

export const wrappedReducer = (state: State, action: ActionType) => {
  const currentState = reducer(state, action);
  filePersistence.notify(state, currentState, action);
  return currentState;
};

export const StoreProvider: React.FC<StoreProviderProps> = props => {
  const [state, dispatch] = useReducer(wrappedReducer, initialState);
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
  filePersistence.registerHandleError({ dispatch, getState });
  return <StoreContext.Provider value={value}>{props.children}</StoreContext.Provider>;
};
