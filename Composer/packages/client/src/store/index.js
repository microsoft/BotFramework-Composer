import React, { useReducer } from 'react';
import { Map, List } from 'immutable';
import PropTypes from 'prop-types';

import { reducer } from './reducer';

export const Store = React.createContext();

const initialState = Map({
  files: List(),
});

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}

StoreProvider.propTypes = {
  children: PropTypes.element,
};
