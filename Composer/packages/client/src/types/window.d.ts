// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

interface IPCRenderer {
  on: (eventName: string, listener: (event: any, ...args: any[]) => any) => void;
  send: (channel: string, payload?: any) => void;
}

interface Window {
  /**
   * Electron mechanism used for communication from renderer to main process.
   */
  ipcRenderer: IPCRenderer;

  /**
   * Flag that is set on the window object when the client is embedded within Electron.
   */
  __IS_ELECTRON__?: boolean;
}
