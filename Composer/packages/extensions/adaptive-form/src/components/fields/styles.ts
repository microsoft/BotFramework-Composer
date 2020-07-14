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
    display: flex;

    label: ArrayFieldField;
  `,

  inputFieldContainer: css`
    border-top: 1px solid ${NeutralColors.gray30};
    display: flex;
    padding: 7px 0px;

    label: ArrayFieldInputFieldContainer;
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
    flex: 1 1 0%;
    /* prevents field from overflowing when error present */
    min-width: 0px;

    label: ArrayFieldItemField;
  `,

  schemaFieldOverride: (stacked: boolean) => css`
    display: flex;
    flex-direction: ${stacked ? 'column' : 'row'};
    flex: 1;
    margin: 0;
    /* prevents field from overflowing when error present */
    min-width: 0px;

    & + & {
      margin-left: ${stacked ? 0 : '16px'};
    }

    label: ArrayItemSchemaFieldOverride;
  `,
};

export const unsupportedField = {
  container: css`
    display: flex;
    justify-content: space-between;

    label: UnsupportedFieldContainer;
  `,
  link: {
    root: {
      fontSize: FontSizes.small,
    },
  },
  details: (hidden: boolean) => css`
    display: ${hidden ? 'none' : 'block'};
    height: auto;
    white-space: pre;
    background: ${NeutralColors.gray30};
    overflow-x: scroll;
    overflow-y: none;
    padding: ${hidden ? '0px' : '1rem'};

    label: UnsupportedFieldDetails;
  `,
};

export const objectArrayField = {
  objectItemLabel: css`
    display: flex;

    label: ObjectItemLabel;
  `,

  objectItemValueLabel: css`
    color: ${NeutralColors.gray130};
    flex: 1;
    font-size: 14px;
    margin-left: 7px;
    & + & {
      margin-left: 20px;
    }

    label: ObjectItemValueLabel;
  `,

  objectItemInputField: css`
    flex: 1;
    & + & {
      margin-left: 20px;
    }

    label: ObjectItemInputField;
  `,

  arrayItemField: css`
    flex: 1;
    display: flex;
    min-width: 0;

    label: ArrayItemField;
  `,

  inputFieldContainer: css`
    border-top: 1px solid ${NeutralColors.gray30};
    display: flex;
    padding: 7px 0;

    label: InputFieldContainer;
  `,
};

export const oneOfField = {
  container: css`
    width: 100%;

    label: OneOfField;
  `,
  label: css`
    display: flex;
    justify-content: space-between;

    label: OneOfFieldLabel;
  `,
};
