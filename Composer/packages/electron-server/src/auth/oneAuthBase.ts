// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ElectronAuthParameters } from '@botframework-composer/types';

export abstract class OneAuthBase {
  abstract async getAccessToken(
    params: ElectronAuthParameters
  ): Promise<{ accessToken: string; acquiredAt: number; expiryTime: number }>;
  abstract shutdown();
  abstract signOut();
}
