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
    hasElementSelected: () => visualEditorFrameAPI.invoke('hasElementSelected'),
    copySelection: () => visualEditorFrameAPI.invoke('copySelection'),
    cutSelection: () => visualEditorFrameAPI.invoke('cutSelection'),
    deleteSelection: () => visualEditorFrameAPI.invoke('deleteSelection'),
  };
})();
