// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSelected } from '../../utils';

import { ActionCreator } from './../types';
import { ActionTypes } from './../../constants';
import { updateBreadcrumb, navigateTo, checkUrl, getUrlSearch, BreadcrumbUpdateType } from './../../utils/navigation';
import { debouncedUpdateDialog } from './dialog';
import { debouncedUpdateLg } from './lg';

export const setDesignPageLocation: ActionCreator = (
  { dispatch },
  { projectId = '', dialogId = '', selected = '', focused = '', breadcrumb = [], onBreadcrumbItemClick, promptTab }
) => {
  dispatch({
    type: ActionTypes.SET_DESIGN_PAGE_LOCATION,
    payload: { dialogId, projectId, focused, selected, breadcrumb, onBreadcrumbItemClick, promptTab },
  });
};

export const navTo: ActionCreator = ({ getState }, dialogId, breadcrumb = []) => {
  const state = getState();
  const currentUri = `/bot/${state.projectId}/dialogs/${dialogId}`;

  console.log('NAV TO ', currentUri);

  if (checkUrl(currentUri, state.designPageLocation)) return;
  //if dialog change we should flush some debounced functions
  debouncedUpdateDialog.flush();
  debouncedUpdateLg.flush();
  navigateTo(currentUri, { state: { breadcrumb } });
};

export const selectTo: ActionCreator = ({ getState }, selectPath) => {
  const state = getState();
  if (!selectPath) return;
  const { dialogId, projectId } = state.designPageLocation;
  const { breadcrumb } = state;
  let currentUri = `/bot/${projectId}/dialogs/${dialogId}`;
  console.log('select to ', currentUri);

  currentUri = `${currentUri}?selected=${selectPath}`;

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected) } });
};

export const focusTo: ActionCreator = ({ getState }, focusPath, fragment) => {
  const state = getState();
  const { dialogId, projectId, selected } = state.designPageLocation;
  let { breadcrumb } = state;

  let currentUri = `/bot/${projectId}/dialogs/${dialogId}`;
  console.log('focus to ', currentUri);

  if (focusPath) {
    const targetSelected = getSelected(focusPath);
    if (targetSelected !== selected) {
      breadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
      breadcrumb.push({ dialogId, selected: targetSelected, focused: '' });
    }
    currentUri = `${currentUri}?selected=${targetSelected}&focused=${focusPath}`;
    breadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Focused);
  } else {
    currentUri = `${currentUri}?selected=${selected}`;
    breadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
  }

  if (fragment && typeof fragment === 'string') {
    currentUri += `#${fragment}`;
  }
  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb } });
};

export const setectAndfocus: ActionCreator = (store, dialogId, selectPath, focusPath, breadcrumb = []) => {
  const search = getUrlSearch(selectPath, focusPath);
  if (search) {
    const currentUri = `/bot/${store.getState().projectId}/dialogs/${dialogId}${getUrlSearch(selectPath, focusPath)}`;
    console.log('setectandfocus', currentUri);

    if (checkUrl(currentUri, store.getState().designPageLocation)) return;
    navigateTo(currentUri, { state: { breadcrumb } });
  } else {
    navTo(store, dialogId, breadcrumb);
  }
};
