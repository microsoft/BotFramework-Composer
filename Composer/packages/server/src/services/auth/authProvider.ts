// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters } from '@botframework-composer/types';

export type AuthConfig = {};

export abstract class AuthProvider {
  constructor(protected config: AuthConfig) {}

  abstract async getAccessToken(params: AuthParameters): Promise<string>;

  abstract async getArmAccessToken(tenantId: string): Promise<string>;

  abstract logOut(): void;
}
