import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

import { reducer } from './reducer';
import bindActions from './action/bindActions';
import * as actions from './action';

export const Store = React.createContext();

const initialState = {
  files: [],
  editors: [],
  botStatus: 'stopped',
  openFileIndex: -1,
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
