// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';

export const instructionStyles = css`
  margin-bottom: 20px;
`;
export const copyPasteStyles = css`
  background: ${NeutralColors.black};
  color: ${NeutralColors.white};
  padding: 15px;
  max-height: 150px;
  overflow: scroll;
  white-space: pre;
`;
copyPasteStyles;

export const dialog = {
  root: {
    maxWidth: 400,
  },
  title: {
    fontWeight: FontWeights.bold,
  },
};
