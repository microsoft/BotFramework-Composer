// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters } from '@botframework-composer/types';

export type AuthConfig = Record<string, unknown>;

export abstract class AuthProvider {
  constructor(protected config: AuthConfig) {}

  abstract getAccessToken(params: AuthParameters): Promise<string>;

  abstract getArmAccessToken(tenantId: string): Promise<string>;

  abstract logOut(): void;
}
