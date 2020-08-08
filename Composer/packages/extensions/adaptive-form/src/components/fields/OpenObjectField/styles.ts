// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

export const container = css`
  border-top: 1px solid ${NeutralColors.gray30};
  display: flex;

  label: OpenObjectFieldContainer;
`;

export const itemContainer = (stackedLayout?: boolean) => css`
  display: flex;
  flex: 1;
  flex-direction: ${stackedLayout ? 'column' : 'row'};

  label: OpenObjectFieldItemContainer;
`;

export const addButtonContainer = css`
  border-top: 1px solid ${NeutralColors.gray30};
  padding: 8px 0;
`;

export const filler = css`
  width: 32px;

  label: OpenObjectFieldFiller;
`;

export const item = (stackedLayout?: boolean) => css`
  flex: 1;

  & + & {
    margin-left: ${!stackedLayout ? '16px' : '0'};
  }

  label: OpenObjectFieldItem;
`;

export const label = css`
  flex: 1;
  padding-left: 8px;

  & + & {
    margin-left: 16px;
  }

  label: OpenObjectFieldLabel;
`;

export const labelContainer = css`
  display: flex;

  label: OpenObjectFieldLabelContainer;
`;
