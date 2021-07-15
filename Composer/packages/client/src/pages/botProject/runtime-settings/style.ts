// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
export const runtimeSettingsStyle = css`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

export const iconStyle = (disabled) => {
  return {
    root: {
      color: disabled ? NeutralColors.gray90 : NeutralColors.gray160,
      selectors: {
        '&::before': {
          content: " '*'",
          color: SharedColors.red10,
          paddingRight: 3,
        },
      },
    },
  };
};
