// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IIconStyles } from 'office-ui-fabric-react/lib/Icon';
export const content = css`
  min-height: 28px;
  outline: none;
`;

export const contentAnswer = (showAll: boolean) => css`
  text-overflow: ellipsis;
  height: ${showAll ? 'auto' : '28px'};
  outline: none;
`;

export const formCell = css`
  display: flex;
  flex-direction: column;
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 28px;
`;

export const inlineContainer = (isBold) => css`
  display: inline-block;
  font-weight: ${isBold ? FontWeights.semibold : 400};
`;

export const textFieldQuestion = {
  root: {
    width: 'auto',
    height: 28,
    marginLeft: -5,
  },
  field: {
    width: 'auto',
    paddingLeft: 4,
    marginTop: -5,
  },
};

export const textFieldAnswer = {
  root: {
    minHeight: 28,
    marginLeft: -5,
    marginTop: -1,
  },
  field: {
    lineHeight: 28,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 4,
  },
};

export const link = {
  root: {
    fontSize: 14,
    lineHeight: 28,
  },
};

export const addQnAPairLink = {
  root: {
    fontSize: 14,
    lineHeight: 28,
    marginLeft: 72,
  },
};

export const actionButton = css`
  font-size: 16px;
  margin: 0;
  margin-left: 15px;
`;

export const QnAIconStyle = {
  root: {
    padding: '8px',
    boxSizing: 'border-box',
    width: '40px',
    height: '32px',
  },
} as IIconStyles;

export const firstLine = css`
  display: flex;
  flex-direction: row;
`;

export const divider = css`
  height: 1px;
  background: ${NeutralColors.gray30};
`;

export const rowDetails = {
  root: {
    minHeight: 76,
    selectors: {
      '&:hover': {
        background: NeutralColors.gray30,
      },
      '&:hover .ms-Button--icon': {
        visibility: 'visible',
      },
      '&.is-selected .ms-Button--icon': {
        visibility: 'visible',
      },
    },
  },
};

export const icon = {
  root: {
    color: NeutralColors.black,
    visibility: 'hidden',
    paddingLeft: 18,
  },
};

export const addButtonContainer = css`
  z-index: 1;
  background: ${NeutralColors.white};
`;

export const addAlternativeLink = {
  root: {
    width: 150,
  },
};
