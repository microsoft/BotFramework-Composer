import { ActionTypes } from './../../constants/index';

export function navTo(dispatch, path, breadcrumb = []) {
  dispatch({
    type: ActionTypes.NAVIGATE_TO,
    payload: { path, breadcrumb },
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
export function focusTo(dispatch, subPath) {
  dispatch({
    type: ActionTypes.FOCUS_TO,
    payload: { subPath },
  });
}

export function clearNavHistory(dispatch, fromIndex) {
  dispatch({
    type: ActionTypes.CLEAR_NAV_HISTORY,
    payload: { fromIndex },
  });
}
