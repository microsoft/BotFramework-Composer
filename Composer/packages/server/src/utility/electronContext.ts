// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: add types for "options"
export type ElectronContext = {
  getAccessToken: (options) => Promise<{ accessToken: string; acquiredAt: number; expiresIn: number }>;
  loginAndGetIdToken: (options) => Promise<string>;
};

var context;

export const useElectronContext = (): ElectronContext => context;

export const setElectronContext = (c: ElectronContext) => {
  context = c;
};
