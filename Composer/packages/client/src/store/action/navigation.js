import { navigate } from '@reach/router';
import { replace } from 'lodash';

import { ActionTypes } from '../../constants/index';

export function setDesignPath({ dispatch }, { dialogId, navPath, focused, uri, navPathHistory }) {
  dispatch({
    type: ActionTypes.SET_DESIGN_PATH,
    payload: { dialogId, navPath, focused, uri, navPathHistory },
  });
}

export function navTo({ dispatch }, path, rest) {
  if (!path) return;

  const realPath = replace(path, '#.', '#');
  const items = realPath.split('#');

  let uri = `/dialogs/${items[0]}/`;
  if (items[1]) {
    uri = uri + items[1];
  }

  navigate(uri);
  dispatch({
    type: ActionTypes.NAVIGATE_TO,
    payload: { path, rest },
  });
}

export function navDown({ dispatch, state }, subPath) {
  if (!subPath) return;

  const { uri, dataPath } = state;
  let currentUri = uri;

  if (!dataPath) {
    currentUri += subPath;
  } else {
    currentUri = currentUri + '/' + subPath.split('.')[1];
  }
  navigate(currentUri);

  dispatch({
    type: ActionTypes.NAVIGATE_DOWN,
    payload: { subPath },
  });
}

export function focusTo({ dispatch, state }, subPath, fromForm) {
  const { navPath, focusPath, designPath } = state;
  const { focused, uri } = designPath;
  let currentUri = uri;
  let path = navPath;
  if (fromForm && focused) {
    currentUri = `${uri}?focused=${focused}${subPath}`;
    path = focusPath;
  } else if (subPath) {
    currentUri = `${uri}?focused=${subPath.split('.')[1]}`;
  }

  navigate(currentUri);

  dispatch({
    type: ActionTypes.FOCUS_TO,
    payload: { path: path + subPath },
  });
}

// function updateNavPathHistory(dialogId, navPath) {
//   if (navPathHistoryCopy.length === 0) {
//     navPathHistoryCopy.push({ dialogId: designPath.dialogId, navPath: designPath.navPath });
//   }
//   navPathHistoryCopy.push({ dialogId, navPath });
//   return { state: { navPathHistory: navPathHistoryCopy } };
// }
