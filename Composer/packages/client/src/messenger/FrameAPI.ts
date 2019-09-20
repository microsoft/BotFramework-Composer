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
  invoke = (handlerName: string, ...rest) => {
    if (!this.frameRef) {
      this.frameRef = window.frames[this.frameId];
    }

    if (this.frameRef && this.frameRef[handlerName]) {
      return this.frameRef[handlerName](...rest);
    }
    return;
  };
}

export const VisualEditorAPI = (() => {
  const visualEditorFrameAPI = new FrameAPI('VisualEditor');
  return {
    hasElementFocused: () => visualEditorFrameAPI.invoke('hasElementFocused'),
    hasElementSelected: () => visualEditorFrameAPI.invoke('hasElementSelected'),
    copySelection: () => visualEditorFrameAPI.invoke('copySelection'),
    cutSelection: () => visualEditorFrameAPI.invoke('cutSelection'),
    deleteSelection: () => visualEditorFrameAPI.invoke('deleteSelection'),
  };
})();
