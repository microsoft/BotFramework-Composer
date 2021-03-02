// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AzureTenant, ElectronAuthParameters } from '@botframework-composer/types';

import logger from '../utility/logger';

import { OneAuthBase } from './oneAuthBase';

const log = logger.extend('one-auth-shim');

export class OneAuthShim extends OneAuthBase {
  constructor() {
    super();
    log('Using OneAuth shim.');
    log('To use genuine OneAuth library please read AUTH.md');
  }

  public async getAccessToken(params: ElectronAuthParameters) {
    return { accessToken: '', acquiredAt: 0, expiryTime: 99999999999 };
  }
  public shutdown() {}
  public signOut() {}
  public async getARMTokenForTenant(tenantId: string): Promise<string> {
    return '';
  }
  public async getTenants(): Promise<AzureTenant[]> {
    return [];
  }
}
