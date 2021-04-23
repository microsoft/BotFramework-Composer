// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { app, ipcRenderer } = require('electron'); // eslint-disable-line

// expose ipcRenderer to the browser
window.ipcRenderer = ipcRenderer;
// get the app version to hand into the client
window.appVersion = app.getVersion();
// flag to distinguish electron client from web app client
window.__IS_ELECTRON__ = true;
