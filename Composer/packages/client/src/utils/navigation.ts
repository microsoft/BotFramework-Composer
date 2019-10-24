import { cloneDeep } from 'lodash';
import { navigate, NavigateOptions } from '@reach/router';

import { BreadcrumbItem, DesignPageLocation } from '../store/types';

import { BASEPATH } from './../constants/index';
import { resolveToBasePath } from './fileUtil';

export const BreadcrumbUpdateType = {
  Selected: 'selected',
  Focused: 'focused',
};

export function getFocusPath(selected: string, focused: string): string {
  if (selected && focused) return focused;

  if (!focused) return selected;

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

export function updateBreadcrumb(breadcrumb: BreadcrumbItem[], type: string): BreadcrumbItem[] {
  const breadcrumbCopy = cloneDeep(breadcrumb);
  if (breadcrumbCopy.length === 0) {
    return breadcrumbCopy;
  }

  let lastIndex = breadcrumbCopy.length - 1;
  while (lastIndex > 0 && breadcrumbCopy[lastIndex][type]) {
    breadcrumbCopy.pop();
    lastIndex--;
  }

  return breadcrumbCopy;
}

export function getUrlSearch(selected: string, focused: string): string {
  const search = new URLSearchParams();
  if (selected) {
    search.append('selected', selected);
  }

  if (focused) {
    search.append('focused', focused);
  }

  let result = decodeURI(search.toString());
  if (result) {
    result = '?' + result;
  }
  return result;
}

export function checkUrl(currentUri: string, { dialogId, selected, focused, promptTab }: DesignPageLocation) {
  let lastUri = `/dialogs/${dialogId}${getUrlSearch(selected, focused)}`;
  if (promptTab) {
    lastUri += `#${promptTab}`;
  }
  return lastUri === currentUri;
}

interface NavigationState {
  breadcrumb: BreadcrumbItem[];
}

export function navigateTo(to: string, navigateOpts: NavigateOptions<NavigationState> = {}) {
  const mapNavPath = resolveToBasePath(BASEPATH, to);
  navigate(mapNavPath, navigateOpts);
}
