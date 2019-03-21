import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

import { reducer } from './reducer';
import bindActions from './action/bindActions';
import * as actions from './action';

export const Store = React.createContext();

const initialState = {
  files: [],
  editors: [],
  storages: [],
  currentStorageFiles: [],
  botStatus: 'stopped',
<<<<<<< HEAD
  openFileIndex: -1,
=======
  openFileIndex: '-1',
  storageExplorerStatus: 'closed',
  currentStorage: { id: 'default' },
>>>>>>> add settings for storage explorer status
};

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const boundActions = bindActions(dispatch, actions);
  const value = { state, actions: boundActions, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}

StoreProvider.propTypes = {
  children: PropTypes.element,
};
