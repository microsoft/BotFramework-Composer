// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';

import { colors } from '../../colors';

export const consoleStyle = css`
  background: ${colors.black};
  color: ${colors.textOnColor};
  padding: 15px;
  margin-bottom: 20px;
`;
export const dialogSubTitle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
`;

export const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};
