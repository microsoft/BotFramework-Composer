import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants';

export const navTo: ActionCreator = ({ dispatch }, path, rest) => {
  dispatch({
    type: ActionTypes.NAVIGATE_TO,
    payload: { path, rest },
  });
};

// this sub path is relative to the navPath
export const navDown: ActionCreator = ({ dispatch }, subPath) => {
  dispatch({
    type: ActionTypes.NAVIGATE_DOWN,
    payload: { subPath },
  });
};

// this sub path is relative to the navPath, not focusPath
// so new focusPath = navPath + subPath
export const focusTo: ActionCreator = ({ dispatch }, path) => {
  dispatch({
    type: ActionTypes.FOCUS_TO,
    payload: { path },
  });
};

export const clearNavHistory: ActionCreator = ({ dispatch }, fromIndex) => {
  dispatch({
    type: ActionTypes.CLEAR_NAV_HISTORY,
    payload: { fromIndex },
  });
};
