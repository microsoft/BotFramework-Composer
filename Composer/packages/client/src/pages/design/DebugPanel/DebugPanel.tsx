// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { debugPaneCollapsedStyle } from './styles';
export const DebugPanel = () => {
  return <div css={debugPaneCollapsedStyle}>Debug Panel</div>;
};
