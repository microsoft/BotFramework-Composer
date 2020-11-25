// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { FeatureFlagKey } from '@botframework-composer/types';

import * as styles from './styles';

type FeatureFlagCheckBoxProps = {
  featureFlagKey: FeatureFlagKey;
  featureFlagName: string;
  description: string;
  enabled: boolean;
  toggleFeatureFlag: (FeatureFlagKey: FeatureFlagKey, enabled: boolean) => void;
};

const renderLabel = (featureName: string, description: string) => () => (
  <span>
    <span css={styles.featureFlagTitle}>{`${featureName}.`}</span>
    {` ${description}`}
  </span>
);

export const FeatureFlagCheckBox: React.FC<FeatureFlagCheckBoxProps> = (props) => {
  return (
    <Checkbox
      checked={props.enabled}
      css={styles.featureFlagContainer}
      onChange={(e: any, checked?: boolean) => {
        if (checked !== undefined) {
          props.toggleFeatureFlag(props.featureFlagKey, checked);
        }
      }}
      onRenderLabel={renderLabel(props.featureFlagName, props.description)}
    />
  );
};
