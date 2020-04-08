// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';

export const ContentHeaderStyle = css`
  padding: 5px 20px;
  height: 60px;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  align-items: center;
`;
export const HeaderText = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};
  margin-right: 10px;
`;

export const ContentStyle = css`
  margin-left: 2px;
  display: flex;
  border-top: 1px solid #dddddd;
  flex: 1;
  position: relative;
  nav {
    ul {
      margin-top: 0px;
    }
  }
`;
export const contentEditor = css`
  flex: 4;
  height: calc(100vh - 200px);
  position: relative;
  overflow: visible;
`;

export const publishDialogText = css`
  background-color: #ddf3db;
  margin-bottom: 10px;
  font-size: medium;
  padding: 7px;
`;

export const historyPanelTitle = css`
  font-size: ${FontSizes.xLarge};
  font-weight: 600;
  margin-right: 10px;
`;

export const historyPanelSub = css`
  font-size: ${FontSizes.small};
`;

export const targetListTiTle = css`
  height: 32px;
  font-size: ${FontSizes.medium};
  padding-left: 16px;
  padding-top: 6px;
  padding-right: 0;
  font-weight: 600;
`;

export const targetListItemNotSelected: IButtonStyles = {
  root: {
    background: NeutralColors.white,
    fontWeight: FontWeights.semilight,
    height: '32px',
    fontSize: FontSizes.small,
    paddingLeft: '16px',
    paddingRight: 0,
    border: 0,
    textAlign: 'left',
    marginLeft: 0,
    marginRight: 0,
  },
};
export const targetListItemSelected: IButtonStyles = {
  root: {
    background: NeutralColors.gray20,
    fontWeight: FontWeights.semibold,
    height: '32px',
    fontSize: FontSizes.small,
    paddingLeft: '16px',
    paddingRight: 0,
    border: 0,
    textAlign: 'left',
    marginLeft: 0,
    marginRight: 0,
  },
};

export const select = css`
  background: ${NeutralColors.gray20};
  fontweight: ${FontWeights.semibold};
`;

export const listRoot = css`
  position: relative;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

export const tableView = css`
  position: relative;
  flex-grow: 1;
`;

export const detailList = css`
  overflow-x: hidden;
`;

export const label = css`
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  padding: 5px 0px;
`;
