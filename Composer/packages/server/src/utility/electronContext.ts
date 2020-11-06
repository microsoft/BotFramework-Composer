// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ElectronAuthParameters } from '@botframework-composer/types';

export type ElectronContext = {
  getAccessToken: (
    params: ElectronAuthParameters
  ) => Promise<{ accessToken: string; acquiredAt: number; expiryTime: number }>;
};

let context;

export const useElectronContext = (): ElectronContext => context;

export const setElectronContext = (c: ElectronContext) => {
  context = c;
};
