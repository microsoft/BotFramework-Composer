// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FeatureFlagKey } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { featureFlagsState } from '../recoilModel';

export const useFeatureFlag = (featureFlagKey: FeatureFlagKey): boolean => {
  const featureFlags = useRecoilValue(featureFlagsState);
  return featureFlags[featureFlagKey].enabled;
};
