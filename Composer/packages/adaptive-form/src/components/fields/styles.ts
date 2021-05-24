// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { FontSizes } from '@uifabric/styling';

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

  schemaFieldOverride: css`
    flex: 1;
    margin: 0;
    /* prevents field from overflowing when error present */
    min-width: 0px;

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
