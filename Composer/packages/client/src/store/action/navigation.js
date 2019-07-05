import { ActionTypes, NavigationOrigin } from './../../constants/index';

export function navTo(dispatch, path, origin = NavigationOrigin.COMPOSER) {
  dispatch({
    type: ActionTypes.NAVIGATE_TO,
    payload: { path, origin },
  });
}

// this sub path is relative to the navPath
export function navDown(dispatch, subPath, origin = NavigationOrigin.COMPOSER) {
  dispatch({
    type: ActionTypes.NAVIGATE_DOWN,
    payload: { subPath, origin },
  });
}

// this sub path is relative to the navPath, not focusPath
// so new focusPath = navPath + subPath
export function focusTo(dispatch, path, origin = NavigationOrigin.COMPOSER) {
  dispatch({
    type: ActionTypes.FOCUS_TO,
    payload: { path, origin },
  });
}

export function clearNavHistory(dispatch, fromIndex) {
  dispatch({
    type: ActionTypes.CLEAR_NAV_HISTORY,
    payload: { fromIndex },
  });
}

export function setNavPathHistory(dispatch, navPathHistory) {
  dispatch({
    type: ActionTypes.SET_NAV_PATH_HISTORY,
    payload: { navPathHistory },
  });
}
