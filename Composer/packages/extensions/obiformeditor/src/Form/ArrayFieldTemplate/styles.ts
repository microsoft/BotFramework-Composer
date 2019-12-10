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
  display: flex;
`;

export const arrayItemInputFieldContainer = css`
  display: flex;
  padding: 7px 0;
`;

export const objectItemLabel = css`
  border-bottom: 1px solid ${NeutralColors.gray30};
  display: flex;
`;

export const objectItemValueLabel = css`
  color: ${NeutralColors.gray130};
  flex: 1;
  font-size: 14px;
  margin-left: 7px;
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
