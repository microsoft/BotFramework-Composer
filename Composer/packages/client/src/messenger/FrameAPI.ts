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
import ApiClient from './ApiClient';

const apiClient = new ApiClient();

export class FrameAPI {
  frameId: string;
  frameRef: any;

  constructor(frameId: string) {
    this.frameId = frameId;
    this.frameRef = null;
  }

  /**
   * Initialize the frame ref at first invocation.
   */
  invoke = (method: string, ...rest) => {
    if (!this.frameRef) {
      this.frameRef = window.frames[this.frameId];
    }

    if (this.frameRef && this.frameRef[method]) {
      return apiClient.apiCall('rpc', [method, ...rest], this.frameRef);
    }
    return Promise.reject();
  };
}

export const VisualEditorAPI = (() => {
  const visualEditorFrameAPI = new FrameAPI('VisualEditor');
  // HACK: under cypress env, avoid invoking API inside frame too frequently (especially the `hasEleemntFocused`). It will lead to CI test quite fagile.
  // TODO: remove this hack logic after refactoring state sync logic between shell and editors.
  if ((window as any).Cypress) {
    visualEditorFrameAPI.invoke = () => Promise.resolve(false);
  }

  return {
    hasElementFocused: () => visualEditorFrameAPI.invoke('hasElementFocused'),
    hasElementSelected: () => visualEditorFrameAPI.invoke('hasElementSelected').catch(() => false),
    copySelection: () => visualEditorFrameAPI.invoke('copySelection'),
    cutSelection: () => visualEditorFrameAPI.invoke('cutSelection'),
    deleteSelection: () => visualEditorFrameAPI.invoke('deleteSelection'),
  };
})();
