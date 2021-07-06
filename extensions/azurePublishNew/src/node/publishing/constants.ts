// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const authConfig = {
  arm: {
    // for web login
    scopes: ['https://management.core.windows.net/user_impersonation'],
    // for electron
    targetResource: 'https://management.core.windows.net/',
  },
  graph: {
    // for web login
    scopes: ['https://graph.microsoft.com/Application.ReadWrite.All'],
    // for electron
    targetResource: 'https://graph.microsoft.com/',
  },
};
