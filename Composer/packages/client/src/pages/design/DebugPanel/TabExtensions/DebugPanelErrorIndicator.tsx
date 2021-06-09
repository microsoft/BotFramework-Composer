// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { colors } from '../../../../constants';

import { Indicator } from './Indicator';

export const DebugPanelErrorIndicator = (props: { hasError: boolean; hasWarning?: boolean }) => {
  const indicator = props.hasError ? (
    <Indicator color={`${colors.errorIcon}`} />
  ) : props.hasWarning ? (
    <Indicator color={`${colors.warningIcon}`} />
  ) : null;
  return indicator;
};
