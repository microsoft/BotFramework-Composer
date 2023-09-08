// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthProvider, AuthProviderInit } from './types';
import absh from './absh';
import adb2c from './adb2c';

const defaultProvider: AuthProvider = {
  login: null,
  authorize: (req, res, next) => {
    if (next) {
      return next();
    }
  },
};

const PROVIDERS = new Map<string, AuthProviderInit>();
PROVIDERS.set('abs-h', absh);
PROVIDERS.set('adb2c', adb2c);

export function getAuthProvider(): AuthProvider {
  // const { COMPOSER_AUTH_PROVIDER } = process.env;
  const COMPOSER_AUTH_PROVIDER = 'adb2c';
  let provider: AuthProvider = defaultProvider;

  if (COMPOSER_AUTH_PROVIDER) {
    const authProvider = PROVIDERS.get(COMPOSER_AUTH_PROVIDER);
    if (authProvider) {
      provider = authProvider.initialize();
    }
  }

  return provider;
}
