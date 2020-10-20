// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { Fragment } from 'react';

import { FeatureFlagMap, FeatureFlagKey, getFeatureFlagValue } from './DefaultFeatureFlags';

type ComposerFeatureProps = {
  featureFlagKey: FeatureFlagKey;
  featureFlagMap: FeatureFlagMap;
};

export const ComposerFeature: React.FC<ComposerFeatureProps> = (props) => {
  return <Fragment>{getFeatureFlagValue(props.featureFlagKey, props.featureFlagMap) ? props.children : null}</Fragment>;
};
