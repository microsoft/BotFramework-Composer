// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FeatureFlagKey } from '@botframework-composer/types';
import React, { Fragment } from 'react';

import { useFeatureFlag } from '../utils/hooks';

type ComposerFeatureProps = {
  featureFlagKey: FeatureFlagKey;
};

export const ComposerFeature: React.FC<ComposerFeatureProps> = (props) => {
  const { featureFlagKey } = props;
  const featureIsEnabled = useFeatureFlag(featureFlagKey);
  return <Fragment>{featureIsEnabled ? props.children : null}</Fragment>;
};
