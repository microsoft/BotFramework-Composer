// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';

import { Indicator } from './Indicator';

export const DebugPanelErrorIndicator = (props: { hasError: boolean; hasWarning?: boolean }) => {
  const indicator = props.hasError ? (
    <Indicator color={`${SharedColors.red10}`} size={5} />
  ) : props.hasWarning ? (
    <Indicator color={`${SharedColors.yellow10}`} size={5} />
  ) : null;
  return indicator;
};
