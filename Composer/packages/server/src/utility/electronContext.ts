// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ElectronContext = {
  getAccessToken: (options) => Promise<string>;
  loginAndGetIdToken: (options) => Promise<string>;
};

var context;

export const useElectronContext = (): ElectronContext => context;

export const setElectronContext = (c: ElectronContext) => {
  context = c;
};
