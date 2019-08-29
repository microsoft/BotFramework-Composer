import { ActionCreator } from './../types';
import { ActionTypes } from './../../constants';
import { updateBreadcrumb, navigateTo, checkUrl, getUrlSearch } from './../../utils/navigation';

export const setDesignPageLocation: ActionCreator = (
  { dispatch },
  { dialogId = '', selected = '', focused = '', breadcrumb = [], onBreadcrumbItemClick }
) => {
  dispatch({
    type: ActionTypes.SET_DESIGN_PAGE_LOCATION,
    payload: { dialogId, focused, selected, breadcrumb, onBreadcrumbItemClick },
  });
};

export const navTo: ActionCreator = ({ state }, dialogId, breadcrumb = []) => {
  const { dialogs } = state;
  let currentUri = `/dialogs/${dialogId}`;

  const dialog = dialogs.find(item => dialogId === item.id);
  if (dialog && dialog.triggers.length > 0) {
    currentUri = `${currentUri}?selected=rules[0]`;

    breadcrumb = [...breadcrumb, { dialogId, selected: '', focused: '' }];
  }

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb } });
};

export const selectTo: ActionCreator = ({ state }, selectPath) => {
  if (!selectPath) return;
  const { dialogId } = state.designPageLocation;
  const { breadcrumb } = state;
  let currentUri = `/dialogs/${dialogId}`;

  currentUri = `${currentUri}?selected=${selectPath}`;

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, 'selected') } });
};

export const focusTo: ActionCreator = ({ state }, focusPath) => {
  const { dialogId, selected } = state.designPageLocation;
  const { breadcrumb } = state;

  let currentUri = `/dialogs/${dialogId}?selected=${selected}`;
  if (focusPath) {
    currentUri = `${currentUri}&focused=${focusPath}`;
  } else {
    currentUri = `${currentUri}&focused=${selected}`;
  }

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, 'focused') } });
};

export const setectAndfocus: ActionCreator = (store, dialogId, selectPath, focusPath, breadcrumb = []) => {
  const search = getUrlSearch(selectPath, focusPath);
  if (search) {
    const currentUri = `/dialogs/${dialogId}${getUrlSearch(selectPath, focusPath)}`;

    if (checkUrl(currentUri, store.state.designPageLocation)) return;
    navigateTo(currentUri, { state: { breadcrumb } });
  } else {
    navTo(store, dialogId, breadcrumb);
  }
};
