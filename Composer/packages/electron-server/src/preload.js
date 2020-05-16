// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { ipcRenderer, shell } = require('electron'); // eslint-disable-line

// expose ipcRenderer to the browser
window.ipcRenderer = ipcRenderer;
window.openExternal = shell.openExternal;
// flag to distinguish electron client from web app client
window.__IS_ELECTRON__ = true;
