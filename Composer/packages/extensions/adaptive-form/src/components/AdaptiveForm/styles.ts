// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/styling';

export const title = {
  container: css`
    border-bottom: 1px solid #c8c6c4;
    padding: 0 18px;
    margin-bottom: 0px;
  `,

  subtitle: css`
    height: 15px;
    line-height: 15px;
    font-size: 12px;
    font-weight: 600;
    color: #4f4f4f;
    margin: -7px 0 7px;
  `,

  description: css`
    margin-top: 0;
    margin-bottom: 10px;
    white-space: pre-line;
    font-size: ${FontSizes.smallPlus};
  `,
};
