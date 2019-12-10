// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

export const arrayItem = css`
  display: flex;
  align-items: center;
  padding-left: 10px;

  & + & {
    margin-top: 10px;
  }
`;

export const arrayItemValue = css`
  flex: 1;
`;

export const arrayItemDefault = css`
  font-size: 14px;
`;

export const field = css`
  margin: 10px 0;
`;

export const customObjectFieldContainer = css`
  display: flex;

  &:not(:last-child) {
    border-bottom: 1px solid ${NeutralColors.gray30};
  }
`;

export const customObjectFieldItem = css`
  flex: 1;

  & + & {
    margin-left: 20px;
  }
`;

export const customObjectFieldLabel = css`
  color: ${NeutralColors.gray130};
  font-size: 12px;
  margin-left: 7px;
  padding-bottom: 5px;
`;
