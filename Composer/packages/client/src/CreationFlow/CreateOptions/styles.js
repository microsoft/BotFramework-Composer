// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

export const optionIcon = checked => css`
  vertical-align: text-bottom;
  font-size: 18px;
  margin-right: 10px;
  color: ${checked ? '#0078d4' : '#000'};
`;

export const optionRoot = css`
  width: 100%;
  height: 100%;
`;

export const detailListContainer = css`
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
`;

export const listHeader = css`
  margin-top: 10px;
  margin-bottom: 0;
`;

export const rowDetails = disabled => {
  return {
    root: {
      color: disabled ? NeutralColors.gray80 : NeutralColors.black,
      selectors: {
        '&:hover': {
          background: disabled ? NeutralColors.white : NeutralColors.gray30,
          color: disabled ? NeutralColors.gray80 : NeutralColors.black,
        },
        '&.ms-DetailsRow.is-selected': {
          background: disabled ? NeutralColors.white : NeutralColors.gray30,
          color: disabled ? NeutralColors.gray80 : NeutralColors.black,
        },
      },
    },
  };
};

export const rowTitle = disabled => {
  return {
    cellTitle: {
      color: disabled ? NeutralColors.gray80 : NeutralColors.black,
      selectors: {
        ':hover': {
          background: disabled ? NeutralColors.white : NeutralColors.gray30,
          color: disabled ? NeutralColors.gray80 : NeutralColors.black,
        },
      },
    },
  };
};

export const tableCell = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
`;

export const content = css`
  outline: none;
`;
