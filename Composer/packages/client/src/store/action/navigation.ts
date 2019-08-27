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

export const navTo: ActionCreator = ({ state }, path, breadcrumb = null) => {
  if (!path) return;
  const currentUri = `/dialogs/${path}`;

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: breadcrumb || [] } });
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
  }

  if (checkUrl(currentUri, state.designPageLocation)) return;
  navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, 'focused', subPath) } });
};
