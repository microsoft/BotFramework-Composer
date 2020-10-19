// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { Fragment } from 'react';

import { FeatureFlagMap, FeatureFlagNames, getFeatureFlagValue } from './DefaultFeatureFlags';

type FeatureProps = {
  featureFlagName: FeatureFlagNames;
  featureFlagMap: FeatureFlagMap;
};

export const Feature: React.FC<FeatureProps> = (props) => {
  return (
    <Fragment>{getFeatureFlagValue(props.featureFlagName, props.featureFlagMap) ? props.children : null}</Fragment>
  );
};
