import { ActionCreator } from './../types';
import { ActionTypes } from './../../constants';
import {
  clearBreadcrumbWhenFocusSteps,
  clearBreadcrumbWhenFocusEvent,
  navigateTo,
  checkUrl,
} from './../../utils/navigation';

export const setDesignPageLocation: ActionCreator = (
  { dispatch },
  { dialogId = '', uri = '', focusedEvent = '', focusedSteps = [], breadcrumb = [] }
) => {
  dispatch({
    type: ActionTypes.SET_DESIGN_PAGE_LOCATION,
    payload: { dialogId, focusedEvent, focusedSteps, uri, breadcrumb },
  });
};

export const navTo: ActionCreator = ({ state }, path, breadcrumb = null) => {
  if (!path) return;
  const currentUri = `/dialogs/${path}`;

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: breadcrumb || [] } });
};

export const focusEvent: ActionCreator = ({ state }, subPath) => {
  const { dialogId } = state.designPageLocation;
  const { breadcrumb } = state;
  let currentUri = `/dialogs/${dialogId}`;

  if (subPath) {
    currentUri = `${currentUri}?focusedEvent=${subPath}`;
  }

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: clearBreadcrumbWhenFocusEvent(breadcrumb, subPath) } });
};

const checkFocusedSteps = (focusedEvent: string, focusedSteps: string[]) => {
  if (focusedSteps.length === 0) return true;
  const parent = focusedSteps[0].split('.')[0];
  if (!focusedSteps.every(item => item.split('.')[0] === parent)) return false;
  return focusedEvent === parent;
};

export const focusSteps: ActionCreator = ({ state }, subPaths) => {
  const { dialogId, focusedEvent } = state.designPageLocation;
  const { breadcrumb } = state;

  if (!checkFocusedSteps(focusedEvent, subPaths)) {
    return;
  }

  let currentUri = `/dialogs/${dialogId}`;
  if (subPaths.length) {
    currentUri = `${currentUri}?focusedEvent=${focusedEvent}&focusedSteps[]=${subPaths[0]}`;
  } else if (focusedEvent) {
    currentUri = `${currentUri}?focusedEvent=${focusedEvent}`;
  }

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: clearBreadcrumbWhenFocusSteps(breadcrumb, subPaths) } });
};
