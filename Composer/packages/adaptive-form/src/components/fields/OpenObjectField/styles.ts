// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/react';
import { NeutralColors } from '@fluentui/theme';

export const container = css`
  border-top: 1px solid ${NeutralColors.gray30};
  display: flex;

  label: OpenObjectFieldContainer;
`;

export const item = css`
  flex: 1;

  label: OpenObjectFieldItem;
`;
