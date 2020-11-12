// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FeatureFlagKey } from '@bfc/shared';

export type FeatureFlagService = {
  getFeatureFlagValue(featureFlagKey: FeatureFlagKey): boolean;
};
