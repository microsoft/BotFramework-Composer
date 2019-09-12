import { createSelectedPath } from '../../utils';

import { ActionCreator } from './../types';
import { ActionTypes } from './../../constants';
import { updateBreadcrumb, navigateTo, checkUrl, getUrlSearch, BreadcrumbUpdateType } from './../../utils/navigation';

export const setDesignPageLocation: ActionCreator = (
  { dispatch },
  { dialogId = '', selected = '', focused = '', breadcrumb = [], onBreadcrumbItemClick }
) => {
  dispatch({
    type: ActionTypes.SET_DESIGN_PAGE_LOCATION,
    payload: { dialogId, focused, selected, breadcrumb, onBreadcrumbItemClick },
  });
};

export const navTo: ActionCreator = ({ getState }, dialogId, breadcrumb = []) => {
  const state = getState();
  const { dialogs } = state;
  let currentUri = `/dialogs/${dialogId}`;

  const dialog = dialogs.find(item => dialogId === item.id);
  if (dialog && dialog.triggers.length > 0) {
    currentUri = `${currentUri}?selected=${createSelectedPath(0)}`;

    breadcrumb = [...breadcrumb, { dialogId, selected: '', focused: '' }];
  }

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb } });
};

export const selectTo: ActionCreator = ({ getState }, selectPath) => {
  const state = getState();
  if (!selectPath) return;
  const { dialogId } = state.designPageLocation;
  const { breadcrumb } = state;
  let currentUri = `/dialogs/${dialogId}`;

  currentUri = `${currentUri}?selected=${selectPath}`;

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected) } });
};

export const focusTo: ActionCreator = ({ getState }, focusPath) => {
  const state = getState();
  const { dialogId, selected } = state.designPageLocation;
  const { breadcrumb } = state;

  let breadcrumbUpdateType = BreadcrumbUpdateType.Focused;
  let currentUri = `/dialogs/${dialogId}?selected=${selected}`;
  if (focusPath) {
    currentUri = `${currentUri}&focused=${focusPath}`;
  } else {
    currentUri = `${currentUri}`;
    breadcrumbUpdateType = BreadcrumbUpdateType.Selected;
  }

  if (state.breadcrumb.length === breadcrumb.length && checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, breadcrumbUpdateType) } });
};

export const setectAndfocus: ActionCreator = (store, dialogId, selectPath, focusPath, breadcrumb = []) => {
  const search = getUrlSearch(selectPath, focusPath);
  if (search) {
    const currentUri = `/dialogs/${dialogId}${getUrlSearch(selectPath, focusPath)}`;

    if (checkUrl(currentUri, store.getState().designPageLocation)) return;
    navigateTo(currentUri, { state: { breadcrumb } });
  } else {
    navTo(store, dialogId, breadcrumb);
  }
};
