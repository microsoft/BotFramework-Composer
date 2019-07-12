import producer from 'immer';

import { ActionTypes } from './../../constants/index';

const createReducer = handlers => {
  // ensure action created is defined in constants/index.js#ActionTypes
  // when we switch to typescript, this is not need anymore.
  Object.keys(handlers).forEach(type => {
    if (ActionTypes.hasOwnProperty(type) === false) {
      throw new Error(`action created is not defined in constants/index.js#ActionTypes`);
    }
  });
  return (state, action) => {
    const { type, payload, error } = action;

    // ensure action dispatched is defined in constants/index.js#ActionTypes
    if (ActionTypes.hasOwnProperty(type) === false) {
      throw new Error(`action dispatched is not defined in constants/index.js#ActionTypes`);
    }

    if (handlers.hasOwnProperty(type)) {
      return producer(state, nextState => {
        handlers[type](nextState, payload, error ? error : null);
      });
    } else {
      return state;
    }
  };
};

export default createReducer;
