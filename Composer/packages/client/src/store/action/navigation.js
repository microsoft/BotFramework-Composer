import { navigate } from '@reach/router';

import { ActionTypes } from '../../constants/index';

export function setDesignPageLocation({ dispatch }, { dialogId, dataPath, focused, uri, breadcrumb }) {
  dispatch({
    type: ActionTypes.SET_DESIGN_PAGE_LOCATION,
    payload: { dialogId, dataPath, focused, uri, breadcrumb },
  });
}

export function navTo(store, path, breadcrumb = null) {
  if (!path) return;

  navigate(`/dialogs/${path}/`, { state: { breadcrumb: breadcrumb || [] } });
}

export function navDown({ state }, subPath) {
  if (!subPath) return;

  const { uri, dataPath, breadcrumb } = state.designPageLocation;
  let currentUri = uri;

  if (dataPath) {
    currentUri = currentUri + '.' + subPath;
  } else {
    currentUri = currentUri + '/' + subPath;
  }
  navigate(currentUri, { state: { breadcrumb } });
}

export function focusTo({ state }, subPath, fromForm = false) {
  const { focused, uri, breadcrumb } = state.designPageLocation;
  let currentUri = uri;
  if (fromForm && focused) {
    currentUri = `${uri}?focused=${focused}.${subPath}`;
  } else if (subPath) {
    currentUri = `${uri}?focused=${subPath}`;
  }

  navigate(currentUri, { state: { breadcrumb } });
}
