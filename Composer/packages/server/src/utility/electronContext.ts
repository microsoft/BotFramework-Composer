// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AzureTenant, ElectronAuthParameters } from '@botframework-composer/types';

export type ElectronContext = {
  getAccessToken: (
    params: ElectronAuthParameters
  ) => Promise<{ accessToken: string; acquiredAt: number; expiryTime: number }>;
  getARMTokenForTenant: (tenantId: string) => Promise<string>;
  getTenants: () => Promise<AzureTenant[]>;
  logOut: () => void;
  telemetryData: {
    composerVersion: string;
    machineId: string;
    sessionId: string;
    architecture: string;
    cpus: number;
    memory: number;
  };
};

let context;

export const useElectronContext = (): ElectronContext => context;

export const setElectronContext = (c: ElectronContext) => {
  context = c;
};
