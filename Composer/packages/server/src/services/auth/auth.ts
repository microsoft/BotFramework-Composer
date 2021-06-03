// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuid } from 'uuid';
import { AuthParameters } from '@botframework-composer/types';

import { isElectron } from '../../utility/isElectron';
import logger from '../../logger';

import { AuthProvider } from './authProvider';
import { ElectronAuthProvider } from './electronAuthProvider';
import { WebAuthProvider } from './webAuthProvider';

const log = logger.extend('auth-service');

class AuthService {
  private provider: AuthProvider;
  private _csrfToken: string;

  constructor() {
    if (isElectron) {
      // desktop scenario
      this.provider = new ElectronAuthProvider({});
      log('Initialized in Electron context.');
    } else {
      // hosted / web scenario
      this.provider = new WebAuthProvider({});
      log('Initialized in Web context.');
    }
    // generate anti-csrf token in production environment
    if (process.env.NODE_ENV === 'production') {
      log('Production environment detected. Generating CSRF token.');
      this._csrfToken = uuid();
    } else {
      this._csrfToken = '';
    }
  }

  async getAccessToken(params: AuthParameters): Promise<string> {
    return this.provider.getAccessToken(params);
  }

  async getArmAccessToken(tenantId: string): Promise<string> {
    return this.provider.getArmAccessToken(tenantId);
  }

  logOut() {
    this.provider.logOut();
  }

  get csrfToken(): string {
    return this._csrfToken;
  }
}

export const authService = new AuthService();
