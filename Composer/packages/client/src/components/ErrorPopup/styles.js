// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

export const consoleStyle = css`
  background: ${NeutralColors.black};
  color: ${NeutralColors.white};
  padding: 15px;
  margin-bottom: 20px;

  a {
    color: ${SharedColors.blueMagenta10};
  }
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
