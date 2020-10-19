// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment } from 'react';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { FeatureFlag, FeatureFlagNames } from '@bfc/shared';

import * as styles from './styles';

type FeatureFlagToggleProps = {
  featureFlagName: string;
  description: string;
  value: boolean;
  setFeatureFlag: (featureFlagName: string, value: boolean) => {};
};

const renderLabel = (featureName: string, description: string) => (
  props: any,
  defaultRender?: (props: any) => JSX.Element | null
) => {
  return (
    <span>
      <span css={styles.featureFlagTitle}>{`${featureName}.`}</span>
      {` ${description}`}
    </span>
  );
};

export const FeatureFlagToggle: React.FC<FeatureFlagToggleProps> = (props) => {
  return (
    <Checkbox
      checked={props.value}
      css={styles.featureFlagContainer}
      onChange={(e: any, checked?: boolean) => {
        if (checked !== undefined) {
          props.setFeatureFlag(props.featureFlagName, checked);
        }
      }}
      onRenderLabel={renderLabel(props.featureFlagName, props.description)}
    />
  );
};
