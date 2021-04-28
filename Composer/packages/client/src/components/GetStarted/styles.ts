// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

export const h3Style = css`
  font-size: ${FontSizes.size14};
  margin-top: 24px;
  font-weight: ${FontWeights.regular};
  margin-bottom: 4px;
`;

export const topH3Style = css`
  font-size: ${FontSizes.size14};
  margin-top: 12px;
  font-weight: ${FontWeights.regular};
  margin-bottom: 4px;
`;

export const ulStyle = {
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  marginBottom: 20,
};

export const liStyle = {
  paddingTop: '5px',
};
