// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
export const hostedSettings = css`
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

export const settingsEditor = css`
  flex: 1;
  height: 500px;
`;

export const hostedControlsTitle = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};
`;

export const toolbar = css`
  margin-bottom: 10px;
  display: flex;
  > button {
    margin-left: 20px;
    margin-top: 20px;
  }
`;
