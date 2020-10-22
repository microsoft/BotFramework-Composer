// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: add types for "options"
type ElectronAuthOptions = {
  realm?: string;
  target?: string;
};
export type ElectronContext = {
  getAccessToken: (
    options: ElectronAuthOptions
  ) => Promise<{ accessToken: string; acquiredAt: number; expiryTime: number }>;
  getAccessTokenSilently: (
    options: ElectronAuthOptions
  ) => Promise<{ accessToken: string; acquiredAt: number; expiryTime: number }>;
};

var context;

export const useElectronContext = (): ElectronContext => context;

export const setElectronContext = (c: ElectronContext) => {
  context = c;
};
