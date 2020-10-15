// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';
import { FontSizes, SharedColors, NeutralColors } from '@uifabric/fluent-theme';

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
      maxWidth: '800px !important',
    },
  },
};

export const dialogWindow = css`
  display: flex;
  flex-direction: column;
  width: 400px;
  min-height: 200px;
`;

export const dialogWindowMini = css`
  display: flex;
  flex-direction: column;
  width: 400px;
  min-height: 100px;
`;

export const textField = {
  root: {
    width: '400px',
    paddingBottom: '20px',
  },
};

export const warning = {
  color: SharedColors.red10,
  fontSize: FontSizes.size10,
};

export const subText = css`
  color: ${NeutralColors.gray130};
  font-size: 14px;
  font-weight: 400;
`;
