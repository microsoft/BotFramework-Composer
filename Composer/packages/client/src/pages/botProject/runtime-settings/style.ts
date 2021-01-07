// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';

import { colors } from '../../../colors';

export const runtimeSettingsStyle = css`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

export const runtimeControls = css`
  color: ${colors.gray(130)};
  font-size: ${FontSizes.smallPlus};
  & > h1 {
    margin-top: 0;
  }
`;

export const runtimeToggle = css`
  display: flex;
  margin-top: 10px;
  & > * {
    margin-right: 2rem;
  }
`;

export const modalControlGroup = css`
  border: 1px solid ${colors.gray(30)};
  padding: 0.5rem 1rem 1rem 1rem;
`;

export const runtimeControlsTitle = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};
`;

export const breathingSpace = css`
  margin-bottom: 1rem;
  font-size: ${FontSizes.smallPlus};
`;

export const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

export const customerLabel = (disabled) => css`
  font-size: ${FontSizes.small};
  margin-right: 5px;
  color: ${disabled ? colors.gray(90) : colors.gray(160)};
`;

export const iconStyle = (disabled) => {
  return {
    root: {
      color: disabled ? colors.gray(90) : colors.gray(160),
      selectors: {
        '&::before': {
          content: " '*'",
          color: colors.red,
          paddingRight: 3,
        },
      },
    },
  };
};

export const textOr = css`
  font-size: ${FontSizes.smallPlus};
`;

export const updateText = css`
  font-size: ${FontSizes.smallPlus};
  color: ${colors.gray(130)};
`;
