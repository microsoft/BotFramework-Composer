// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';

export const bot = css`
  display: flex;
  align-items: center;
  position: relative;
  height: 100%;
`;

export const botButton = css`
  margin-left: 5px;
`;

export const errorInfo = css`
  float: left;
  display: flex;
`;

export const errorButton = css`
  color: ${SharedColors.red20};
  &:hover {
    color: ${SharedColors.red20};
  }
`;

export const errorCount = css`
  height: 32px;
  line-height: 32px;
  font-size 16px;
  cursor: pointer;
  display:inline-block;
`;

export const calloutLabel = css`
  font-size: ${FontSizes.size18};
  font-weight: ${FontWeights.bold};
`;

export const calloutContainer = css`
  width: 400px;
  padding: 10px;
`;

export const calloutDescription = css``;

export const calloutAction = css``;

export const calloutLink = css`
  margin-top: 12px;
  margin-bottom: 24px;
`;
