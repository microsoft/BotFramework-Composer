import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

import oauthStorage from '../utils/oauthStorage';

import { reducer } from './reducer';
import bindActions from './action/bindActions';
import * as actions from './action';
import { CreationFlowStatus } from './../constants';

export const Store = React.createContext();

const initialState = {
  dialogs: [],
  botName: '',
  navPath: '', // the data path for VisualEditor, based on `dialogs` which computed from files
  focusPath: '', // the data path for FormEditor
  navPathHistory: [],
  recentProjects: [],
  storages: [],
  focusedStorageFolder: {},
  botStatus: 'unConnected',
  botLoadErrorMsg: '',
  creationFlowStatus: CreationFlowStatus.CLOSE,
  templateId: '',
  storageFileLoadingStatus: 'success',
  lgFiles: [],
  schemas: {},
  luFiles: [],
  error: null, // a object with structure {summary: "", message: ""}
  oAuth: oauthStorage.get(),
  showCreateDialogModal: false,
};

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const boundActions = bindActions({ dispatch, state }, actions);
  const value = {
    state,
    actions: boundActions,
    dispatch,
  };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}

StoreProvider.propTypes = {
  children: PropTypes.element,
};
