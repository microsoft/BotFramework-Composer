import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

import { reducer } from './reducer';
import actionsBinder from './action/actionsBinder';

export const Store = React.createContext();

const initialState = {
  files: [],
  editors: [],
  botStatus: 'stopped',
  openFileIndex: '-1',
};

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const bindActions = actionsBinder(dispatch);
  const value = { state, bindActions, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}

StoreProvider.propTypes = {
  children: PropTypes.element,
};
