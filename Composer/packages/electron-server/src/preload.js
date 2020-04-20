// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.

const { ipcRenderer } = require('electron'); // eslint-disable-line

// expose ipcRenderer to the browser
window.ipcRenderer = ipcRenderer;
