// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/// <reference types="jest" />

// for tests using Electron IPC to talk to main process
(window as any).ipcRenderer = { on: jest.fn() };

jest.mock('./src/utils/httpUtil');
