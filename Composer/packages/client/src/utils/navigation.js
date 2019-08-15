import { cloneDeep } from 'lodash';
import { navigate } from '@reach/router';

import { BASEPATH } from './../constants/index';
import { resolveToBasePath } from './fileUtil';

export function getFocusPath(focusedEvent, focusedStep) {
  if (focusedEvent && focusedStep) return focusedStep;

  if (!focusedStep) return focusedEvent;

  return '';
}

export function clearBreadcrumb(breadcrumb, fromIndex) {
  let breadcrumbCopy = cloneDeep(breadcrumb);
  if (fromIndex) {
    breadcrumbCopy.splice(fromIndex, breadcrumbCopy.length - fromIndex);
  } else {
    breadcrumbCopy = [];
  }
  return breadcrumbCopy;
}

export function clearBreadcrumbWhenFocusSteps(breadcrumb, focuseSteps) {
  const breadcrumbCopy = cloneDeep(breadcrumb);
  if (breadcrumbCopy.length === 0) return breadcrumbCopy;
  const lastIndex = breadcrumbCopy.length - 1;
  if (breadcrumbCopy[lastIndex].focusedSteps.length > 0) {
    breadcrumbCopy.pop();
  }
  //deselect the step
  if (focuseSteps.length === 0) {
    breadcrumbCopy.pop();
  }
  return breadcrumbCopy;
}

export function clearBreadcrumbWhenFocusEvent(breadcrumb, focusedEvent) {
  const breadcrumbCopy = cloneDeep(breadcrumb);
  if (breadcrumbCopy.length === 0) return breadcrumbCopy;
  while (breadcrumbCopy.length > 0 && breadcrumbCopy[breadcrumbCopy.length - 1].focusedEvent) {
    breadcrumbCopy.pop();
  }
  //deselect the event
  if (!focusedEvent) {
    breadcrumbCopy.pop();
  }

  return breadcrumbCopy;
}

export function getUrlSearch(focusedEvent, focusedSteps) {
  const search = new URLSearchParams();
  if (focusedEvent) {
    search.append('focusedEvent', focusedEvent);
  }

  if (focusedSteps.length > 0) {
    focusedSteps.forEach(item => {
      search.append('focusedSteps[]', item);
    });
  }

  let result = decodeURI(search.toString());
  if (result) {
    result = '?' + result;
  }
  return result;
}

export function checkUrl(currentUri, { dialogId, focusedEvent, focusedSteps }) {
  const lastUri = `/dialogs/${dialogId}${getUrlSearch(focusedEvent, focusedSteps)}`;
  return lastUri === currentUri;
}

export function navigateTo(to, { state, replace = false } = {}) {
  const mapNavPath = resolveToBasePath(BASEPATH, to);
  navigate(mapNavPath, { state, replace });
}
