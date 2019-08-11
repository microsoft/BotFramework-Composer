import { navigate } from '@reach/router';

import { ActionCreator } from './../types';
import { ActionTypes } from './../../constants';
import { clearBreadcrumbWhenFocusSteps, clearBreadcrumbWhenFocusEvent, getUrlSearch } from './../../utils/navigation';

export const setDesignPageLocation: ActionCreator = (
  { dispatch },
  { dialogId, focusedEvent, focusedSteps, uri, breadcrumb }
) => {
  dispatch({
    type: ActionTypes.SET_DESIGN_PAGE_LOCATION,
    payload: { dialogId, focusedEvent, focusedSteps, uri, breadcrumb },
  });
};

const checkUrl = (currentUri, { dialogId, focusedEvent, focusedSteps }) => {
  const lastUri = `/dialogs/${dialogId}${getUrlSearch(focusedEvent, focusedSteps)}`;
  return lastUri == currentUri;
};

export const navTo: ActionCreator = ({ state }, path, breadcrumb = null) => {
  if (!path) return;
  const { uri } = state.designPageLocation;
  const currentUri = `/dialogs/${path}`;

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigate(currentUri, { state: { breadcrumb: breadcrumb || [] } });
};

export const focusEvent: ActionCreator = ({ state }, subPath) => {
  const { uri } = state.designPageLocation;
  const { breadcrumb } = state;
  let currentUri = uri;

  if (subPath) {
    currentUri = `${uri}?focusedEvent=${subPath}`;
  }

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigate(currentUri, { state: { breadcrumb: clearBreadcrumbWhenFocusEvent(breadcrumb, subPath) } });
};

const checkFocusedSteps = (focusedEvent: string, focusedSteps: string[]) => {
  if (focusedSteps.length === 0) return true;
  const parent = focusedSteps[0].split('.')[0];
  if (!focusedSteps.every(item => item.split('.')[0] === parent)) return false;
  return focusedEvent === parent;
};

export const focusSteps: ActionCreator = ({ state }, subPaths) => {
  const { uri, focusedEvent } = state.designPageLocation;
  const { breadcrumb } = state;

  if (!checkFocusedSteps(focusedEvent, subPaths)) {
    return;
  }

  let currentUri = uri;
  if (subPaths.length) {
    currentUri = `${uri}?focusedEvent=${focusedEvent}&focusedSteps[]=${subPaths[0]}`;
  } else if (focusedEvent) {
    currentUri = `${uri}?focusedEvent=${focusedEvent}`;
  }

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigate(currentUri, { state: { breadcrumb: clearBreadcrumbWhenFocusSteps(breadcrumb, subPaths) } });
};
