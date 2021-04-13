// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';

export const title = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  margin-left: 22px;
  margin-top: 6px;
`;

export const subtitle = css`
  color: ${NeutralColors.gray130};
  font-size: ${FontSizes.smallPlus};
  & > h1 {
    margin-top: 0;
  }
`;

export const sectionHeader = css`
  font-weight: ${FontWeights.semibold};
  font-size: ${FontSizes.medium};
  padding: 6px 0;
`;

export const tableRow = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 42px;
  width: 750px;
  border-bottom: 1px solid ${NeutralColors.gray30};
`;

export const tableRowItem = (width?: string) => css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.regular};
  padding-left: 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  ${width != null ? `width: ${width};` : ''}
`;

export const tableColumnHeader = (width?: string) => css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.bold};
  padding-top: 10px;
  padding-left: 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  ${width != null ? `width: ${width};` : ''}
`;

export const labelContainer = css`
  display: flex;
  flex-direction: row;
  width: 200px;
`;

export const customerLabel = css`
  font-size: ${FontSizes.medium};
  margin-right: 5px;
`;

export const customError = {
  root: {
    selectors: {
      'p > span': {
        width: '100%',
      },
    },
  },
};

// These bg and icon colors are the standard Fluent ones for Messaging, which
// aren't exported anywhere they can easily be reached
// Docs: https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/messaging

export const errorContainer = css`
  display: flex;
  width: 100%;
  line-height: 20px;
  padding-top: 12px;
  padding-bottom: 12px;
  background: #fed9cc;
  color: ${NeutralColors.black};
`;

export const errorTextStyle = css`
  margin-bottom: 5px;
  font-size: ${FontSizes.small};
`;

export const errorIcon = {
  root: {
    color: '#a80000',
    marginRight: 8,
    paddingLeft: 12,
    fontSize: FontSizes.medium,
  },
};

export const unknownIconStyle = (required: boolean) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: SharedColors.red10,
          paddingRight: 10,
        },
      },
      fontSize: FontSizes.medium,
    },
  };
};

export const columnSizes = ['300px', '150px', '150px'];

export const actionButton = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
    marginLeft: 5,
  },
};
