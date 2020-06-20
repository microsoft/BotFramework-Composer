// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';

const DisabledColor = '#656565';

export const DisabledContainer = css`
  outline: 1px solid ${DisabledColor};
  background: transparent;
`;

export const DisabledText = css`
  color: ${DisabledColor};
`;

export const DisabledIconColor = DisabledColor;
