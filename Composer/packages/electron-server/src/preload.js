// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.

const { ipcRenderer } = require('electron');

// expose ipcRenderer to the browser
window.ipcRenderer = ipcRenderer;

// TODO: copy me to /build/ automatically (ncp?)
