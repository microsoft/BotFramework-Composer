// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

interface Window {
  /**
   * Electron mechanism used for communication from renderer to main process.
   */
  ipcRenderer: IPCRenderer;

  /**
   * Flag that is set on the window object when the client is embedded within Electron.
   */
  __IS_ELECTRON__?: boolean;

  /**
   * Composer UI Extension API
   */
  Composer: any;
}
