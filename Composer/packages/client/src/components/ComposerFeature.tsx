// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FeatureFlagKey } from '@bfc/shared';
import React, { Fragment } from 'react';
import { useRecoilValue } from 'recoil';

import { featureFlagsState } from '../recoilModel';

type ComposerFeatureProps = {
  featureFlagKey: FeatureFlagKey;
};

export const ComposerFeature: React.FC<ComposerFeatureProps> = (props) => {
  const { featureFlagKey } = props;
  const featureFlags = useRecoilValue(featureFlagsState);
  return (
    <Fragment>{featureFlags[featureFlagKey] && featureFlags[featureFlagKey].enabled ? props.children : null}</Fragment>
  );
};
