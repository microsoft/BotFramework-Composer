// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { ITheme, getTheme } from 'office-ui-fabric-react/lib/Styling';

export const settingsContainer = css`
  display: flex;
  border-top: 1px solid ${NeutralColors.gray20};
  padding: 20px 0px;
`;

export const settingsContent = css`
  width: 245px;
  font-size: ${FontSizes.medium};
`;

export const settingsDescription = css`
  margin: 0;
  margin-top: 8px;
`;

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

export const overflowSet = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  line-height: 36px;
  padding-left: 16px;
  padding-right: 5px;
  background: ${NeutralColors.white};
  font-weight: ${FontWeights.semibold};
  font-size: ${FontSizes.small};
  &:hover {
    background: ${NeutralColors.gray20};
    font-weight: ${FontWeights.bold};
  }
`;

export const targetSelected = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  line-height: 36px;
  padding-left: 16px;
  background: ${NeutralColors.gray20};
  font-weight: ${FontWeights.bold};
  font-size: ${FontSizes.small};
  padding-right: 5px;
`;

export const resourcesListContainer = css`
  border: 1px solid #979797;
  margin-top: 20px;
  position: relative;
  min-width: 260px;
  flex: 1;
  min-height: 582px;
`;

const theme: ITheme = getTheme();
const { palette } = theme;
export const resourcesListCell = css`
  min-height: 54px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  &:focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
  &:hover {
    background: ${palette.neutralLight};
  }
`;

export const resourcesListCellContent = css`
  margin-left: 16px;
  overflow: hidden;
  flex: 1;
`;

export const customPublishUISurface = css`
  min-height: 300px;
`;
