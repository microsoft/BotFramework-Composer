// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

export const field = css`
  margin: 10px 0;
`;

export const assignmentItemContainer = (align = 'center') => css`
  display: flex;
  flex-wrap: wrap;
  align-items: ${align};
`;

export const assignmentField = css`
  margin-bottom: 7px;
`;

export const assignmentItem = css`
  border-bottom: 1px solid ${NeutralColors.gray30};
`;

export const assignmentItemValue = css`
  flex: 1;

  & + & {
    margin-left: 20px;
  }
`;

export const assignmentItemLabel = css`
  border-bottom: 1px solid ${NeutralColors.gray30};
  padding-bottom: 7px;
`;

export const assignmentItemValueLabel = css`
  color: ${NeutralColors.gray130};
  font-size: 12px;
  margin-left: 7px;
`;

export const assignmentItemErrorMessage = css`
  flex-basis: 100%;
  min-width: 0;
`;
