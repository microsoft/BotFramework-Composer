// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';
import { FontSizes } from '@uifabric/fluent-theme';

export const dialogContentStyles = {
  title: {
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.size20,
    paddingTop: '14px',
    paddingBottom: '11px',
  },
  subText: {
    fontSize: FontSizes.size14,
  },
};
export const modalStyles = {
  main: {
    maxWidth: '600px !important',
  },
};

export const dropdownStyles = {
  label: {
    fontWeight: FontWeights.semibold,
  },
  dropdown: {
    width: '400px',
  },
  root: {
    marginBottom: '20px',
  },
};

export const dialogWindowStyles = css`
  display: flex;
  flex-direction: column;
  width: 400px;
  min-height: 300px;
`;

export const intentStyles = {
  root: {
    width: '400px',
    paddingBottom: '20px',
  },
};

export const optionStyles = {
  display: 'flex',
  height: '15px',
  fontSize: '15px',
};

export const warningIconStyles = {
  marginLeft: '5px',
  color: '#BE880A',
  fontSize: '12px',
};
