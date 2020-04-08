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

export const hostedControls = css`
  margin-bottom: 18px;

  & > h1 {
    margin-top: 0;
  }
`;

export const slotChoice = css`
  max-width: 40ch;
`;

export const settingsEditor = css`
  flex: 1;
  max-height: 70%;
`;

export const hostedControlsTitle = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};
`;
