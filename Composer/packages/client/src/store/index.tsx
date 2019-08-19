import React, { useReducer } from 'react';

import { reducer } from './reducer';
import bindActions from './action/bindActions';
import * as actions from './action';
import { CreationFlowStatus, BotStatus } from './../constants';
import { State, ActionType, ActionHandlers, BoundActionHandlers } from './types';

const initialState: State = {
  dialogs: [],
  botName: '',
  focusPath: '', // the data path for FormEditor
  recentProjects: [],
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
  showCreateDialogModal: false,
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
  children: React.ReactChildren;
}

export const StoreProvider: React.FC<StoreProviderProps> = props => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // @ts-ignore some actions are not action creations and cannot be cast as such (e.g. textFromTemplates in lg.ts)
  const boundActions = bindActions({ dispatch, state }, actions);
  const value = {
    state,
    actions: boundActions,
    dispatch,
  };

  return <StoreContext.Provider value={value}>{props.children}</StoreContext.Provider>;
};
