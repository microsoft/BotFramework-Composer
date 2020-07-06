// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import cloneDeep from 'lodash/cloneDeep';
import { navigate, NavigateOptions } from '@reach/router';

import { BreadcrumbItem, DesignPageLocation } from '../recoilModel/types';
import { BASEPATH } from '../constants';

import { parsePathToFocused } from './convertUtils/parsePathToFocused';
import { parsePathToSelected } from './convertUtils/parsePathToSelected';
import { parseTypeToFragment } from './convertUtils/parseTypeToFragment';
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

export function checkUrl(
  currentUri: string,
  { dialogId, projectId, selected, focused, promptTab }: DesignPageLocation
) {
  let lastUri = `/bot/${projectId}/dialogs/${dialogId}${getUrlSearch(selected, focused)}`;
  if (promptTab) {
    lastUri += `#${promptTab}`;
  }
  return lastUri === currentUri;
}

interface NavigationState {
  breadcrumb: BreadcrumbItem[];
}

export function convertPathToUrl(projectId: string, dialogId: string, path?: string): string {
  //path is like main.trigers[0].actions[0]
  //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]

  let uri = `/bot/${projectId}/dialogs/${dialogId}`;
  if (!path) return uri;

  const items = path.split('#');
  const sub = items[0];
  const type = items[1];
  const property = items[2];

  const selected = parsePathToSelected(sub);

  if (!selected) return uri;
  uri += `?selected=${selected}`;

  const focused = parsePathToFocused(sub);
  if (!focused) return uri;
  uri += `&focused=${focused}`;

  const fragment = parseTypeToFragment(type, property);
  if (!fragment) return uri;
  uri += `#${fragment}`;

  return uri;
}

export function navigateTo(to: string, navigateOpts: NavigateOptions<NavigationState> = {}) {
  const mapNavPath = resolveToBasePath(BASEPATH, to);
  navigate(mapNavPath, navigateOpts);
}

export const openInEmulator = (url, authSettings: { MicrosoftAppId: string; MicrosoftAppPassword: string }) => {
  // this creates a temporary hidden iframe to fire off the bfemulator protocol
  // and start up the emulator
  const i = document.createElement('iframe');
  i.style.display = 'none';
  i.onload = () => i.parentNode && i.parentNode.removeChild(i);
  i.src = `bfemulator://livechat.open?botUrl=${encodeURIComponent(url)}&msaAppId=${
    authSettings.MicrosoftAppId
  }&msaAppPassword=${encodeURIComponent(authSettings.MicrosoftAppPassword)}`;
  document.body.appendChild(i);
};
