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
  setFrameRef = () => {
    if (!this.frameRef) {
      this.frameRef = window.frames[this.frameId];
    }
  };

  invoke = (method: string, ...rest) => {
    return apiClient.apiCall('rpc', [method, ...rest], this.frameRef);
  };
}

export const VisualEditorAPI = (() => {
  const visualEditorFrameAPI = new FrameAPI('VisualEditor');
  // HACK: under cypress env, avoid invoking API inside frame too frequently (especially the `hasEleemntFocused`). It will lead to CI test quite fagile.
  // TODO: remove this hack logic after refactoring state sync logic between shell and editors.
  if ((window as any).Cypress) {
    visualEditorFrameAPI.invoke = () => Promise.resolve(false);
  }

  const invoke = (method: string) => {
    visualEditorFrameAPI.setFrameRef();
    if (visualEditorFrameAPI.frameRef && visualEditorFrameAPI.frameRef[method]) {
      return visualEditorFrameAPI.invoke(method);
    }
    return Promise.reject();
  };
  return {
    hasElementFocused: () => invoke('hasElementFocused'),
    hasElementSelected: () => invoke('hasElementSelected'),
    copySelection: () => invoke('copySelection'),
    cutSelection: () => invoke('cutSelection'),
    deleteSelection: () => invoke('deleteSelection'),
  };
})();
