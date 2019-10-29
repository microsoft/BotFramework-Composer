/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
