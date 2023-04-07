// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { ipcRenderer, contextBridge } = require('electron'); // eslint-disable-line

const isOneAuthEanabled = !(process.env.COMPOSER_ENABLE_ONEAUTH === 'false' || process.platform === 'linux');

// expose ipcRenderer to the browser
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (...args) => ipcRenderer.send(...args),
  on: (...args) => ipcRenderer.on(...args),
});

// flag to distinguish electron client from web app client
contextBridge.exposeInMainWorld('__IS_ELECTRON__', true);
// flag to toggle OneAuth support
contextBridge.exposeInMainWorld('__ENABLE_ONEAUTH__', isOneAuthEanabled);
