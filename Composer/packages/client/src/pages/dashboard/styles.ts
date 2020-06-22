// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { css } from '@emotion/core';

export const header = css`
  border-bottom: 1px solid #edebe9;
  height: 90px;
  padding: 14px 38px 8px 29px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const headerText = css`
  font-size: ${FontSizes.xLarge};
  color: #323130;
  font-weight: ${FontWeights.semibold};
`;

export const root = css`
  display: flex;
  height: calc(100vh - 50px);
  flex-direction: column;
`;

export const content = css`
  outline: none;
  margin-top: 24px;
  margin-left: 36px;
`;

export const icon = css`
  vertical-align: middle;
  font-size: 16px;
  width: 24px;
  height: 24px;
  line-height: 24px;
`;
