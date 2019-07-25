import { ActionTypes } from './../../constants/index';

export function navTo(dispatch, path, rest) {
  dispatch({
    type: ActionTypes.NAVIGATE_TO,
    payload: { path, rest },
  });
}

// this sub path is relative to the navPath
export function navDown(dispatch, subPath) {
  dispatch({
    type: ActionTypes.NAVIGATE_DOWN,
    payload: { subPath },
  });
}

// this sub path is relative to the navPath, not focusPath
// so new focusPath = navPath + subPath
export function focusTo(dispatch, path) {
  dispatch({
    type: ActionTypes.FOCUS_TO,
    payload: { path },
  });
}

export function clearNavHistory(dispatch, fromIndex) {
  dispatch({
    type: ActionTypes.CLEAR_NAV_HISTORY,
    payload: { fromIndex },
  });
}
