import { ActionTypes } from './../../constants/index';

export function navTo(dispatch, path) {
  dispatch({
    type: ActionTypes.NAVIGATE_TO,
    payload: { path },
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

export function updateNavPathItems(dispatch, path, name) {
  dispatch({
    type: ActionTypes.NAVPATHITEMS_UPDATE,
    payload: { path, name },
  });
}
