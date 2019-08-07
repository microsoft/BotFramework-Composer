import { navigate } from '@reach/router';

import { ActionCreator } from './../types';
import { ActionTypes } from './../../constants';

export const setDesignPageLocation: ActionCreator = (
  { dispatch },
  { dialogId, focusedEvent, focusedSteps, uri, breadcrumb }
) => {
  dispatch({
    type: ActionTypes.SET_DESIGN_PAGE_LOCATION,
    payload: { dialogId, focusedEvent, focusedSteps, uri, breadcrumb },
  });
};

export const navTo: ActionCreator = (store, path, breadcrumb = null) => {
  if (!path) return;

  navigate(`/dialogs/${path}/`, { state: { breadcrumb: breadcrumb || [] } });
};

export const focusTo: ActionCreator = ({ state }, subPath, fromForm = false) => {
  const { focused, uri, breadcrumb } = state.designPageLocation;
  let currentUri = uri;
  if (fromForm && focused) {
    currentUri = `${uri}?focused=${focused}.${subPath}`;
  } else if (subPath) {
    currentUri = `${uri}?focused=${subPath}`;
  }

  navigate(currentUri, { state: { breadcrumb } });
};

export const focuseEvent: ActionCreator = ({ state }, subPath) => {
  const { uri } = state.designPageLocation;
  let currentUri = uri;

  if (subPath) {
    currentUri = `${uri}?focusedEvent=${subPath}`;
  }

  navigate(currentUri);
};

export const focuseSteps: ActionCreator = ({ state }, subPaths) => {
  const { uri, focusedEvent } = state.designPageLocation;

  let currentUri = uri;
  if (subPaths.length > 0) {
    const items = subPaths[0].split('.');
    if (items[0] === focusedEvent) {
      currentUri = `${uri}?focusedEvent=${focusedEvent}&focusedSteps[]=${subPaths[0]}`;
    } else {
      currentUri = `${uri}?focusedEvent=${items[0]}&focusedSteps[]=${subPaths[0]}`;
    }
  } else if (focusedEvent) {
    currentUri = `${uri}?focusedEvent=${focusedEvent}`;
  }

  navigate(currentUri);
};
