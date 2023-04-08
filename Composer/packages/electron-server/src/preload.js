// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { ipcRenderer, contextBridge } = require('electron');

// expose ipcRenderer to the browser
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (...args) => ipcRenderer.send(...args),
  on: (...args) => ipcRenderer.on(...args),
});

// flag to distinguish electron client from web app client
contextBridge.exposeInMainWorld('__IS_ELECTRON__', true);
