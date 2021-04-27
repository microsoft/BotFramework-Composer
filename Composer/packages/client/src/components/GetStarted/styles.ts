// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

export const h3Style = css`
  fontSize: ${FontSizes.size14},
  marginTop: '25px',
  fontWeight: ${FontWeights.regular},
  marginBottom: '5px',
`;

export const topH3Style = css`
  fontSize: ${FontSizes.size14},
  marginTop: '10px',
  fontWeight: ${FontWeights.regular},
  marginBottom: '5px',
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
