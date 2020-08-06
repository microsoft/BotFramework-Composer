// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// for tests using Electron IPC to talk to main process
(window as any).ipcRenderer = { on: jest.fn() };
