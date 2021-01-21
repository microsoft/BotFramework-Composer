// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';

export const title = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  margin-left: 22px;
  margin-top: 6px;
`;

export const subtitle = css`
  color: ${NeutralColors.gray130};
  font-size: ${FontSizes.smallPlus};
  & > h1 {
    margin-top: 0;
  }
`;
