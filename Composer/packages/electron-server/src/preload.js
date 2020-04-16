// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.

const { ipcRenderer } = require('electron');

// expose ipcRenderer to the browser
window.ipcRenderer = ipcRenderer;
