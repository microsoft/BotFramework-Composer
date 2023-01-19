// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/react';
import { FontWeights, FontSizes } from '@fluentui/react/lib/Styling';
import { NeutralColors, SharedColors } from '@fluentui/theme';

export const consoleStyle = css`
  background: ${NeutralColors.gray20};
  padding: 15px;
  margin-bottom: 20px;
  overflow-y: auto;
  max-height: 434px;

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
