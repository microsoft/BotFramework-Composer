// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { FontSizes } from '@uifabric/styling';

export const arrayField = {
  field: css`
    flex: 1;
    margin-top: 0;
    margin-bottom: 0;
  `,

  inputFieldContainer: css`
    border-top: 1px solid ${NeutralColors.gray30};
    display: flex;
    padding: 7px 0px;
  `,
};

export const arrayItem = {
  container: css`
    border-top: 1px solid ${NeutralColors.gray30};
    display: flex;
    padding: 7px 0;

    label: ArrayFieldItemContainer;
  `,

  field: css`
    display: flex;
    flex: 1;
    margin: 0;

    & + & {
      margin-left: 16px;
    }

    label: ArrayFieldItemField;
  `,
};

export const objectItemLabel = css`
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

export const unsupportedField = {
  container: css`
    display: flex;
    justify-content: space-between;
  `,
  link: {
    root: {
      fontSize: FontSizes.small,
    },
  },
  details: (hidden: boolean) => css`
    display: block;
    height: ${hidden ? '0px' : 'auto'};
    white-space: pre;
    background: ${NeutralColors.gray30};
    overflow-x: scroll;
    overflow-y: none;
    padding: ${hidden ? '0px' : '1rem'};
  `,
};

export const openObjectField = {
  container: css`
    border-top: 1px solid ${NeutralColors.gray30};
    display: flex;
  `,
  filler: css`
    width: 32px;
  `,
  item: css`
    flex: 1;

    & + & {
      margin-left: 16px;
    }
  `,
  label: css`
    flex: 1;
    padding-left: 8px;

    & + & {
      margin-left: 16px;
    }
  `,
  labelContainer: css`
    display: flex;
  `,
};

export const objectArrayField = {
  objectItemLabel: css`
    display: flex;
  `,

  objectItemValueLabel: css`
    color: ${NeutralColors.gray130};
    flex: 1;
    font-size: 14px;
    margin-left: 7px;
    & + & {
      margin-left: 20px;
    }
  `,

  objectItemInputField: css`
    flex: 1;
    & + & {
      margin-left: 20px;
    }
  `,

  arrayItemField: css`
    flex: 1;
    display: flex;
    min-width: 0;
  `,

  inputFieldContainer: css`
    border-top: 1px solid ${NeutralColors.gray30};
    display: flex;
    padding: 7px 0;
  `,
};
