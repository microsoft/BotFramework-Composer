// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

import { colors } from '../../colors';

export const hidden = css`
  display: none;
`;

export const dialogContent = css`
  font-size: 16px;
  white-space: normal;
`;

export const boldBlueText = css`
  font-weight: ${FontWeights.semibold};
  color: ${colors.main};
  word-break: break-work;
`;

export const boldText = css`
  font-weight: ${FontWeights.semibold};
  word-break: break-work;
`;
