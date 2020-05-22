// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class FrameAPI {
  /**
   * Initialize the frame ref at first invocation.
   */
  invoke = (method: string, ...rest: any[]) => {
    if (typeof window[method] === 'function') {
      return window[method](...rest);
    }
  };
}

export const VisualEditorAPI = (() => {
  const visualEditorFrameAPI = new FrameAPI();
  // HACK: under cypress env, avoid invoking API inside frame too frequently (especially the `hasEleemntFocused`). It will lead to CI test quite fagile.
  // TODO: remove this hack logic after refactoring state sync logic between shell and editors.
  if ((window as any).Cypress) {
    visualEditorFrameAPI.invoke = () => {};
  }

  return {
    hasElementFocused: () => visualEditorFrameAPI.invoke('hasElementFocused'),
    hasElementSelected: () => visualEditorFrameAPI.invoke('hasElementSelected'),
    copySelection: () => visualEditorFrameAPI.invoke('copySelection'),
    cutSelection: () => visualEditorFrameAPI.invoke('cutSelection'),
    moveSelection: () => visualEditorFrameAPI.invoke('moveSelection'),
    deleteSelection: () => visualEditorFrameAPI.invoke('deleteSelection'),
  };
})();
