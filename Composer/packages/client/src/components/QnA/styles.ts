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

export const urlPairStyle = css`
  display: flex;
  max-width: 517px;
`;

export const textFieldKBName = {
  root: {
    width: 400,
    paddingBottom: 20,
  },
};

export const textFieldLocales = {
  root: {
    width: 115,
    marginRight: 20,
    paddingBottom: 20,
    selectors: {
      '.ms-Label': {
        color: NeutralColors.gray160,
      },
    },
  },
};

export const textFieldUrl = {
  root: {
    width: 350,
    paddingBottom: 20,
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
