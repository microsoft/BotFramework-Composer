// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

export const arrayItem = css`
  display: flex;
  padding: 7px 0;

  border-bottom: 1px solid ${NeutralColors.gray30};

  &:first-type-of {
    border-top: 1px solid ${NeutralColors.gray30};
  }
`;

export const arrayItemField = css`
  flex: 1;
`;

export const arrayItemInputFieldContainer = css`
  display: flex;
  padding: 7px 0;
`;
