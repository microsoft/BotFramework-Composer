// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

export const arrayItem = css`
  display: flex;
  padding: 4px 0;

  border-top: 1px solid ${NeutralColors.gray30};
`;

export const arrayItemInputFieldContainer = css`
  border-top: 1px solid ${NeutralColors.gray30};
  display: flex;
  padding: 8px 0;
`;

export const objectItemLabel = css`
  display: flex;
`;

export const objectItemValueLabel = css`
  color: ${NeutralColors.gray130};
  flex: 1;
  font-size: 14px;
  margin-left: 4px;
  & + & {
    margin-left: 20px;
  }
`;

export const objectItemInputField = css`
  flex: 1;
  & + & {
    margin-left: 20px;
  }
`;
