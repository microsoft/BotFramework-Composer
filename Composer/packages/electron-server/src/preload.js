// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { ipcRenderer } = require('electron'); // eslint-disable-line

// expose ipcRenderer to the browser
window.ipcRenderer = ipcRenderer;
// flag to distinguish electron client from web app client
window.__IS_ELECTRON__ = true;
