// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';
import { FontSizes } from '@uifabric/fluent-theme';

import { colors } from '../../colors';

export const styles = {
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
    },
  },
  modal: {
    main: {
      maxWidth: '600px !important',
    },
  },
};

export const dialogWindow = css`
  display: flex;
  flex-direction: column;
  width: 552px;
  min-height: 254px;
`;

export const dialogWindowMini = css`
  display: flex;
  flex-direction: column;
  width: 552px;
  min-height: 308px;
`;

export const textField = {
  root: {
    width: '400px',
    paddingBottom: '20px',
  },
};

export const warning = {
  color: colors.red,
  fontSize: FontSizes.size10,
};

export const subText = css`
  color: ${colors.gray(130)};
  font-size: 14px;
  font-weight: 400;
`;
