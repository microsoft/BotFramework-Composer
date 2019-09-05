import React, { useReducer } from 'react';
import { once } from 'lodash';

import oauthStorage from '../utils/oauthStorage';
import { prepareAxios } from '../utils/auth';

import { reducer } from './reducer';
import bindActions from './action/bindActions';
import * as actions from './action';
import { CreationFlowStatus, BotStatus } from './../constants';
import { State, ActionHandlers, BoundActionHandlers } from './types';
import { ActionType } from './action/types';

const initialState: State = {
  dialogs: [],
  botName: '',
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
  schemas: {},
  luFiles: [],
  designPageLocation: {
    dialogId: '',
    uri: '',
    focusedEvent: '',
    focusedSteps: [],
  },
  breadcrumb: [],
  error: null, // a object with structure {summary: "", message: ""}
  oAuth: oauthStorage.get(),
  showCreateDialogModal: false,
  toStartBot: false,
  currentUser: {
    token: null,
    sessionExpired: false,
  },
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

export const StoreProvider: React.FC<StoreProviderProps> = props => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // @ts-ignore some actions are not action creators and cannot be cast as such (e.g. textFromTemplates in lg.ts)
  const boundActions = bindActions({ dispatch, state }, actions);
  const value = {
    state,
    actions: boundActions,
    dispatch,
  };

  prepareAxiosWithStore({ dispatch, state });

  return <StoreContext.Provider value={value}>{props.children}</StoreContext.Provider>;
};
