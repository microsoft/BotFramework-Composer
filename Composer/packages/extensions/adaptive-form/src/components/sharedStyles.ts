// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';

export const focusBorder = css`
  &:focus {
    outline: none !important;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      border: 1px solid black;
    }
  }
`;
