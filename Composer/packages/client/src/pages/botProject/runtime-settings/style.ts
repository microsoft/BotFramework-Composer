// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
export const runtimeSettingsStyle = css`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

export const runtimeControls = css`
  color: ${NeutralColors.gray130};
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

// export const controlGroup = css`
//   border: 1px solid rgb(237, 235, 233);
//   padding: 0.5rem 1rem 1rem 1rem;
// `;

export const modalControlGroup = css`
  border: 1px solid rgb(237, 235, 233);
  padding: 0.5rem 1rem 1rem 1rem;
`;

export const runtimeControlsTitle = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};
`;

export const breathingSpace = css`
  margin-bottom: 1rem;
`;

export const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

export const customerLabel = (disabled) => css`
  font-size: ${FontSizes.small};
  margin-right: 5px;
  color: ${disabled ? NeutralColors.gray90 : NeutralColors.gray160};
`;

export const iconStyle = (disabled) => {
  return {
    root: {
      color: disabled ? NeutralColors.gray90 : NeutralColors.gray160,
    },
  };
};
