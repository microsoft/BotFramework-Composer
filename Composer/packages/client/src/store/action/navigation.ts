import { navigate } from '@reach/router';

import { ActionCreator } from './../types';
import { ActionTypes } from './../../constants';
import { clearBreadcrumbWhenFocusSteps, clearBreadcrumbWhenFocusEvent } from './../../utils/navigation';

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
  navigate(`/dialogs/${path}`, { state: { breadcrumb: breadcrumb || [] } });
};

export const focusEvent: ActionCreator = ({ state }, subPath) => {
  const { uri } = state.designPageLocation;
  const { breadcrumb } = state;
  let currentUri = uri;

  if (subPath) {
    currentUri = `${uri}?focusedEvent=${subPath}`;
  }

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

  navigate(currentUri, { state: { breadcrumb: clearBreadcrumbWhenFocusSteps(breadcrumb) } });
};
