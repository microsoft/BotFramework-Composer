// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

export const container = css`
  border-top: 1px solid ${NeutralColors.gray30};
  display: flex;

  label: OpenObjectFieldContainer;
`;

export const item = css`
  flex: 1;

  label: OpenObjectFieldItem;
`;
