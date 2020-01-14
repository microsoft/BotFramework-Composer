// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import cloneDeep from 'lodash/cloneDeep';
import { navigate, NavigateOptions } from '@reach/router';
import { Diagnostic } from '@bfc/indexers';
import get from 'lodash/get';
import has from 'lodash/has';

import { BreadcrumbItem, DesignPageLocation } from '../store/types';

import { parsePathToFocused, parsePathToSelected, parseTypeToFragment } from './convertUtils';
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

export function convertDialogDiagnosticToUrl(diagnostic: Diagnostic): string {
  //path is like main.trigers[0].actions[0]
  //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]
  const { path, source } = diagnostic;
  if (!source) return '';

  let uri = `/dialogs/${source}`;
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

export function convertInlineLgDiagnosticToUrl(targetTemplateId, dialogs): string {
  let url = '';
  function visitor(path: string, value: any): boolean {
    if (has(value, 'activity') && value.activity === `@{${targetTemplateId}()}`) {
      console.log(path);
      console.log(value);
      url = path;
      return true;
    }
    return false;
  }
  dialogs.forEach(dialog => {
    const triggers = get(dialog, 'content.triggers', []);

    triggers.forEach((t, index) => {
      searchLgTemplate(`dialogs/${dialog.id}?selected=triggers[${index}]&focused=triggers[${index}]`, t, visitor);
    });
  });
  return url;
}

export function navigateTo(to: string, navigateOpts: NavigateOptions<NavigationState> = {}) {
  const mapNavPath = resolveToBasePath(BASEPATH, to);
  navigate(mapNavPath, navigateOpts);
}

function searchLgTemplate(path: string, value: any, visitor) {
  const stop = visitor(path, value);
  if (stop === true) return;

  // extract array
  if (Array.isArray(value)) {
    value.forEach((child, index) => {
      searchLgTemplate(`${path}[${index}]`, child, visitor);
    });

    // extract object
  } else if (typeof value === 'object' && value) {
    Object.keys(value).forEach(key => {
      searchLgTemplate(`${path}.${key}`, value[key], visitor);
    });
  }
}
