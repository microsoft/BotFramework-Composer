import { ActionCreator } from './../types';
import { ActionTypes } from './../../constants';
import { updateBreadcrumb, navigateTo, checkUrl } from './../../utils/navigation';

export const setDesignPageLocation: ActionCreator = (
  { dispatch },
  { dialogId = '', uri = '', selected = '', focused = '', breadcrumb = [] }
) => {
  dispatch({
    type: ActionTypes.SET_DESIGN_PAGE_LOCATION,
    payload: { dialogId, focused, selected, uri, breadcrumb },
  });
};

export const navTo: ActionCreator = ({ state }, path, currentBreadcrumb = []) => {
  if (!path) return;
  const { breadcrumb } = state;
  let currentUri = `/dialogs/${path}`;
  let dialogId = path;
  //If no selected add 'rules[0]' as default. add root dialog to breadcrumb
  if (path.split('?').length <= 1) {
    currentUri = `${currentUri}?selected=rules[0]`;
  } else {
    dialogId = path.split('?')[0];
  }
  currentBreadcrumb = [...currentBreadcrumb, { dialogId, selected: '', focused: '' }];

  if (breadcrumb.length - 1 === currentBreadcrumb && checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: currentBreadcrumb } });
};

export const selectTrigger: ActionCreator = ({ state }, subPath) => {
  const { dialogId } = state.designPageLocation;
  const { breadcrumb } = state;
  let currentUri = `/dialogs/${dialogId}`;

  if (subPath) {
    currentUri = `${currentUri}?selected=${subPath}`;
  }

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, 'selected', subPath) } });
};

export const focusTo: ActionCreator = ({ state }, subPath) => {
  const { dialogId, selected } = state.designPageLocation;
  const { breadcrumb } = state;

  let currentUri = `/dialogs/${dialogId}?selected=${selected}`;
  if (subPath) {
    currentUri = `${currentUri}&focused=${subPath}`;
  } else {
    currentUri = `${currentUri}&focused=${selected}`;
  }

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, 'focused', subPath) } });
};
