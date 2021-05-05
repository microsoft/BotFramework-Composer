// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters } from '@botframework-composer/types';

import { AuthConfig, AuthProvider } from './authProvider';

export class WebAuthProvider extends AuthProvider {
  constructor(config: AuthConfig) {
    super(config);
  }

  // TODO (toanzian / ccastro): implement
  async getAccessToken(params: AuthParameters): Promise<string> {
    throw new Error(
      'WebAuthProvider has not been implemented yet. Implicit auth flow currently only works in Electron.'
    );
  }

  async getArmAccessToken(tenantId: string): Promise<string> {
    throw new Error(
      'WebAuthProvider has not been implemented yet. Implicit auth flow currently only works in Electron.'
    );
  }

  logOut() {}
}
