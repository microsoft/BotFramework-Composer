import { cloneDeep } from 'lodash';
import { navigate, NavigateOptions } from '@reach/router';

import { BreadcrumbItem } from '../store/types';

import { BASEPATH } from './../constants/index';
import { resolveToBasePath } from './fileUtil';

export function getFocusPath(focusedEvent: string, focusedStep: string): string {
  if (focusedEvent && focusedStep) return focusedStep;

  if (!focusedStep) return focusedEvent;

  return '';
}

export function clearBreadcrumb(breadcrumb: BreadcrumbItem[], fromIndex?: number): BreadcrumbItem[] {
  let breadcrumbCopy = cloneDeep(breadcrumb);
  if (fromIndex) {
    breadcrumbCopy.splice(fromIndex, breadcrumbCopy.length - fromIndex);
  } else {
    breadcrumbCopy = [];
  }
  return breadcrumbCopy;
}

export function clearBreadcrumbWhenFocusSteps(breadcrumb: BreadcrumbItem[], focusedSteps: string[]): BreadcrumbItem[] {
  const breadcrumbCopy = cloneDeep(breadcrumb);
  if (breadcrumbCopy.length === 0) {
    return breadcrumbCopy;
  }

  const lastIndex = breadcrumbCopy.length - 1;
  if (breadcrumbCopy[lastIndex] && breadcrumbCopy[lastIndex].focusedSteps.length > 0) {
    breadcrumbCopy.pop();
  }
  //deselect the step
  if (focusedSteps.length === 0) {
    breadcrumbCopy.pop();
  }
  return breadcrumbCopy;
}

export function clearBreadcrumbWhenFocusEvent(breadcrumb: BreadcrumbItem[], focusedEvent: string): BreadcrumbItem[] {
  const breadcrumbCopy = cloneDeep(breadcrumb);
  if (breadcrumbCopy.length === 0) {
    return breadcrumbCopy;
  }

  while (breadcrumbCopy.length > 0 && breadcrumbCopy[breadcrumbCopy.length - 1].focusedEvent) {
    breadcrumbCopy.pop();
  }
  //deselect the event
  if (!focusedEvent) {
    breadcrumbCopy.pop();
  }

  return breadcrumbCopy;
}

export function getUrlSearch(focusedEvent: string, focusedSteps: string[]): string {
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

export function checkUrl(
  currentUri: string,
  { dialogId, focusedEvent, focusedSteps }: { dialogId: string; focusedEvent: string; focusedSteps: string[] }
) {
  const lastUri = `/dialogs/${dialogId}${getUrlSearch(focusedEvent, focusedSteps)}`;
  return lastUri === currentUri;
}

interface NavigationState {
  breadcrumb: BreadcrumbItem[];
}

export function navigateTo(to: string, navigateOpts: NavigateOptions<NavigationState> = {}) {
  const mapNavPath = resolveToBasePath(BASEPATH, to);
  navigate(mapNavPath, navigateOpts);
}
