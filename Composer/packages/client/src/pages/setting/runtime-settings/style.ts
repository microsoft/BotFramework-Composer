// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
export const runtimeSettingsStyle = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

export const runtimeControls = css`
  margin-bottom: 18px;

  & > h1 {
    margin-top: 0;
  }
`;

export const runtimeToggle = css`
  display: flex;

  & > * {
    margin-right: 2rem;
  }
`;

export const controlGroup = css`
  border: 1px solid rgb(237, 235, 233);
  padding: 0.5rem 1rem 1rem 1rem;
`;

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
